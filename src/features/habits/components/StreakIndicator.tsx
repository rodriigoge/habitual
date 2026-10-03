import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../design-system/tokens/colors';
import { typography } from '../../../design-system/tokens/typography';

export function StreakIndicator({ value }: { value: number }) {
  const label = value === 1 ? 'dia seguido' : 'dias seguidos';
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={styles.container}
    >
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { alignItems: 'flex-end' },
  value: { ...typography.metric, color: colors.textPrimary },
  label: { ...typography.caption, color: colors.textSecondary },
});
