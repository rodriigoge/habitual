# Technical Specification — Habit Tracker Mobile

**Versão:** 0.1  
**Status:** Draft técnico  
**Fonte funcional:** PRD v0.1  
**Arquitetura:** Local-first  
**Plataforma:** Mobile

---

# 1. Objetivo

Esta especificação define a arquitetura técnica do MVP do Habit Tracker.

O documento deve orientar a implementação e evitar decisões arquiteturais desnecessárias durante o desenvolvimento.

Princípios:

- simplicidade;
- local-first;
- offline por padrão;
- regras de domínio isoladas da UI;
- persistência estruturada;
- componentes reutilizáveis;
- tipagem forte;
- baixo acoplamento;
- facilidade de testes;
- evitar overengineering.

---

# 2. Stack

## Core

- React Native
- Expo
- TypeScript

## Navegação

- Expo Router

## Persistência

- SQLite

## Estado

Inicialmente:

- React state;
- hooks;
- estado derivado.

Não utilizar Redux no MVP.

Uma biblioteca global como Zustand somente deverá ser adicionada caso exista uma necessidade concreta posteriormente.

## Testes

- testes unitários para domínio;
- testes de componentes;
- testes dos principais fluxos.

A escolha específica das bibliotecas de teste deverá respeitar a compatibilidade da versão do Expo/React Native utilizada no momento da implementação.

---

# 3. Arquitetura

A aplicação será organizada conceitualmente em quatro camadas:

```text
UI
 ↓
Application
 ↓
Domain
 ↓
Data
```

## UI

Responsável por:

- renderização;
- interação;
- navegação;
- animações;
- estados visuais.

Não deverá conter algoritmos de cálculo de streak.

## Application

Responsável por coordenar casos de uso.

Exemplos:

- CreateHabit
- UpdateHabit
- DeleteHabit
- ToggleHabitCompletion

## Domain

Responsável pelas regras do produto.

Exemplos:

- Habit;
- HabitCompletion;
- HabitMetrics;
- cálculo de streak;
- validações.

## Data

Responsável por:

- SQLite;
- queries;
- migrations;
- implementação dos repositories.

---

# 4. Modelo de domínio

## Habit

```ts
export type Habit = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};
```

## HabitCompletion

```ts
export type HabitCompletion = {
  id: string;
  habitId: string;
  date: LocalDate;
  createdAt: string;
};
```

## LocalDate

Criar semanticamente:

```ts
export type LocalDate = string;
```

Seu formato obrigatório será:

```text
YYYY-MM-DD
```

Exemplo:

```text
2026-10-02
```

A aplicação deverá centralizar criação, parsing e manipulação de `LocalDate` em utilities próprias.

---

# 5. HabitMetrics

```ts
export type HabitMetrics = {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
};
```

Essas métricas são derivadas do histórico.

O histórico de conclusões é a fonte de verdade.

---

# 6. Banco de Dados

## habits

```sql
CREATE TABLE habits (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

## habit_completions

```sql
CREATE TABLE habit_completions (
    id TEXT PRIMARY KEY NOT NULL,
    habit_id TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,

    FOREIGN KEY (habit_id)
        REFERENCES habits(id)
        ON DELETE CASCADE,

    UNIQUE (habit_id, date)
);
```

Criar índice:

```sql
CREATE INDEX idx_habit_completions_habit_date
ON habit_completions(habit_id, date);
```

---

# 7. Migrations

O banco deverá possuir versionamento desde a primeira versão.

Exemplo:

```text
database/
  migrations/
    001_initial_schema.ts
```

Nunca assumir que alterações futuras de schema podem simplesmente recriar o banco.

Dados existentes deverão poder ser migrados.

---

# 8. Repository

Contrato inicial:

```ts
export interface HabitRepository {
  findAll(): Promise<Habit[]>;

  findById(id: string): Promise<Habit | null>;

