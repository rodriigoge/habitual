import { useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../design-system/components/Button/Button';
import { colors } from '../../../design-system/tokens/colors';
import { radius } from '../../../design-system/tokens/radius';
import { spacing } from '../../../design-system/tokens/spacing';
import { typography } from '../../../design-system/tokens/typography';

export function DeleteHabitConfirmation({
  name,
  onDelete,
  onCancel,
  onDeleted,
}: {
  name: string;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const sending = useRef(false);
  const cancel = () => {
    if (!sending.current) onCancel();
  };

  async function confirm() {
    if (sending.current) return;
    sending.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPending(true);
    setError(undefined);
    try {
      await onDelete();
      onDeleted();
    } catch {
      setError('Não foi possível excluir o hábito. Tente novamente.');
    } finally {
      sending.current = false;
      setPending(false);
    }
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={cancel}>
      <View style={styles.backdrop} />
      <SafeAreaView
        style={styles.container}
        accessibilityViewIsModal
        onAccessibilityEscape={cancel}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.dialog}>
            <Text accessibilityRole="header" style={styles.title}>
              Excluir {name}?
            </Text>
            <Text style={styles.body}>
              Todo o histórico deste hábito será removido. Esta ação não pode
              ser desfeita.
            </Text>
            {error && (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.error}
              >
                {error}
              </Text>
            )}
            <Button
              label={pending ? 'Excluindo…' : 'Excluir hábito'}
              variant="danger"
              disabled={pending}
              onPress={() => {
                void confirm();
              }}
            />
            <Button
              label="Cancelar"
              variant="secondary"
              disabled={pending}
              onPress={cancel}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.textPrimary,
    opacity: 0.25,
  },
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  dialog: {
    backgroundColor: colors.background,
    borderRadius: radius.control,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  title: { ...typography.title, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  error: { ...typography.caption, color: colors.danger },
});
