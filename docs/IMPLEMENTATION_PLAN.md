# Implementation Plan — Habit Tracker Mobile

**Versão:** 0.1  
**Objetivo:** orientar implementação incremental do MVP  
**Plataforma:** React Native + Expo + TypeScript  
**Arquitetura:** Local-first

---

# 1. Estratégia de Implementação

O aplicativo deverá ser construído incrementalmente.

Cada milestone deverá:

1. possuir escopo pequeno;
2. produzir software executável;
3. possuir critérios claros de aceite;
4. ser validado antes do próximo milestone;
5. evitar implementação antecipada de funcionalidades futuras.

Ordem:

```text
Foundation
    ↓
Domain
    ↓
Database
    ↓
Home
    ↓
Habit interactions
    ↓
Habit details
    ↓
Calendar
    ↓
Management
    ↓
Visual polish
    ↓
Tests & stabilization
```

---

# 2. Milestone 0 — Bootstrap

## Objetivo

Criar a fundação mínima do aplicativo.

## Implementar

- projeto Expo;
- TypeScript;
- Expo Router;
- estrutura inicial de diretórios;
- lint;
- formatter;
- configuração de testes;
- aliases de imports, se necessários.

Estrutura inicial:

```text
app/
src/
  database/
  design-system/
  features/
  shared/
```

## Tela temporária

Criar somente uma Home básica:

```text
Habit Tracker

App running
```

## Não implementar

- banco;
- hábitos;
- calendário;
- design final;
- navegação complexa.

## Critério de aceite

Aplicativo deve iniciar corretamente em ambiente de desenvolvimento sem warnings relevantes.

---

# 3. Milestone 1 — Date Foundation

## Objetivo

Criar a base de manipulação de datas antes das regras de streak.

## Implementar

`LocalDate`

Formato:

```text
YYYY-MM-DD
```

Utilities:

```text
getToday()
addDays()
differenceInCalendarDays()
isFuture()
getRecentDates()
```

## Regra

Toda lógica de hábito trabalha com **dia local**, não timestamp UTC.

## Testes

Cobrir:

- mudança de mês;
- mudança de ano;
- fevereiro;
- ano bissexto;
- soma/subtração de dias.

## Critério de aceite

As regras de domínio posteriores não precisarão manipular diretamente `Date` ou strings de data.

---

# 4. Milestone 2 — Habit Domain

## Objetivo

Implementar o núcleo de regras sem banco ou interface.

## Criar

```text
Habit
HabitCompletion
HabitMetrics
```

Implementar:

```text
calculateHabitMetrics()
validateCompletionDate()
```

## Regras

Calcular:

- currentStreak;
- bestStreak;
- totalCompletions.

O dia atual ainda não realizado não quebra imediatamente o streak.

## Testes obrigatórios

### Nenhuma conclusão

```text
current = 0
best = 0
total = 0
```

### Hoje

```text
Hoje ✓

current = 1
best = 1
total = 1
```

### Ontem

```text
Ontem ✓
Hoje ○

current = 1
```

### Anteontem

```text
Anteontem ✓
Ontem ○
Hoje ○

current = 0
```

### Sequência

```text
29 ✓
30 ✓
01 ✓
02 ○

current = 3
```

### Sequência interrompida

```text
28 ✓
29 ○
30 ✓
01 ✓
02 ○

current = 2
best = 2
```

### Conexão retroativa

Antes:

```text
26 ✓
27 ✓
28 ○
29 ✓
30 ✓
01 ✓
```

Depois de marcar 28:

```text
26 ✓
27 ✓
28 ✓
29 ✓
30 ✓
01 ✓
```

Streak deve refletir seis dias.

## Critério de aceite

Todo domínio funciona através de testes sem React Native ou SQLite.

---

# 5. Milestone 3 — SQLite

## Objetivo

Adicionar persistência local.

## Criar tabelas

```text
habits
habit_completions
```

Adicionar:

```text
PRIMARY KEY
FOREIGN KEY
UNIQUE(habit_id, date)
ON DELETE CASCADE
```

Criar migration inicial.

## Implementar

`HabitRepository`

e:

`SQLiteHabitRepository`

Operações:

```text
findAll
findById
create
update
delete
getCompletions
getCompletionsBetween
toggleCompletion
```

## Testar

- criação;
- atualização;
- exclusão;
- cascade;
- toggle;
- constraint de data duplicada.

## Critério de aceite

Dados permanecem após fechar e abrir novamente o aplicativo.

---

# 6. Milestone 4 — Design System Foundation

## Objetivo

Criar a base visual antes das telas definitivas.

## Criar tokens

```text
colors
typography
spacing
radius
```

Direção:

**Editorial / Typographic**

## Criar componentes básicos

```text
Button
IconButton
TextField
Divider
```

BottomSheet poderá ser introduzido quando necessário.

## Regras

Evitar:

- cores hardcoded;
- tamanhos arbitrários repetidos;
- estilos duplicados;
- sombras excessivas.

## Critério de aceite

Componentes básicos podem ser reutilizados pelas telas seguintes.

