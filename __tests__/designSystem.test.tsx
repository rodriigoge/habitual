import { useState } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../src/design-system/components/Button/Button';
import { IconButton } from '../src/design-system/components/IconButton/IconButton';
import { TextField } from '../src/design-system/components/TextField/TextField';
import { Divider } from '../src/design-system/components/Divider/Divider';

describe('Button', () => {
  it.each(['primary', 'secondary'] as const)(
    'exposes its label and executes %s action',
    async (variant) => {
      const onPress = jest.fn();
      await render(
        <Button label="Continuar" variant={variant} onPress={onPress} />,
      );
      const button = screen.getByRole('button', { name: 'Continuar' });
      expect(screen.getByText('Continuar')).toBeOnTheScreen();
      await fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    },
  );
  it('communicates disabled state and blocks actions', async () => {
    const onPress = jest.fn();
    await render(<Button label="Continuar" disabled onPress={onPress} />);
    const button = screen.getByRole('button', {
      name: 'Continuar',
      disabled: true,
    });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('IconButton', () => {
  it('names an icon-only action and runs it', async () => {
    const onPress = jest.fn();
    await render(
      <IconButton
        accessibilityLabel="Voltar"
        onPress={onPress}
        renderIcon={() => <Text>←</Text>}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it('blocks the action when disabled', async () => {
    const onPress = jest.fn();
    await render(
      <IconButton
        accessibilityLabel="Fechar"
        disabled
        onPress={onPress}
        renderIcon={() => <Text>×</Text>}
      />,
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Fechar', disabled: true }),
    );
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('TextField', () => {
  it('renders its label, placeholder and controlled value', async () => {
    function Form() {
      const [value, setValue] = useState('');
      return (
        <TextField
          label="Nome"
          placeholder="Digite um nome"
          value={value}
          onChangeText={setValue}
        />
      );
    }
    await render(<Form />);
    expect(screen.getByText('Nome')).toBeOnTheScreen();
    const input = screen.getByPlaceholderText('Digite um nome');
    await fireEvent.changeText(input, 'Leitura');
    expect(screen.getByDisplayValue('Leitura')).toBeOnTheScreen();
    expect(screen.getByLabelText('Nome')).toBeOnTheScreen();
  });
  it('supports an accessible name without a visible label', async () => {
    await render(
      <TextField accessibilityLabel="Nome" value="" onChangeText={jest.fn()} />,
    );
    expect(screen.getByLabelText('Nome')).toBeOnTheScreen();
  });
  it('shows an error as text and makes it available to assistive technology', async () => {
    await render(
      <TextField
        label="Nome"
        value=""
        onChangeText={jest.fn()}
        error="Informe um nome"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um nome');
    expect(screen.getByLabelText('Nome')).toHaveProp(
      'accessibilityHint',
      'Informe um nome',
    );
  });
  it('prevents editing when disabled', async () => {
    const onChangeText = jest.fn();
    await render(
      <TextField
        label="Nome"
        value="Leitura"
        disabled
        onChangeText={onChangeText}
      />,
    );
    const input = screen.getByLabelText('Nome');
    expect(input).toBeDisabled();
    await fireEvent.changeText(input, 'Outro');
    expect(onChangeText).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('Leitura')).toBeOnTheScreen();
  });
  it('preserves native focus, blur and keyboard submission callbacks', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const onSubmitEditing = jest.fn();
    await render(
      <TextField
        label="Nome"
        value="Leitura"
        onChangeText={jest.fn()}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="done"
      />,
    );
    const input = screen.getByLabelText('Nome');
    await fireEvent(input, 'focus', { nativeEvent: {} });
    await fireEvent(input, 'submitEditing', {
      nativeEvent: { text: 'Leitura' },
    });
    await fireEvent(input, 'blur', { nativeEvent: {} });
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onSubmitEditing).toHaveBeenCalledTimes(1);
  });
});

it('renders Divider as a decorative separator', async () => {
  const result = await render(<Divider />);
  expect(result.toJSON()).not.toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
});
