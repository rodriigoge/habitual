# Habit Tracker Mobile

Bootstrap (Milestone 0) com Expo SDK 57, React Native, TypeScript estrito e Expo Router.
A única tela exibe **Habit Tracker** e **App running**.

## Desenvolvimento

Requisitos: Node.js 24 LTS (24.15 ou superior), npm e Expo Go compatível com SDK 57
em um dispositivo físico ou emulador Android. O simulador iOS exige macOS e Xcode.

```sh
npm ci
npm start
```

Leia o QR code com Expo Go, usando a mesma rede do computador. Para abrir um
emulador Android já configurado, execute `npm run android`. No macOS, use
`npm run ios` para o simulador iOS.

## Verificações

```sh
npm run typecheck
npm run lint
npm test
npm run format:check
npx expo install --check
```

Use `npm run format` para formatar o código. `AGENTS.md` e `docs/` são excluídos
da formatação para preservar as fontes de verdade.

## Estrutura

```text
app/
  _layout.tsx
  index.tsx
__tests__/
  home.test.tsx
src/
  database/
  design-system/
  features/
  shared/
```

As pastas de `src/` são apenas reservadas com `.gitkeep`. Não há banco, regras de
domínio, hábitos, calendário, design system, backend ou autenticação.
Os testes ficam fora de `app/` para não serem interpretados como rotas.

O lockfile fixa a instalação. Os overrides de React DOM, Reanimated e Worklets
alinham peers transitivos ao SDK 57; nenhuma funcionalidade web ou animação foi
implementada. Os tipos globais de testes são declarados explicitamente para TypeScript 6.

## Avisos de dependências

A auditoria inicial reportou 15 alertas transitivos (11 moderados e 4 altos),
envolvendo `node-forge`, `uuid`/`xcode` e `decode-uri-component`/`query-string`
na cadeia do Expo e Expo Router. A correção sugerida por `npm audit fix --force`
faz downgrade incompatível do SDK; não deve ser aplicada automaticamente.
Há também avisos de depreciação em ferramentas e dependências transitivas.