---

# 7. Milestone 5 — Home Static UI

## Objetivo

Construir visualmente a Home antes de conectá-la ao banco.

Utilizar mock data.

## Estrutura

```text
MEUS HÁBITOS
QUI, 01 DE OUTUBRO

Academia                         14
                         DIAS SEGUIDOS

150
CONCLUSÕES

últimos seis dias
```

## Criar

```text
HabitCard
DayStatus
StreakIndicator
```

## Direção visual

Seguir o mockup aprovado:

- editorial;
- fundo claro;
- tipografia protagonista;
- números grandes;
- verde/Accent para conclusão;
- poucos containers;
- bastante whitespace.

## Importante

`DayStatus` ainda poderá ser refinado visualmente durante esta etapa.

Seu comportamento funcional, entretanto, já está definido.

## Critério de aceite

A Home deverá representar fielmente a direção visual aprovada usando dados estáticos.

---

# 8. Milestone 6 — Home Real Data

## Objetivo

Conectar a Home ao domínio e SQLite.

## Implementar

```text
useHabits
useRecentActivity
useHabitMetrics
```

Home deverá:

- carregar hábitos;
- calcular métricas;
- apresentar últimos seis dias;
- representar conclusões existentes.

## Critério de aceite

Criar dados no banco deverá refletir corretamente na Home.

---

# 9. Milestone 7 — Create Habit

## Objetivo

Permitir criação real.

## UX

```text
+
↓
Bottom Sheet
↓
Nome
↓
Criar hábito
```

Input recebe foco automaticamente.

## Validação

Botão permanece desabilitado para:

```text
""
" "
```

Aplicar trim.

## Após criação

```text
sheet fecha
↓
HabitCard aparece
```

Sem toast de sucesso.

## Critério de aceite

Novo hábito aparece imediatamente e permanece após reiniciar o aplicativo.

---

# 10. Milestone 8 — DayStatus Interaction

## Objetivo

Implementar a interação central do produto.

Todos os seis dias da Home devem ser editáveis quando válidos.

## Fluxo

```text
tap
↓
optimistic update
↓
toggleCompletion
↓
SQLite
↓
metrics
```

Atualizar imediatamente:

```text
DayStatus
total
streak
recorde
```

## Feedback

Adicionar:

- microanimação;
- feedback tátil leve.

## Rollback

Caso persistência falhe:

```text
reverter estado
↓
feedback discreto
```

## Critério de aceite

Marcar/desmarcar qualquer um dos seis dias atualiza corretamente todas as métricas.

---

# 11. Milestone 9 — Empty State

## Objetivo

Finalizar experiência do primeiro uso.

Quando não existirem hábitos:

```text
MEUS HÁBITOS

Comece pequeno.

Crie um hábito e acompanhe
sua evolução todos os dias.

+ Criar hábito
```

## Critério de aceite

Primeiro uso não deverá parecer uma tela incompleta.

---

# 12. Milestone 10 — Habit Details

## Objetivo

Criar a segunda tela principal.

Rota:

```text
/habit/[id]
```

## Exibir

```text
Academia

14
DIAS SEGUIDOS

150
CONCLUSÕES

31
MELHOR SEQUÊNCIA
```

Adicionar espaço reservado para calendário.

## Navegação

Toque fora dos `DayStatus` no HabitCard:

```text
Home
↓
Habit Details
```

## Critério de aceite

Dados e métricas apresentados devem ser consistentes com a Home.

---

# 13. Milestone 11 — Habit Calendar

## Objetivo

Implementar histórico completo.

## Exibir

- mês;
- ano;
- dias;
- estados de conclusão.

## Estados

```text
normal
completed
today
today + completed
disabled
```

## Navegação

```text
‹ mês anterior
mês seguinte ›
```

Não permitir navegar além do mês atual.

Não permitir navegar para antes do mês de criação quando isso não fornecer informação útil.

## Critério de aceite

Calendário representa corretamente o histórico persistido.

---

# 14. Milestone 12 — Calendar Interaction

## Objetivo

Permitir edição retroativa completa.

Tap em data válida:

```text
normal ↔ completed
```

Atualizar imediatamente:

- calendário;
- streak;
- total;
- recorde.

## Bloquear

```text
data futura
data anterior à criação
```

## Critério de aceite

Qualquer alteração histórica válida recalcula corretamente todas as métricas.

---

# 15. Milestone 13 — Edit Habit

## Objetivo

Permitir alteração do nome.

Fluxo:

```text
Habit Details
↓
•••
↓
Editar hábito
↓
Bottom Sheet
```

Reutilizar formulário da criação sempre que possível.

## Critério de aceite

Nome atualizado aparece imediatamente em Home e detalhes sem alterar histórico.

---

# 16. Milestone 14 — Delete Habit

## Objetivo

Implementar exclusão segura.

Fluxo:

```text
•••
↓
Excluir hábito
↓
Confirmação
↓
Excluir
```

Mensagem:

```text
Excluir Academia?

Todo o histórico deste hábito será removido.

Cancelar        Excluir
```

## Após excluir

