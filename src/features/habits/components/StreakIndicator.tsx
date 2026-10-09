import { useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import { colors } from '../../../design-system/tokens/colors';
import { typography } from '../../../design-system/tokens/typography';

export function StreakIndicator({
  value,
  recordId,
}: {
  value: number;
  recordId?: number;
}) {
  const label = value === 1 ? 'dia seguido' : 'dias seguidos';
  const opacity = useAnimatedValue(1);
  const showRecord = recordId !== undefined;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.65,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, value]);

  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityLabel={value + ' ' + label}
        style={styles.metric}
      >
        <Animated.Text style={[styles.value, { opacity }]}>
          {value}
        </Animated.Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      {showRecord && (
        <Text accessibilityLiveRegion="polite" style={styles.record}>
          NOVO RECORDE
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-end' },
  metric: { alignItems: 'flex-end' },
  value: {
    ...typography.metric,
    lineHeight: typography.metric.fontSize,
    includeFontPadding: false,
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    includeFontPadding: false,
    color: colors.textSecondary,
  },
  record: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accent,
  },
});