  create(input: CreateHabitInput): Promise<Habit>;

  update(
    id: string,
    input: UpdateHabitInput
  ): Promise<Habit>;

  delete(id: string): Promise<void>;

  getCompletions(
    habitId: string
  ): Promise<HabitCompletion[]>;

  getCompletionsBetween(
    habitId: string,
    startDate: LocalDate,
    endDate: LocalDate
  ): Promise<HabitCompletion[]>;

  toggleCompletion(
    habitId: string,
    date: LocalDate
  ): Promise<boolean>;
}
```

Retorno de `toggleCompletion`:

```text
true  = concluído após operação
false = não concluído após operação
```

---

# 9. CreateHabitInput

```ts
export type CreateHabitInput = {
  name: string;
};
```

Validações:

- obrigatório;
- trim;
- não aceitar string vazia;
- limite de caracteres definido pelo design.

O domínio deverá receber o valor normalizado.

---

# 10. UpdateHabitInput

```ts
export type UpdateHabitInput = {
  name: string;
};
```

Alterar o nome não modifica:

- histórico;
- streak;
- recorde;
- total.

---

# 11. ToggleCompletion

Assinatura conceitual:

```ts
toggleCompletion(
  habitId: string,
  date: LocalDate
): Promise<boolean>
```

Algoritmo:

```text
buscar completion(habitId, date)

SE existir
    remover
    retornar false

SENÃO
    validar data
    inserir
    retornar true
```

---

# 12. Validação de Data

Antes da criação de uma conclusão:

```text
habit.createdDate <= completion.date <= today
```

Portanto:

```text
data futura
→ rejeitar

data anterior à criação
→ rejeitar

data válida
→ permitir
```

A UI também deverá impedir essas interações.

Entretanto, a regra não pode existir somente na UI.

---

# 13. Total de Conclusões

Formalmente:

```ts
totalCompletions = completions.length;
```

O comportamento percebido pelo usuário continua sendo:

```text
marcar
→ +1

desmarcar
→ -1
```

Porém o valor deverá permanecer consistente com os registros persistidos.

---

# 14. Cálculo do Streak

Função de domínio:

```ts
calculateHabitMetrics(
  completionDates: LocalDate[],
  today: LocalDate
): HabitMetrics
```

A função deverá ser pura.

Não deverá:

- acessar SQLite;
- acessar relógio diretamente;
- modificar estado;
- depender da UI.

---

# 15. Normalização

Antes do cálculo:

1. remover duplicidades defensivamente;
2. ordenar datas;
3. garantir formato válido.

Exemplo:

```text
[
  2026-10-01,
  2026-09-29,
  2026-09-30
]
```

torna-se:

```text
[
  2026-09-29,
  2026-09-30,
  2026-10-01
]
```

---

# 16. Algoritmo — Current Streak

Regra fundamental do PRD:

> O dia atual ainda não concluído não quebra uma sequência existente.

Portanto:

### Caso hoje esteja concluído

O cálculo começa em hoje.

Exemplo:

```text
29 ✓
30 ✓
01 ✓
02 ✓ ← hoje
```

Resultado:

```text
currentStreak = 4
```

### Caso hoje não esteja concluído

O cálculo começa em ontem.

Exemplo:

```text
29 ✓
30 ✓
01 ✓
02 ○ ← hoje
```

Resultado:

```text
currentStreak = 3
```

### Caso ontem também não esteja concluído

```text
30 ✓
01 ○
02 ○ ← hoje
```

Resultado:

```text
currentStreak = 0
```

---

# 17. Pseudocódigo — Current Streak

```text
completionSet = Set(completionDates)

if completionSet contains today
    cursor = today
else
    cursor = yesterday

streak = 0

while completionSet contains cursor
    streak++
    cursor = cursor - 1 day

