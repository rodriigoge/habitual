import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Divider } from '../src/design-system/components/Divider/Divider';
import { IconButton } from '../src/design-system/components/IconButton/IconButton';
import { colors } from '../src/design-system/tokens/colors';
import { radius } from '../src/design-system/tokens/radius';
import { spacing } from '../src/design-system/tokens/spacing';
import { typography } from '../src/design-system/tokens/typography';
import { HabitCard } from '../src/features/habits/components/HabitCard';
import { getHomeMockHabits } from '../src/features/habits/mocks/homeHabits';
import { formatLocalDate, getToday } from '../src/shared/date/dateUtils';

export default function Home() {
  const today = getToday();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <FlatList
          data={getHomeMockHabits(today)}
          keyExtractor={(habit) => habit.id}
          renderItem={({ item }) => <HabitCard habit={item} today={today} />}
          ItemSeparatorComponent={Divider}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text accessibilityRole="header" style={styles.title}>
                Meus hábitos
              </Text>
              <Text style={styles.date}>
                {formatLocalDate(today, { day: 'numeric', month: 'long' })}
              </Text>
            </View>
          }
        />
        <View style={styles.action}>
          <IconButton
            accessibilityLabel="Criar hábito"
            accessibilityHint="Disponível em uma próxima etapa."
            disabled
            renderIcon={({ color, size }) => (
              <Text style={{ color, fontSize: size }}>+</Text>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl * 2 },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: { ...typography.title, color: colors.textPrimary },
  date: { ...typography.body, color: colors.textSecondary },
  action: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
});
