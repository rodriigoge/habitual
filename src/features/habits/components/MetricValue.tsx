import { useEffect, useRef } from 'react';
import {
  Animated,
  useAnimatedValue,
  type StyleProp,
  type TextStyle,
} from 'react-native';

export function MetricValue({
  value,
  suffix,
  style,
}: {
  value: number;
  suffix: string;
  style?: StyleProp<TextStyle>;
}) {
  const opacity = useAnimatedValue(1);
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.65,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, opacity]);

  return (
    <Animated.Text style={[style, { opacity }]}>
      {value} {suffix}
    </Animated.Text>
  );
}