return streak
```

---

# 18. Best Streak

O maior streak deverá considerar todo o histórico.

Exemplo:

```text
01 ✓
02 ✓
03 ✓
04 ○
05 ✓
06 ✓
```

Resultado:

```text
bestStreak = 3
```

Alterações retroativas deverão recalcular esse valor.

---

# 19. Algoritmo — Best Streak

Percorrer as datas ordenadas.

Conceitualmente:

```text
current = 1
best = 1

para cada data:
    comparar com data anterior

    se diferença == 1 dia
        current++
    senão
        current = 1

    best = max(best, current)
```

Sem conclusões:

```text
bestStreak = 0
```

---

# 20. Exemplo completo

Histórico:

```text
26 ✓
27 ✓
28 ○
29 ✓
30 ✓
01 ✓
02 ○ ← hoje
```

Resultado:

```ts
{
  currentStreak: 3,
  bestStreak: 3,
  totalCompletions: 5
}
```

Usuário marca dia 28:

```text
26 ✓
27 ✓
28 ✓
29 ✓
30 ✓
01 ✓
02 ○
```

Resultado:

```ts
{
  currentStreak: 6,
  bestStreak: 6,
  totalCompletions: 6
}
```

---

# 21. Datas e Timezone

O domínio trabalha com dias locais.

Não utilizar UTC diretamente para decidir o "dia do hábito".

Uma conclusão representa:

```text
2026-10-02
```

e não:

```text
2026-10-02T03:00:00.000Z
```

Criar funções centralizadas:

```ts
getToday(): LocalDate

addDays(
  date: LocalDate,
  amount: number
): LocalDate

differenceInCalendarDays(
  left: LocalDate,
  right: LocalDate
): number

isFuture(
  date: LocalDate,
  today: LocalDate
): boolean
```

Evitar manipulação manual de strings espalhada pelo projeto.

---

# 22. Recent Activity

A Home precisa sempre de:

```text
today - 5
today - 4
today - 3
today - 2
today - 1
today
```

Criar função:

```ts
getRecentDates(
  today: LocalDate,
  count: number
): LocalDate[];
```

Uso:

```ts
getRecentDates(today, 6);
```

---

# 23. DayStatus

Contrato conceitual:

```ts
type DayStatusProps = {
  date: LocalDate;
  completed: boolean;
  isToday: boolean;
  disabled?: boolean;
  onPress: () => void;
};
```

O componente não deverá conhecer SQLite.

Ele recebe estado e dispara ação.

---

# 24. HabitCard

Contrato conceitual:

```ts
type HabitCardProps = {
  habit: Habit;
  metrics: HabitMetrics;
  recentActivity: RecentDay[];
  onPress: () => void;
  onToggleDay: (date: LocalDate) => void;
};
```

---

# 25. RecentDay

```ts
export type RecentDay = {
  date: LocalDate;
  completed: boolean;
  isToday: boolean;
  disabled: boolean;
};
```

---

# 26. CalendarDay

```ts
export type CalendarDay = {
  date: LocalDate;
  completed: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  disabled: boolean;
};
```

Estados visuais deverão ser derivados dessas propriedades.

---

# 27. Hooks

Inicialmente:

```text
useHabits()
useHabit(id)
useHabitCompletions(id)
useHabitMetrics(id)
useRecentActivity(id)
```

Não criar hooks excessivamente genéricos.

Hooks deverão representar necessidades reais da feature.

---

# 28. useHabits

Responsabilidades:

```ts
{
  habits,
  loading,
  createHabit,
  updateHabit,
  deleteHabit,
  refresh
}
```

A implementação exata poderá evoluir, mas a UI não deverá executar queries SQL diretamente.

---

# 29. Optimistic UI

A marcação precisa parecer instantânea.

Fluxo:

```text
tap
 ↓
atualizar estado visual
 ↓
persistir
 ↓
sucesso
```

Em erro:

```text
estado otimista
 ↓
erro
 ↓
rollback
 ↓
