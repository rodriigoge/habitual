# Habit Tracker Mobile

Milestones 0–9: Home editorial com hábitos persistidos, criação por nome,
edição dos seis dias recentes e estado vazio. Expo SDK 57, TypeScript e SQLite.

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

A Date Foundation fica em `src/shared/date`, o domínio e repository em
`src/features/habits`, e a inicialização/migrations em `src/database`.
A fundação visual está documentada em [src/design-system/README.md](src/design-system/README.md).
Habit Details, calendário completo, edição/exclusão de hábitos, backend e autenticação não foram implementados.
Os testes ficam fora de `app/` para não serem interpretados como rotas.

O lockfile fixa a instalação. Os overrides de React DOM, Reanimated e Worklets
alinham peers transitivos ao SDK 57; nenhuma funcionalidade web foi implementada. Os tipos globais de testes são declarados explicitamente para TypeScript 6.

## Avisos de dependências

A auditoria inicial reportou 15 alertas transitivos (11 moderados e 4 altos),
envolvendo `node-forge`, `uuid`/`xcode` e `decode-uri-component`/`query-string`
na cadeia do Expo e Expo Router. A correção sugerida por `npm audit fix --force`
faz downgrade incompatível do SDK; não deve ser aplicada automaticamente.
Há também avisos de depreciação em ferramentas e dependências transitivas.

## Persistência (Milestone 3)

`expo-sqlite ~57.0.3` foi instalado por `expo install`. O layout abre `habitual.db`
no diretório persistente padrão do Expo, via `SQLiteProvider`, e executa
`initializeDatabase` antes de renderizar a navegação. A Home acessa o repository por meio de useHabits, sem SQL nos componentes.

As migrations são numeradas e usam `PRAGMA user_version`. Somente versões pendentes
são aplicadas, em transação junto com o avanço da versão. Uma versão de banco mais
nova que a aplicação é rejeitada. Nenhum dado é apagado durante inicialização.
`PRAGMA foreign_keys = ON` é aplicado e verificado em cada conexão inicializada.

O repository usa bindings para dados de entrada e aliases SQL para mapear os tipos.
IDs são 128 bits aleatórios do SQLite (`lower(hex(randomblob(16)))`), protegidos
por primary keys. Timestamps usam ISO 8601; `completion.date` permanece `LocalDate`.
A conversão do timestamp de criação para dia local usa `toLocalDate` na Date Foundation.

`update` e `toggleCompletion` lançam `Error('Habit not found.')` para um hábito ausente.
Consultas retornam `null`/listas vazias; `delete` é idempotente. Nomes vazios e datas
inválidas lançam `RangeError`. Nenhuma métrica é persistida.

O contrato expõe Promises, mas as consultas usam a API síncrona do Expo. O toggle
executa uma transação curta sem `await`, impedindo interleaving entre chamadas na
mesma conexão. Falhas fazem rollback. Operações síncronas podem bloquear a thread
JavaScript durante consultas; a medição/otimização de grandes volumes fica para o
milestone de performance.

Os testes usam SQLite real de `node:sqlite`, sem banco simulado e sem dependência
adicional. Execute com o Node 24 LTS indicado acima. Para rodar apenas persistência:

```sh
npm test -- database.test.ts SQLiteHabitRepository.test.ts
```

A suíte cobre migration única, rollback, constraints, cascade, bindings, CRUD,
ordenação, intervalos, validação de datas, toggles rápidos e reabertura de arquivo.
O teste com SQLite do Node não substitui uma execução em dispositivo Expo.

## Home (Milestones 6–9)

A Home carrega hábitos em ordem de criação e o histórico completo de conclusões.
As métricas são derivadas por calculateHabitMetrics; a janela visual usa
getRecentDates(today, 6). Nenhum dado fictício é inserido no banco.

O botão + e o CTA do estado vazio abrem o mesmo HabitFormSheet, feito com Modal,
KeyboardAvoidingView e componentes existentes. O nome recebe trim e tem limite
de 80 caracteres. Erros de criação ficam no formulário, sem perder o texto.

Datas válidas usam atualização otimista. Gravações da mesma data são serializadas,
preservando a intenção final de toques rápidos. Falhas restauram apenas a data
afetada ao último estado confirmado, sem desfazer edições de outras datas.
Datas anteriores à criação são indisponíveis. Haptics leves usam expo-haptics
~57.0.3 somente ao concluir; falhas táteis não interrompem a persistência.

Validação automatizada: 198 testes, typecheck, lint, formatter, compatibilidade
Expo e exportação Android/iOS. Teclado, safe area, animação e haptics ainda precisam
de revisão em dispositivo; o ambiente de implementação não tem emulador/ADB.

A instalação de expo-haptics reportou 60 vulnerabilidades na árvore (10 moderadas
e 50 altas) e bloqueio do postinstall de unrs-resolver pelo npm. Nenhuma versão
existente do lockfile foi alterada. Não foi aplicado audit fix.