Retornar à Home.

HabitCard não deve mais existir.

## Critério de aceite

Habit e HabitCompletion relacionados são removidos.

---

# 17. Milestone 15 — Microinteractions

## Objetivo

Refinar sensação do produto.

Adicionar animações para:

- DayStatus;
- mudança de streak;
- mudança do total;
- novo HabitCard;
- exclusão;
- calendário;
- bottom sheets.

## Regra

Nenhuma animação deverá impedir ou atrasar uma ação.

Evitar:

- confete;
- animações longas;
- efeitos decorativos constantes.

---

# 18. Milestone 16 — Record Feedback

## Objetivo

Criar feedback discreto quando o usuário atingir novo maior streak.

Exemplo:

```text
31
NOVO RECORDE
```

Sem modal.

Sem bloquear fluxo.

Adicionar haptic diferenciado, caso disponível.

---

# 19. Milestone 17 — Accessibility

## Verificar

- touch targets;
- contraste;
- font scaling;
- labels;
- estados não dependentes somente de cor.

Exemplo:

```text
"1 de outubro, Academia, concluído"
```

## Critério de aceite

Controles principais devem ser utilizáveis com recursos básicos de acessibilidade do sistema.

---

# 20. Milestone 18 — Edge Cases

Validar manualmente e automaticamente:

- virada de dia;
- virada de mês;
- virada de ano;
- fevereiro;
- ano bissexto;
- criação hoje;
- hábito antigo;
- sequência longa;
- nenhum histórico;
- editar ontem;
- editar meses atrás;
- remover conclusão que conecta duas sequências;
- adicionar conclusão que conecta duas sequências;
- múltiplos taps rápidos;
- reinício do app;
- exclusão com histórico grande.

---

# 21. Milestone 19 — Performance

Validar cenários como:

```text
50 hábitos
365 conclusões/hábito
```

e:

```text
5 anos de histórico
```

O aplicativo deverá continuar responsivo.

Não otimizar antecipadamente sem medição.

---

# 22. Milestone 20 — MVP Stabilization

Executar:

- lint;
- typecheck;
- testes;
- revisão de warnings;
- revisão de erros;
- revisão de dependências;
- testes em Android;
- testes em iOS quando disponível.

Remover:

- código morto;
- logs temporários;
- mocks;
- TODOs não necessários;
- componentes não utilizados.

---

# 23. Definition of Done

Uma tarefa somente será considerada concluída quando:

- comportamento implementado;
- TypeScript sem erros;
- lint sem erros relevantes;
- testes aplicáveis passando;
- nenhum requisito do PRD violado;
- UI consistente com UX Specification;
- nenhuma abstração desnecessária adicionada.

---

# 24. Regras para o Codex

Durante implementação:

### Deve

- consultar PRD antes de alterar comportamento;
- consultar UX Specification antes de alterar interação;
- consultar Technical Specification antes de alterar arquitetura;
- implementar somente o milestone solicitado;
- reutilizar componentes existentes;
- escrever testes para regras de domínio;
- manter TypeScript estrito;
- manter código simples e explícito.

### Não deve

- implementar funcionalidades futuras;
- adicionar backend;
- adicionar autenticação;
- adicionar Redux;
- adicionar frequência de hábitos;
- adicionar notificações;
- adicionar gamificação;
- alterar regras do streak;
- adicionar bibliotecas sem necessidade;
- criar abstrações especulativas.

---

# 25. Estratégia de Uso com Codex

Evitar:

```text
"Implemente o Habit Tracker descrito nesses documentos."
```

Preferir:

```text
"Implemente o Milestone 2 do Implementation Plan.

Use PRD, UX Specification e Technical Specification
como fontes de verdade.

Não implemente milestones posteriores."
```

Depois:

```text
Revisar
↓
Testar
↓
Commit
↓
Próximo milestone
```

---

# 26. Ordem Recomendada

```text
M0  Bootstrap
 ↓
M1  Date Foundation
 ↓
M2  Domain
 ↓
M3  SQLite
 ↓
M4  Design System
 ↓
M5  Home UI
 ↓
M6  Home Data
 ↓
M7  Create Habit
 ↓
M8  DayStatus
 ↓
M9  Empty State
 ↓
M10 Details
 ↓
M11 Calendar
 ↓
M12 Calendar Interaction
 ↓
M13 Edit
 ↓
M14 Delete
 ↓
M15 Microinteractions
 ↓
M16 Record Feedback
 ↓
M17 Accessibility
 ↓
M18 Edge Cases
 ↓
M19 Performance
 ↓
M20 Stabilization
```

---

# 27. Resultado Esperado

Ao final desse plano teremos um MVP que permite:

```text
Criar hábito
      ↓
Acompanhar últimos 6 dias
      ↓
Marcar/desmarcar
      ↓
Acompanhar streak
      ↓
Acompanhar total
      ↓
Acompanhar recorde
      ↓
Consultar calendário
      ↓
Editar histórico
```

Tudo:

- local;
- offline;
- rápido;
- minimalista;
- testável;
- visualmente consistente.