feedback discreto
```

Não bloquear o `DayStatus` aguardando SQLite.

---

# 30. Concorrência de Toques

Evitar que múltiplos toques rápidos criem estados inconsistentes.

O `toggleCompletion` deverá ser tratado atomicamente.

A constraint:

```sql
UNIQUE(habit_id, date)
```

funciona também como proteção de integridade.

---

# 31. Exclusão

Fluxo:

```text
confirmar exclusão
 ↓
delete Habit
 ↓
SQLite CASCADE
 ↓
HabitCompletion removidos
 ↓
atualizar Home
```

O domínio não deverá precisar remover cada completion manualmente.

---

# 32. Estrutura de Diretórios

Estrutura inicial:

```text
app/
├── _layout.tsx
├── index.tsx
└── habit/
    └── [id].tsx

src/
├── database/
│   ├── database.ts
│   └── migrations/
│       └── 001_initial_schema.ts
│
├── design-system/
│   ├── components/
│   │   ├── Button/
│   │   ├── IconButton/
│   │   ├── TextField/
│   │   ├── BottomSheet/
│   │   └── Divider/
│   │
│   └── tokens/
│       ├── colors.ts
│       ├── typography.ts
│       ├── spacing.ts
│       └── radius.ts
│
├── features/
│   └── habits/
│       ├── application/
│       │   ├── createHabit.ts
│       │   ├── updateHabit.ts
│       │   ├── deleteHabit.ts
│       │   └── toggleHabitCompletion.ts
│       │
│       ├── components/
│       │   ├── HabitCard.tsx
│       │   ├── DayStatus.tsx
│       │   ├── HabitCalendar.tsx
│       │   ├── StreakIndicator.tsx
│       │   └── HabitFormSheet.tsx
│       │
│       ├── domain/
│       │   ├── Habit.ts
│       │   ├── HabitCompletion.ts
│       │   ├── HabitMetrics.ts
│       │   ├── calculateHabitMetrics.ts
│       │   └── validateCompletionDate.ts
│       │
│       ├── hooks/
│       │   ├── useHabits.ts
│       │   ├── useHabit.ts
│       │   ├── useHabitMetrics.ts
│       │   └── useRecentActivity.ts
│       │
│       └── repository/
│           ├── HabitRepository.ts
│           └── SQLiteHabitRepository.ts
│
└── shared/
    ├── date/
    │   ├── LocalDate.ts
    │   └── dateUtils.ts
    │
    └── errors/
