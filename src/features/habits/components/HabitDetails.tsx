import { DeleteHabitConfirmation } from './DeleteHabitConfirmation';
import { HabitFormSheet } from './HabitFormSheet';
import { HabitCalendar } from './HabitCalendar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../design-system/components/Button/Button';
import { IconButton } from '../../../design-system/components/IconButton/IconButton';
import { Divider } from '../../../design-system/components/Divider/Divider';
import { colors } from '../../../design-system/tokens/colors';
import { spacing } from '../../../design-system/tokens/spacing';
import { typography } from '../../../design-system/tokens/typography';
import { useHabits } from '../hooks/useHabits';
import { useHabitMetrics } from '../hooks/useHabitMetrics';
import type { HabitWithHistory } from '../hooks/useHabits';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { StreakIndicator } from './StreakIndicator';
import { MetricValue } from './MetricValue';

export function HabitDetails({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const { habits, today, loading, error, refresh } = useHabits();
  const habit = habits.find((item) => item.id === id);
  return (
    <SafeAreaView style={styles.screen}>
      {habit ? (
        <DetailsContent habit={habit} today={today} onBack={onBack} />
      ) : (
        <View style={styles.content}>
          <Button label="Voltar" variant="secondary" onPress={onBack} />
          <Text
            accessibilityRole={error ? 'alert' : undefined}
            style={styles.body}
          >
            {loading
              ? 'Carregando hábito…'
              : (error ?? 'Hábito não encontrado.')}
          </Text>
          {error && <Button label="Tentar novamente" onPress={refresh} />}
        </View>
      )}
    </SafeAreaView>
  );
}

function DetailsContent({
  habit,
  today,
  onBack,
}: {
  habit: HabitWithHistory;
  today: LocalDate;
  onBack: () => void;
}) {
  const {
    toggleDay,
    completionError,
    recordFeedback,
    updateHabit,
    deleteHabit,
  } = useHabits();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const metrics = useHabitMetrics(habit.completedDates, today);
  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        accessibilityElementsHidden={editing || confirmingDelete}
        importantForAccessibility={
          editing || confirmingDelete ? 'no-hide-descendants' : 'auto'
        }
      >
        <View style={styles.toolbar}>
          <IconButton
            accessibilityLabel="Voltar"
            onPress={onBack}
            renderIcon={({ color, size }) => (
              <Text style={{ color, fontSize: size }}>‹</Text>
            )}
          />
          <IconButton
            accessibilityLabel="Opções do hábito"
            onPress={() => setMenuOpen(!menuOpen)}
            renderIcon={({ color, size }) => (
              <Text style={{ color, fontSize: size }}>⋯</Text>
            )}
          />
        </View>
        {menuOpen && (
          <View style={styles.menu}>
            <Button
              label="Editar hábito"
              variant="secondary"
              onPress={() => {
                setMenuOpen(false);
                setEditing(true);
              }}
            />
            <Button
              label="Excluir hábito"
              variant="danger"
              onPress={() => {
                setMenuOpen(false);
                setConfirmingDelete(true);
              }}
            />
          </View>
        )}
        <Text accessibilityRole="header" style={styles.title}>
          {habit.name}
        </Text>
        <View style={styles.metrics}>
          <StreakIndicator
            value={metrics.currentStreak}
            recordId={
              recordFeedback?.habitId === habit.id
                ? recordFeedback.id
                : undefined
            }
          />
          <MetricValue
            value={metrics.totalCompletions}
            suffix={metrics.totalCompletions === 1 ? 'conclusão' : 'conclusões'}
            style={styles.body}
          />
          <Text
            accessibilityLabel={`Melhor sequência: ${metrics.bestStreak} ${metrics.bestStreak === 1 ? 'dia' : 'dias'}`}
            style={styles.body}
          >
            Melhor sequência: {metrics.bestStreak}{' '}
            {metrics.bestStreak === 1 ? 'dia' : 'dias'}
          </Text>
        </View>
        <Divider />
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Histórico
        </Text>
        <HabitCalendar
          key={habit.id}
          habit={habit}
          today={today}
          onToggleDay={(date) => toggleDay(habit.id, date)}
        />
        {completionError?.habitId === habit.id && (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.error}
          >
            {completionError.message}
          </Text>
        )}
      </ScrollView>
      {editing && (
        <HabitFormSheet
          mode="edit"
          initialName={habit.name}
          onSave={(name) => updateHabit(habit.id, name)}
          onClose={() => setEditing(false)}
        />
      )}
      {confirmingDelete && (
        <DeleteHabitConfirmation
          name={habit.name}
          onDelete={() => deleteHabit(habit.id)}
          onCancel={() => setConfirmingDelete(false)}
          onDeleted={onBack}
        />
      )}
    </>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between' },
  menu: { gap: spacing.sm },
  title: { ...typography.title, color: colors.textPrimary },
  sectionTitle: { ...typography.habitName, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  error: { ...typography.caption, color: colors.danger },
  metrics: { alignItems: 'flex-start', gap: spacing.sm },
});
