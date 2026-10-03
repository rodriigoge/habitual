# AGENTS.md

## Project

Habit Tracker Mobile

A minimalist, local-first mobile habit tracker focused on consistency and accumulated progress.

The product's main differentiator is its UX/UI quality, not feature quantity.

---

# Sources of Truth

Before implementing or modifying behavior, consult the project documentation.

Priority order:

1. `docs/PRD.md`
2. `docs/UX_SPEC.md`
3. `docs/TECHNICAL_SPEC.md`
4. `docs/IMPLEMENTATION_PLAN.md`
5. Existing code

These documents define product behavior, UX, architecture and implementation strategy.

If documentation and code disagree, do not silently change the documented behavior to match the code.

Identify and resolve the discrepancy explicitly.

---

# Product Principles

The product must remain:

- simple;
- fast;
- minimal;
- local-first;
- offline-first;
- visually refined;
- easy to understand.

The application should do a small number of things extremely well.

Do not add functionality merely because it is common in habit-tracking applications.

---

# Core Product Model

A user creates habits.

A habit initially requires only:

- name.

Each habit tracks:

- current streak;
- total completions;
- best streak;
- completion history.

The completion history is the source of truth for metrics.

---

# Home

The Home screen is the primary application surface.

Each habit must display:

- habit name;
- current streak;
- total completions;
- current day;
- previous five days.

Exactly six days must be displayed:

```text
today - 5
today - 4
today - 3
today - 2
today - 1
today
```

All valid displayed days are interactive.

---

# Completion

A habit can have at most one completion per calendar day.

Completion is toggled through the day control.

Marking:

```text
not completed
→
completed
```

Unmarking:

```text
completed
→
not completed
```

The interaction must immediately update:

- visual state;
- total completions;
- current streak;
- best streak when applicable.

---

# Total Completions

Total completions represents the number of persisted completion dates.

Conceptually:

```text
mark → total + 1
unmark → total - 1
```

The persisted completion history remains the source of truth.

---

# Current Streak

Current streak represents consecutive completed calendar days.

Important rule:

The current day does not break an existing streak simply because it has not been completed yet.

Example:

```text
29 ✓
30 ✓
01 ✓
02 ○ ← today
```

Current streak:

```text
3
```

If yesterday is also incomplete:

```text
30 ✓
01 ○
02 ○ ← today
```

Current streak:

```text
0
```

Do not change this rule without an explicit product decision.

---

# Best Streak

Best streak represents the longest sequence of consecutive completed days in the complete history.

Retroactive history changes may increase or decrease this value.

Always derive it from completion history.

---

# Historical Editing

The user may edit previous completion dates.

On Home:

- today;
- previous five days.

On Habit Details:

- any valid historical date.

A historical change may alter:

- current streak;
- best streak;
- total completions.

Recalculate accordingly.

---

# Invalid Dates

Never allow completion for:

- future dates;
- dates before the habit creation date.

The UI must prevent these interactions.

The domain/application layer must also validate them.

Do not rely only on UI validation.

---

# Habit Details

Habit Details must provide:

- habit name;
- current streak;
- total completions;
- best streak;
- calendar history.

The calendar must allow valid historical completion editing.

---

# Calendar

Calendar states include:

- normal;
- completed;
- today;
- today completed;
- disabled.

Future dates are disabled.

Dates before habit creation are disabled.

Do not use future months as meaningful navigation.

---

# Product Scope

The MVP intentionally does NOT include:

- configurable frequency;
- specific weekdays;
- weekly targets;
- categories;
- tags;
- habit groups;
- routines;
- XP;
- points;
- levels;
- currencies;
- rankings;
- social features;
- achievements;
- advanced analytics;
- AI;
- sharing;
- challenges;
- integrations;
- backend;
- authentication;
- cloud synchronization.

Do not implement these unless explicitly requested.

---

# Technology

Use:

- React Native;
- Expo;
- TypeScript;
- Expo Router;
- SQLite.

The MVP does not require a backend.

Do not introduce one.

---

# Architecture

Follow:

```text
UI
 ↓
Application
 ↓
Domain
 ↓
Data
```

Responsibilities must remain separated.

---

# UI Layer

Responsible for:

- rendering;
- user interaction;
- navigation;
- animations;
- visual state.

Do not implement streak algorithms inside React components.

Do not execute raw SQL inside screens or UI components.

---

# Application Layer

Coordinates use cases such as:

- CreateHabit;
- UpdateHabit;
- DeleteHabit;
- ToggleHabitCompletion.

Keep use cases explicit.

Avoid unnecessary framework abstractions.

---

# Domain Layer

Contains:

- Habit;
- HabitCompletion;
- HabitMetrics;
- completion validation;
- streak calculation;
- domain rules.

Domain functions should be pure whenever practical.

The domain must not depend on React Native or SQLite.

---

# Data Layer

Responsible for:

- SQLite;
- migrations;
- SQL queries;
- repository implementations.

UI components must not access SQLite directly.

---

# LocalDate

Habit completion operates on local calendar dates.

Canonical format:

```text
YYYY-MM-DD
```

Example:

```text
2026-10-02
```

Do not use UTC timestamps as the identity of a habit completion day.

Centralize date operations.

Do not scatter manual date-string manipulation across the project.

---

# Persistence

Core tables:

```text
habits
habit_completions
```

A completion must enforce:

```text
UNIQUE(habit_id, date)
```

Habit deletion must remove related completion history.

Use foreign-key cascade behavior.

---

