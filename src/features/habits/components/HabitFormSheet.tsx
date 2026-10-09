import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../design-system/components/Button/Button';
import { TextField } from '../../../design-system/components/TextField/TextField';
import { colors } from '../../../design-system/tokens/colors';
import { radius } from '../../../design-system/tokens/radius';
import { spacing } from '../../../design-system/tokens/spacing';
import { typography } from '../../../design-system/tokens/typography';
import {
  MAX_HABIT_NAME_LENGTH,
  normalizeHabitName,
} from '../domain/HabitInput';

export function HabitFormSheet({
  onSave,
  mode = 'create',
  initialName = '',
  onClose,
}: {
  mode?: 'create' | 'edit';
  initialName?: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const sending = useRef(false);
  const input = useRef<TextInput>(null);
  const valid =
    name.trim().length > 0 && name.trim().length <= MAX_HABIT_NAME_LENGTH;

  async function submit() {
    if (!valid || sending.current) return;
    sending.current = true;
    setSubmitting(true);
    setError(undefined);
    try {
      await onSave(normalizeHabitName(name));
      onClose();
    } catch {
      setError(
        mode === 'edit'
          ? 'Não foi possível salvar o hábito. Tente novamente.'
          : 'Não foi possível criar o hábito. Tente novamente.',
      );
    } finally {
      sending.current = false;
      setSubmitting(false);
    }
  }

  function close() {
    if (!sending.current) onClose();
  }

  return (
    <Modal
      transparent
      animationType="slide"
      visible
      onRequestClose={close}
      onShow={() => input.current?.focus()}
    >
      <View style={styles.backdrop} />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView
          style={styles.sheet}
          edges={['bottom', 'left', 'right']}
          accessibilityViewIsModal
          onAccessibilityEscape={close}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <Text accessibilityRole="header" style={styles.title}>
              {mode === 'edit' ? 'Editar hábito' : 'Novo hábito'}
            </Text>
            <TextField
              ref={input}
              label="Nome do hábito"
              value={name}
              onChangeText={(value) => {
                setName(value);
                setError(undefined);
              }}
              autoFocus
              maxLength={MAX_HABIT_NAME_LENGTH}
              returnKeyType="done"
              onSubmitEditing={() => {
                void submit();
              }}
              disabled={submitting}
              error={error}
            />
            <Button
              label={
                mode === 'edit'
                  ? submitting
                    ? 'Salvando…'
                    : 'Salvar'
                  : submitting
                    ? 'Criando…'
                    : 'Criar hábito'
              }
              disabled={!valid || submitting}
              onPress={() => {
                void submit();
              }}
            />
            <Button
              label="Cancelar"
              variant="secondary"
              disabled={submitting}
              onPress={close}
            />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.textPrimary,
    opacity: 0.25,
  },
  keyboard: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '100%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.control,
    borderTopRightRadius: radius.control,
  },
  content: { padding: spacing.xl, gap: spacing.lg },
  title: { ...typography.title, color: colors.textPrimary },
});
