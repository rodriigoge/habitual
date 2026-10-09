import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, LayoutAnimation, Platform, UIManager } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';
import { getToday, toLocalDate } from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';
import type { Habit } from '../domain/Habit';
import { normalizeHabitName } from '../domain/HabitInput';
import { validateCompletionDate } from '../domain/validateCompletionDate';
import { SQLiteHabitRepository } from '../repository/SQLiteHabitRepository';
import { calculateHabitMetrics } from '../domain/calculateHabitMetrics';

export type HabitWithHistory = Habit & { completedDates: LocalDate[] };
type PendingDay = {
  habitId: string;
  settled?: Promise<void>;
  confirmed: boolean;
  desired: boolean;
  revision: number;
};

function animateHabitListChange() {
  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

export function useHabitsState() {
  const db = useSQLiteContext();
  const repository = useMemo(() => new SQLiteHabitRepository(db), [db]);
  const [habits, setHabits] = useState<HabitWithHistory[]>([]);
  const history = useRef<HabitWithHistory[]>([]);
  const deleting = useRef(new Set<string>());
  const pending = useRef(new Map<string, PendingDay>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [completionError, setCompletionError] = useState<{
    habitId: string;
    message: string;
  }>();
  const [recordFeedback, setRecordFeedback] = useState<{
    habitId: string;
    id: number;
  }>();
  const recordId = useRef(0);
  const recordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [today, setToday] = useState(getToday);
  const [attempt, setAttempt] = useState(0);

  // Event callbacks need the latest optimistic history even before React renders.
  const updateHabits = useCallback(
    (update: (current: HabitWithHistory[]) => HabitWithHistory[]) => {
      history.current = update(history.current);
      setHabits(history.current);
    },
    [],
  );

  const refresh = useCallback(() => {
    setLoading(true);
    setError(undefined);
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const stored = await repository.findAll();
        const result = await Promise.all(
          stored.map(async (habit) => ({
            ...habit,
            completedDates: (await repository.getCompletions(habit.id)).map(
              (item) => item.date,
            ),
          })),
        );
        if (active) updateHabits(() => result);
      } catch {
        if (active)
          setError('Não foi possível carregar seus hábitos. Tente novamente.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [repository, attempt, updateHabits]);

  useEffect(
    () => () => {
      if (recordTimer.current) clearTimeout(recordTimer.current);
    },
    [],
  );

  useEffect(() => {
    const updateDay = () => setToday(getToday());
    const interval = setInterval(updateDay, 60_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') updateDay();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  async function createHabit(name: string) {
    const habit = await repository.create({ name: normalizeHabitName(name) });
    animateHabitListChange();
    updateHabits((current) => [...current, { ...habit, completedDates: [] }]);
  }

  async function updateHabit(id: string, name: string) {
    const updated = await repository.update(id, {
      name: normalizeHabitName(name),
    });
    updateHabits((current) =>
      current.map((habit) =>
        habit.id === id ? { ...habit, ...updated } : habit,
      ),
    );
  }

  async function deleteHabit(id: string) {
    if (deleting.current.has(id)) return;
    deleting.current.add(id);
    try {
      // Finish this habit's queued toggles before deleting; SQLite owns cascade.
      await Promise.all(
        [...pending.current.values()]
          .filter((item) => item.habitId === id)
          .map((item) => item.settled),
      );
      await repository.delete(id);
      animateHabitListChange();
      updateHabits((current) => current.filter((habit) => habit.id !== id));
      setCompletionError((current) =>
        current?.habitId === id ? undefined : current,
      );
    } finally {
      deleting.current.delete(id);
    }
  }

  function setDay(habitId: string, date: LocalDate, completed: boolean) {
    updateHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId) return habit;
        const dates = habit.completedDates.filter((item) => item !== date);
        return {
          ...habit,
          completedDates: completed ? [...dates, date] : dates,
        };
      }),
    );
  }

  function toggleDay(habitId: string, date: LocalDate) {
    const habit = history.current.find((item) => item.id === habitId);
    if (!habit || deleting.current.has(habitId)) return;
    const currentDay = getToday();
    setToday(currentDay);
    try {
      validateCompletionDate(
        date,
        toLocalDate(new Date(habit.createdAt)),
        currentDay,
      );
    } catch {
      setCompletionError({
        habitId,
        message: 'Essa data não está disponível para conclusão.',
      });
      return;
    }
    setCompletionError(undefined);
    const previousBest = calculateHabitMetrics(
      habit.completedDates,
      currentDay,
    ).bestStreak;
    const completed = habit.completedDates.includes(date);
    setDay(habitId, date, !completed);
    const key = JSON.stringify([habitId, date]);
    const existing = pending.current.get(key);
    if (existing) {
      existing.desired = !completed;
      existing.revision += 1;
      return;
    }
    const operation: PendingDay = {
      habitId,
      confirmed: completed,
      desired: !completed,
      revision: 0,
    };
    pending.current.set(key, operation);

    async function persist() {
      try {
        // One write per date at a time. Further taps change the desired state
        // immediately; redundant intermediate states do not need extra writes.
        while (operation.desired !== operation.confirmed) {
          const revision = operation.revision;
          operation.confirmed = await repository.toggleCompletion(
            habitId,
            date,
          );
          if (operation.revision === revision)
            operation.desired = operation.confirmed;
        }
        setDay(habitId, date, operation.confirmed);
        if (operation.confirmed) {
          const updated = history.current.find((item) => item.id === habitId);
          const nextBest = updated
            ? calculateHabitMetrics(updated.completedDates, currentDay)
                .bestStreak
            : previousBest;
          if (nextBest > previousBest) {
            if (recordTimer.current) clearTimeout(recordTimer.current);
            setRecordFeedback({ habitId, id: ++recordId.current });
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
            recordTimer.current = setTimeout(() => {
              setRecordFeedback(undefined);
              recordTimer.current = null;
            }, 850);
          }
        }
      } catch {
        // Restore only this date, preserving concurrent edits on other dates.
        setDay(habitId, date, operation.confirmed);
        setCompletionError({
          habitId,
          message: 'Não foi possível salvar a conclusão. Tente novamente.',
        });
      } finally {
        pending.current.delete(key);
      }
    }
    operation.settled = persist();
  }

  return {
    habits,
    loading,
    error,
    completionError,
    recordFeedback,
    today,
    refresh,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleDay,
  };
}
