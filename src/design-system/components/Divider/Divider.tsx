import { StyleSheet, View } from 'react-native';
import { colors } from '../../tokens/colors';

export function Divider() {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.line}
    />
  );
}
const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    alignSelf: 'stretch',
  },
});
