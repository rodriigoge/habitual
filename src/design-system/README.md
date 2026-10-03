# Design System Foundation (Milestone 4)

Fundação clara e editorial, sem provider de tema, fonte externa ou biblioteca de UI.
Importe cada componente e token pelo seu arquivo. Não há showcase/rota no aplicativo.

## Tokens

- `colors`: background, surface, textPrimary, textSecondary, textMuted, border,
  accent, completed, inactive, danger e onAction. Accent/completed usam o mesmo verde.
- `typography`: display 40, title 28, habitName 20, metric 36, body 16, label 13,
  caption 12. Títulos/números usam Georgia no iOS e serif no Android; o restante usa
  fonte padrão do sistema. Font scaling permanece habilitado e textos podem quebrar linha.
- `spacing`: 4, 8, 12, 16, 24, 32, 48.
- `radius`: control 12, round 24.
- `controls`: área mínima de toque 48, ícone 24 e opacidades de pressed/disabled.

Sem dark mode, sombras, gradientes ou tokens de animação sem uso.

## APIs

- `Button`: `label`, `onPress`, `disabled?`, `variant?` (`primary` ou `secondary`),
  `accessibilityHint?`, `testID?`. Label também é seu nome acessível.
- `IconButton`: `accessibilityLabel` e `renderIcon({ color, size })` obrigatórios;
  `onPress`, `disabled?`, `accessibilityHint?`, `testID?`. O renderer permite usar um
  ícone já disponível no chamador sem acoplar esta base a uma biblioteca. O desenho
  interno fica fora da árvore acessível; o botão expõe a ação nomeada.
- `TextField`: `value`, `onChangeText`, `label` (ou `accessibilityLabel` obrigatório
  se não houver label), `placeholder?`, `error?`, `disabled?`. Encaminha `ref` para
  foco nativo e opções de teclado: `keyboardType`, `returnKeyType`, `autoFocus`,
  `autoCapitalize`, `autoCorrect`, `maxLength`, `onSubmitEditing`, `onFocus`, `onBlur`.
  Também aceita `accessibilityHint` e `testID`. Erro é texto local com semântica de
  alerta e participa da dica acessível. Não aplica validação de domínio.
- `Divider`: sem props; linha decorativa discreta, sem ocupar a árvore acessível.

Button usa superfície escura como ação principal e superfície neutra como ação
secundária. Pressed tem feedback de opacidade; IconButton também muda a superfície.
TextField mantém foco perceptível por espessura e cor da borda. Disabled bloqueia a
interação/edição e é exposto semanticamente, além do feedback visual.

## Verificação

```sh
npm test -- designSystem.test.tsx
```

Testes verificam rótulos, ações, bloqueio disabled, edição controlada, mensagens de
erro, callbacks nativos de foco/teclado e renderização do separador. Não utilizam
snapshots de estilos. A validação visual em dispositivo continua necessária para
avaliar teclado, fontes nativas, leitor de tela e escala de fonte real.