```

Essa estrutura é um ponto inicial, não uma obrigação de criar arquivos vazios apenas para obedecê-la.

---

# 33. Regra contra Overengineering

Não criar antecipadamente:

- Event Bus;
- CQRS;
- dependency injection framework;
- Redux;
- backend;
- API REST;
- DTOs redundantes;
- generic repository;
- BaseService;
- BaseUseCase;
- abstrações sem dois usos reais;
- camada de cache separada;
- sistema de plugins.

Preferir código explícito.

---

# 34. Design System

Direção visual definida:

**Editorial / Typographic.**

Princípios:

- tipografia protagonista;
- números com forte presença;
- bastante espaço negativo;
- poucos ícones;
- poucas superfícies;
- evitar excesso de cards;
- cor utilizada principalmente para representar progresso;
- animações discretas.

---

# 35. Tokens

Nenhum HEX deverá ser considerado definitivo antes da definição visual final.

Entretanto, componentes deverão utilizar tokens semânticos:

```ts
colors.background
colors.surface
colors.textPrimary
colors.textSecondary
colors.accent
colors.completed
colors.inactive
colors.danger
colors.border
```

Nunca espalhar valores de cor diretamente pelos componentes.

---

# 36. Tipografia

Tokens conceituais:

```ts
typography.display
typography.title
typography.habitName
typography.metric
typography.body
typography.label
typography.caption
```

Números de métricas deverão receber atenção especial.

---

# 37. Spacing

Utilizar escala consistente.

Exemplo conceitual:

```text
4
8
12
16
24
32
48
```

Evitar valores arbitrários diferentes em cada componente.

---

# 38. Acessibilidade

Mesmo sendo um produto visual, os controles deverão possuir áreas de toque adequadas.

`DayStatus` poderá parecer pequeno visualmente, mas deverá possuir área interativa confortável.

Também deverão existir labels acessíveis.

Exemplo conceitual:

```text
"1 de outubro, Academia, concluído"
```

Não depender exclusivamente de cor para comunicar estado.

---

# 39. Animações

Animações deverão comunicar mudança de estado.

Utilizar principalmente em:

- DayStatus;
- alteração de contador;
- alteração de streak;
- criação de hábito;
- remoção de hábito;
- bottom sheets;
- transições do calendário.

Evitar animações decorativas permanentes.

---

# 40. Haptics

Utilizar feedback tátil de forma restrita.

Casos:

- conclusão de hábito;
- novo recorde;
- confirmação de ação destrutiva.

Haptics não fazem parte da regra de negócio.

Falha de haptic nunca poderá impedir uma operação.

---

# 41. Testes Unitários Obrigatórios — Métricas

`calculateHabitMetrics` deverá possuir cobertura explícita para:

1. nenhuma conclusão;
2. somente hoje;
3. somente ontem;
4. somente anteontem;
5. hoje + ontem;
6. ontem + anteontem;
7. sequência interrompida;
8. sequência histórica maior que atual;
9. preenchimento retroativo conectando sequências;
10. remoção retroativa quebrando sequência;
11. mudança de mês;
12. mudança de ano;
13. fevereiro;
14. ano bissexto;
15. datas fora de ordem;
16. duplicidades defensivas.

---

# 42. Testes de Repository

Validar:

- criação;
- atualização;
- exclusão;
- cascade;
- toggle insert;
- toggle delete;
- unique constraint;
- busca por intervalo;
- ordenação.

---

# 43. Testes de Componentes

Priorizar:

### DayStatus

- estado concluído;
- estado não concluído;
- hoje;
- disabled;
- onPress.

### HabitCard

- renderização;
- métricas;
- seis dias;
- navegação;
- toggle.

### HabitCalendar

- mês correto;
- navegação;
- estados dos dias;
- bloqueio futuro;
- bloqueio pré-criação.

---

# 44. Critérios Técnicos de Aceite do MVP

O MVP estará tecnicamente completo quando:

- hábitos puderem ser criados localmente;
- dados sobreviverem ao fechamento do aplicativo;
- Home exibir todos os hábitos;
- cada hábito exibir seis dias;
- todos os seis dias válidos puderem ser alterados;
- total atualizar corretamente;
- streak atualizar corretamente;
- recorde atualizar corretamente;
- detalhes puderem ser acessados;
- calendário completo funcionar;
- histórico puder ser editado;
- datas inválidas forem bloqueadas;
- hábito puder ser renomeado;
- hábito puder ser excluído;
- regras centrais possuírem testes;
- nenhuma funcionalidade depender de conexão com internet.

---

# 45. Fonte de Verdade

A ordem de precedência durante implementação será:

**1. PRD**  
Define comportamento e regras do produto.

**2. UX Specification**  
Define interação e experiência.

**3. Technical Specification**  
Define arquitetura e implementação.

**4. Código**  
Implementa as especificações anteriores.

Caso código e documentação entrem em conflito, não alterar silenciosamente a regra para acomodar a implementação.

A divergência deverá ser resolvida explicitamente.

---

# 46. Princípio Técnico Final

O objetivo da arquitetura não é antecipar todas as possíveis funcionalidades futuras.

O objetivo é implementar corretamente o produto atual enquanto mantemos caminhos razoáveis de evolução.

A aplicação deverá permanecer:

**pequena, rápida, testável e fácil de entender.**