# Metrics

Use a pure domain function conceptually equivalent to:

```ts
calculateHabitMetrics(
  completionDates,
  today
)
```

Returning:

```ts
{
  currentStreak,
  bestStreak,
  totalCompletions
}
```

Do not duplicate metric calculation logic across components.

---

# State Management

Prefer:

- local React state;
- hooks;
- derived state.

Do not add Redux.

Do not add a global state library unless a concrete requirement demonstrates that it is needed.

If global state becomes necessary, justify the addition before introducing it.

---

# Repository

UI must communicate with persistence through appropriate application/repository boundaries.

Do not create generic repositories or generic service layers without a concrete need.

Prefer explicit domain-oriented APIs.

---

# Optimistic UI

Habit completion interaction must feel immediate.

Preferred flow:

```text
tap
↓
update UI
↓
persist
↓
success
```

If persistence fails:

```text
rollback
↓
show discreet feedback
```

Never make the user wait unnecessarily for a local database operation before showing completion feedback.

---

# Visual Direction

The selected visual direction is:

**Editorial / Typographic**

Core characteristics:

- typography as a primary visual element;
- prominent metrics;
- generous whitespace;
- minimal icon usage;
- restrained surfaces;
- minimal shadows;
- limited color palette;
- progress communicated visually;
- clean hierarchy.

Avoid making the application look like a generic dashboard.

Avoid excessive nested cards.

---

# DayStatus

The visual control representing a day is conceptually named:

`DayStatus`

It behaves like a checkbox but does not need to visually resemble a traditional checkbox.

Its final visual design may evolve.

Required behavior must remain stable.

It represents:

- date;
- completion state;
- today state;
- disabled state.

It must have an accessible touch target even if the visual element is small.

---

# Design System

Use semantic tokens.

Examples:

```text
background
surface
textPrimary
textSecondary
accent
completed
inactive
danger
border
```

Do not scatter hardcoded colors throughout components.

Use shared spacing and typography scales.

Avoid arbitrary repeated visual values.

---

# Animations

Animations should communicate state changes.

Appropriate uses:

- DayStatus completion;
- streak changes;
- total changes;
- new habit appearance;
- habit deletion;
- bottom sheets;
- calendar transitions.

Avoid:

- confetti;
- long animations;
- decorative looping animations;
- animations that delay interaction.

---

# Haptics

Haptic feedback may be used for:

- habit completion;
- new streak record;
- destructive confirmation.

Haptics must never be required for functionality.

---

# Accessibility

Do not communicate completion through color alone.

Interactive elements must provide appropriate accessibility labels.

Example:

```text
"October 2, Academia, completed"
```

Ensure reasonable touch targets and text readability.

---

# Code Organization

Prefer feature-based organization.

Example:

```text
src/
  features/
    habits/
      application/
      components/
      domain/
      hooks/
      repository/
```

Shared utilities should only contain genuinely shared concepts.

Avoid dumping unrelated code into:

```text
utils/
services/
helpers/
```

---

# TypeScript

Use strict typing.

Avoid:

```ts
any
```

unless absolutely necessary and explicitly justified.

Prefer domain types over loosely structured objects.

Do not suppress TypeScript errors simply to complete a task.

---

# Dependencies

Before adding a dependency:

1. verify that existing dependencies do not already solve the problem;
2. verify that the platform does not provide the required capability;
3. ensure the dependency provides meaningful value;
4. ensure compatibility with the project's Expo version.

Do not add dependencies for trivial utilities.

---

# Avoid Overengineering

Do not introduce:

- CQRS;
- Event Bus;
- dependency injection frameworks;
- generic repositories;
- BaseService;
- BaseUseCase;
- Redux;
- backend services;
- REST APIs;
- speculative caching;
- plugin systems;
- unnecessary DTO layers.

Prefer explicit, readable code.

---

# Testing

Domain rules require unit tests.

High-priority test target:

```text
calculateHabitMetrics
```

Cover:

- empty history;
- today only;
- yesterday only;
- broken streak;
- current streak;
- best streak;
- retroactive completion;
- retroactive removal;
- month transitions;
- year transitions;
- leap years;
- unordered input;
- duplicate defensive input.

Repository behavior must also be tested where practical.

---

# Implementation Workflow

Work on one milestone at a time.

Before implementing:

1. read the requested milestone;
2. inspect relevant existing code;
3. consult the appropriate source-of-truth documents.

During implementation:

1. stay inside milestone scope;
2. reuse existing components;
3. maintain architectural boundaries;
4. add tests where appropriate.

Before finishing:

1. run typecheck;
2. run lint;
3. run relevant tests;
4. review warnings;
5. verify milestone acceptance criteria.

---

# Scope Discipline

Do not implement later milestones because they appear convenient.

Example:

If implementing the Home static UI, do not also implement:

- calendar;
- authentication;
- notifications;
- cloud sync.

Complete the requested milestone only.

---

# Documentation Changes

If implementation requires changing a documented product rule:

**stop and surface the conflict.**

Do not silently change:

- PRD;
- streak rules;
- UX behavior;
- architecture.

Product decisions must remain intentional.

---

# Code Quality

Prefer code that is:

- obvious;
- small;
- explicit;
- testable;
- maintainable.

A simple implementation that satisfies current requirements is preferred over a complex implementation designed for hypothetical future requirements.

---

# Final Principle

This product differentiates through:

**simplicity + consistency + visual quality.**

Technical decisions should protect those characteristics rather than increase feature count or architectural complexity.