# SetForge — Claude Code Agent Instructions

You are working on a desktop gym rep counter app built with **Tauri v2** (Rust backend) and **SvelteKit** (TypeScript frontend). Read this entire file before making any changes.

---

## Project Overview

A manual rep counting app for weightlifting. Users select an exercise, tap to count reps, optionally log weight, save the set, and review workout history. It is a single-user desktop app — no auth, no server, no multi-device sync.

### Key Reference Files

- **docs/ui-spec.md** — What the app should do: every screen, interaction, and validation rule. Read before building any UI.
- **docs/project-status.md** — Where we are: current phase, task-by-task progress, and what's next. Read when the user asks for "status" or "next". Update after completing tasks.

### Slash Commands

- `/status` — Show current phase and progress summary
- `/next` — Show the next task to work on and what it involves
- `/done` — Mark a task as complete and update project-status.md
- `/review` — Run all sensors and check conventions
- `/test` — Run the full test suite (frontend + backend)

When updating docs/project-status.md, change the task status emoji (⬜→🔄→✅), add notes, and update the Steering Log if you changed any harness files.

---

## Architecture Rules

### Separation of Concerns

The frontend and backend are strictly separated:

- **Frontend (`src/`)**: All UI rendering, user interaction, and client-side state. SvelteKit handles routing and components.
- **Backend (`src-tauri/`)**: Data persistence, file system access, and any operations that need native OS capabilities. Accessed exclusively through Tauri commands.
- **Never** import from `src-tauri/` in frontend code. Use `@tauri-apps/api` to invoke commands.
- **Never** put UI logic or DOM manipulation in Rust code.

### Feature Folder Structure

Code is organized by **feature**, not by technical role. Each feature is a self-contained folder with its own components, store, service, types, and utils. This keeps related code together and makes boundaries obvious.

```
src/
├── lib/
│   ├── features/
│   │   ├── counter/                  ← The rep counting feature
│   │   │   ├── components/
│   │   │   │   ├── RepCounter.svelte       Main tap-to-count area
│   │   │   │   ├── RepCounter.test.ts
│   │   │   │   ├── SetList.svelte          Previous sets display
│   │   │   │   ├── SetList.test.ts
│   │   │   │   ├── WeightInput.svelte      Weight field + steppers
│   │   │   │   └── WeightInput.test.ts
│   │   │   ├── counterStore.svelte.ts      State for active workout
│   │   │   ├── counterStore.test.ts
│   │   │   ├── counter.service.ts          Tauri calls for saving sets
│   │   │   ├── counter.service.test.ts
│   │   │   └── types.ts                   Counter-specific types (if any)
│   │   │
│   │   ├── exercises/                ← Exercise library feature
│   │   │   ├── components/
│   │   │   │   ├── ExercisePicker.svelte   Full-screen search + select
│   │   │   │   ├── ExercisePicker.test.ts
│   │   │   │   ├── ExerciseList.svelte     Grouped list with sections
│   │   │   │   ├── ExerciseList.test.ts
│   │   │   │   ├── AddExerciseForm.svelte  Inline form for custom exercises
│   │   │   │   └── AddExerciseForm.test.ts
│   │   │   ├── exerciseStore.svelte.ts     Exercise list state + search
│   │   │   ├── exerciseStore.test.ts
│   │   │   ├── exercise.service.ts         Tauri calls for custom exercises
│   │   │   ├── exercise.service.test.ts
│   │   │   ├── defaultExercises.ts         Built-in exercise data (constant)
│   │   │   └── types.ts
│   │   │
│   │   ├── history/                  ← Workout history feature
│   │   │   ├── components/
│   │   │   │   ├── WorkoutCard.svelte      Summary card for one workout
│   │   │   │   ├── WorkoutCard.test.ts
│   │   │   │   ├── WorkoutDetail.svelte    Expanded set-by-set view
│   │   │   │   └── WorkoutDetail.test.ts
│   │   │   ├── historyStore.svelte.ts      Past workouts state
│   │   │   ├── historyStore.test.ts
│   │   │   ├── history.service.ts          Tauri calls for loading history
│   │   │   ├── history.service.test.ts
│   │   │   └── types.ts
│   │   │
│   │   └── settings/                 ← Font scale, weight unit prefs
│   │       ├── components/
│   │       │   ├── FontScaleControl.svelte  A−/A+ buttons
│   │       │   └── FontScaleControl.test.ts
│   │       ├── settingsStore.svelte.ts      User preferences state
│   │       ├── settingsStore.test.ts
│   │       ├── settings.service.ts          Tauri calls for persisting prefs
│   │       └── settings.service.test.ts
│   │
│   ├── shared/                       ← Truly shared code (used by 2+ features)
│   │   ├── components/
│   │   │   ├── BottomNav.svelte            App navigation
│   │   │   ├── BottomNav.test.ts
│   │   │   ├── ConfirmDialog.svelte        Reusable confirmation modal
│   │   │   ├── ConfirmDialog.test.ts
│   │   │   ├── SwipeToReveal.svelte        Reusable swipe gesture wrapper
│   │   │   └── SwipeToReveal.test.ts
│   │   ├── types/
│   │   │   ├── exercise.ts                 Exercise, MuscleGroup
│   │   │   ├── workout.ts                  Workout, WorkoutSet, WeightUnit
│   │   │   ├── settings.ts                 UserSettings, FontScale
│   │   │   └── common.ts                   ServiceResult<T>, etc.
│   │   └── utils/
│   │       ├── formatDate.ts               Date display helpers
│   │       ├── formatDate.test.ts
│   │       ├── uuid.ts                     ID generation
│   │       └── uuid.test.ts
│   │
│   └── app.css                       ← Global Tailwind imports + root font size
│
├── routes/
│   ├── +layout.svelte                ← App shell: BottomNav, font scale init
│   ├── +page.svelte                  ← Counter screen (composes counter feature)
│   ├── history/
│   │   └── +page.svelte              ← History screen (composes history feature)
│   └── exercises/
│       └── +page.svelte              ← Exercises screen (composes exercises feature)
```

### Feature Folder Rules

**Each feature folder is self-contained:**
- A feature has its own `components/`, its own store, its own service, and optionally its own `types.ts` for types used only within that feature.
- A feature's store is the single entry point for its state. Routes import the store; the store uses the service internally.
- A feature's service is the only file in that feature that calls `@tauri-apps/api`.

**Cross-feature imports go through `shared/`:**
- If two features need the same type (e.g., `Exercise`), that type lives in `shared/types/`.
- If two features need the same UI pattern (e.g., `ConfirmDialog`), that component lives in `shared/components/`.
- A feature may import from `shared/`. A feature must NEVER import from another feature.

**When does code move to `shared/`?**
- **Types**: Domain types (`Exercise`, `Workout`, `WorkoutSet`, `UserSettings`) start in `shared/types/` because they're used across features from the beginning.
- **Components**: A component starts inside its feature. Only move it to `shared/components/` when a second feature needs it. Don't pre-emptively share.
- **Utils**: Pure functions go in `shared/utils/` from the start since they have no feature affiliation.

**What about the Rust backend?**
The same feature separation applies. Each domain has its own command file, model file, and a repository (data access) file. Logic lives in the repository, not in the command handler.

```
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── src/
│   ├── main.rs                    ← Entry point, registers all commands
│   ├── commands/
│   │   ├── mod.rs                 ← Re-exports all command modules
│   │   ├── workout.rs             ← Tauri commands for workouts and sets
│   │   ├── exercise.rs            ← Tauri commands for custom exercises
│   │   └── settings.rs            ← Tauri commands for user preferences
│   ├── models/
│   │   ├── mod.rs                 ← Re-exports all model modules
│   │   ├── workout.rs             ← Workout, WorkoutSet structs
│   │   ├── exercise.rs            ← Exercise struct
│   │   └── settings.rs            ← UserSettings, FontScale structs
│   ├── repo/
│   │   ├── mod.rs                 ← Re-exports all repo modules
│   │   ├── workout_repo.rs        ← CRUD logic for workouts (DB queries)
│   │   ├── exercise_repo.rs       ← CRUD logic for custom exercises
│   │   └── settings_repo.rs       ← Read/write user settings
│   └── db/
│       └── mod.rs                 ← Database connection, migrations, schema
└── tests/                         ← Integration tests (test crate boundary)
    └── workout_integration.rs     ← Tests that span multiple modules
```

**Rust module boundaries:**
```
commands → repo → db
commands → models
repo → models
repo → db

NEVER: models → commands  (models don't know about commands)
NEVER: models → repo      (models are plain data, no logic)
NEVER: commands → commands (no cross-command imports)
```

**Why the three-layer split?**
- **Commands** (`commands/`): Thin Tauri command handlers. Extract arguments, call the repo, return results. No business logic, no SQL.
- **Repositories** (`repo/`): All data access and business logic. Receive plain Rust types, return `Result<T, E>`. Testable without Tauri.
- **Models** (`models/`): Plain structs with `Serialize`/`Deserialize`. No methods beyond basic constructors and validation. No dependencies on other modules.

### Import Direction (one-way dependencies)

```
routes → features/*/components
routes → features/*/store
features/*/store → features/*/service → @tauri-apps/api
features/*/store → shared/types
features/*/components → shared/types
features/*/components → shared/components
features/* → shared/utils
shared/utils → (nothing — pure functions)

NEVER: features/counter → features/history  (no cross-feature imports)
NEVER: shared → features/*  (shared never depends on a feature)
NEVER: components → stores  (data flows down via props)
```

### Rules for Route Files (`+page.svelte`, `+layout.svelte`)

- These are composition layers. They wire feature components to feature stores.
- Script sections must be under 50 lines.
- No function definitions longer than 5 lines.
- No direct Tauri invoke calls.
- No complex computed values — put those in the feature store.
- Each route imports from exactly one feature (the route's primary feature) plus `shared/`.

---

## Data Model

### TypeScript Types (`src/lib/shared/types/`)

```typescript
// exercise.ts
export interface Exercise {
  id: string;           // UUID v4
  name: string;         // e.g. "Bench Press"
  muscleGroup: MuscleGroup;
  isCustom: boolean;    // false for built-in exercises
}

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'core'
  | 'fullBody';

// workout.ts
export interface WorkoutSet {
  id: string;           // UUID v4
  exerciseId: string;   // FK to Exercise.id
  reps: number;         // must be >= 0
  weight: number | null; // in user's preferred unit, null if bodyweight
  unit: WeightUnit;
  timestamp: string;    // ISO 8601
  notes: string;        // optional, defaults to ""
}

export type WeightUnit = 'kg' | 'lb';

export interface Workout {
  id: string;           // UUID v4
  date: string;         // ISO 8601 date (YYYY-MM-DD)
  sets: WorkoutSet[];
  durationMinutes: number | null; // calculated or null if not tracked
}

// stats.ts
export interface ExerciseHistory {
  exerciseId: string;
  exerciseName: string;
  totalSets: number;
  totalReps: number;
  maxWeight: number | null;
  lastPerformed: string; // ISO 8601
}

// settings.ts
export type FontScale = 'small' | 'medium' | 'large' | 'extraLarge';

export interface UserSettings {
  fontScale: FontScale;        // default: 'medium'
  weightUnit: WeightUnit;      // default: 'lb'
  lastExerciseId: string | null;
}

export const FONT_SCALE_VALUES: Record<FontScale, number> = {
  small: 14,
  medium: 18,
  large: 24,
  extraLarge: 32,
};
```

### Rust Types (`src-tauri/src/models/`)

Mirror the TypeScript types exactly using serde for serialization. Use the same field names (camelCase in JSON, snake_case in Rust with `#[serde(rename_all = "camelCase")]`).

### Default Exercises

Ship with a built-in set of exercises. Store them as a constant, not in the database. Users can add custom exercises which ARE persisted.

```
Chest: Bench Press, Incline Bench Press, Dumbbell Fly, Push-Up
Back: Pull-Up, Barbell Row, Lat Pulldown, Deadlift
Shoulders: Overhead Press, Lateral Raise, Face Pull
Biceps: Barbell Curl, Dumbbell Curl, Hammer Curl
Triceps: Tricep Dip, Tricep Pushdown, Skull Crusher
Legs: Squat, Leg Press, Lunges, Romanian Deadlift, Calf Raise
Core: Plank, Crunch, Hanging Leg Raise
Full Body: Burpee, Clean and Press, Turkish Get-Up
```

---

## Coding Conventions

### TypeScript / Svelte

- **Strict mode**: `"strict": true` in tsconfig.json. No `any` types anywhere.
- **Svelte 5 runes**: Use `$state()`, `$derived()`, `$effect()` — not the legacy `$:` reactive syntax.
- **Explicit return types** on all exported functions and all functions longer than one line.
- **`const` over `let`** unless reassignment is genuinely needed.
- **Naming**:
  - Components: `PascalCase.svelte` (e.g., `RepCounter.svelte`, `SetCard.svelte`)
  - Stores: `camelCase.svelte.ts` (e.g., `workoutStore.svelte.ts`)
  - Services: `camelCase.service.ts` (e.g., `workout.service.ts`)
  - Types: `camelCase.ts` with PascalCase interfaces (e.g., `workout.ts` → `Workout`)
  - Utils: `camelCase.ts` (e.g., `formatDate.ts`, `repCalculations.ts`)
- **No barrel files** (`index.ts` re-exports). Import directly from the source file.
- **No enums**. Use union types (e.g., `type MuscleGroup = 'chest' | 'back' | ...`).

### Rust

- Follow standard Rust conventions: `snake_case` for functions, variables, and modules; `PascalCase` for types and structs.
- All Tauri commands return `Result<T, String>` for consistent error handling on the frontend.
- Use `#[tauri::command]` attribute on command functions.
- Keep command functions thin — they extract arguments and delegate to repo functions. A command function should be no more than 10 lines.
- Group commands by domain in separate files under `src/commands/`.
- All data access logic goes in `src/repo/` — repositories receive and return plain Rust types.
- Models in `src/models/` are plain structs. Derive `Serialize`, `Deserialize`, `Clone`, `Debug` on all of them. Use `#[serde(rename_all = "camelCase")]` so field names match the TypeScript types.
- Use `Result` and the `?` operator for error propagation — don't use `.unwrap()` or `.expect()` in production code.
- Handle all errors explicitly. Convert database errors to meaningful strings at the command layer.
- Enable the `test` feature flag in `Cargo.toml` for Tauri test utilities:
  ```toml
  [dependencies]
  tauri = { version = "2", features = ["test"] }
  ```
- Prefer `&str` over `String` in function parameters when the function doesn't need ownership.
- Use `uuid` crate for ID generation, matching the frontend.

### Styling

- **Tailwind CSS** is the primary styling system.
- **Component `<style>` blocks are allowed** — this is the Svelte-idiomatic approach. Use `@apply` inside a component's `<style>` block to give repeated Tailwind class groups a semantic name local to that component (e.g., `.step-btn`, `.exercise-row`). Scoping is automatic. Always start the block with `@reference "tailwindcss";` (Tailwind v4 requires this for `@apply` in isolated component styles).
- **No arbitrary CSS** in `<style>` blocks — only `@apply` with Tailwind utilities. Do not write raw `color:`, `padding:`, `font-size:` etc.
- **`app.css`** is for truly global utilities that are needed across multiple unrelated components (e.g., `.focus-ring`, `.rep-pulse` keyframe). Keep it small.
- Use Tailwind's design tokens for spacing, colors, fonts — don't use arbitrary values like `p-[13px]` unless no token fits.
- Dark mode: design for dark mode first (gym context — dark UI is easier on the eyes mid-workout). Support light mode as secondary.
- **All sizing in `rem`**: Font sizes, paddings, margins, gap, min-height on touch targets — all must use `rem` so they scale when the root font size changes. The only exception is borders and outlines which can use `px`.
- **Touch targets**: All tappable elements must be at least `3rem` tall (48px at default). Primary actions (rep count area, Save Set) must be at least `3.5rem` tall. Use `min-h-` Tailwind utilities.
- **Font scale store**: The `settingsStore` manages the current `FontScale` value and applies it by setting `document.documentElement.style.fontSize` to the corresponding pixel value. All `rem`-based sizing then scales automatically.
- **No `px` for layout**: Do not use pixel values for font-size, padding, margin, width, height, or gap. Tailwind's default spacing scale is already `rem`-based, so standard classes like `p-4`, `text-lg`, `min-h-12` are fine.
- **Responsive behaviour**: Layouts must not overflow, clip, or break at any font scale level (small through extraLarge). Test by setting the root font size to 32px and verifying no horizontal scroll or overlapping elements appear.

### Error Handling

The error flow is: Rust repo → Rust command → Frontend service → Store → Component → User.

**Rust side**: Repo functions return `Result<T, String>`. Commands catch repo errors and return `Result<T, String>` to the frontend. Use meaningful error messages, not raw database errors:
```rust
// In command:
workout_repo::save_set(&conn, &set)
    .map_err(|e| format!("Failed to save set: {}", e))?;
```

**Service layer**: Services call `invoke()`, catch errors, and return `ServiceResult<T>`:
```typescript
// src/lib/shared/types/common.ts
export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// src/lib/features/counter/counter.service.ts
import { invoke } from '@tauri-apps/api/core';
import type { ServiceResult } from '$lib/shared/types/common';
import type { WorkoutSet } from '$lib/shared/types/workout';

export async function saveSet(set: WorkoutSet): Promise<ServiceResult<void>> {
  try {
    await invoke('save_workout_set', { set });
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
```

**Store layer**: Stores call services and expose error state:
```typescript
// In a store:
let error = $state<string | null>(null);

async function saveCurrentSet(): Promise<void> {
  error = null;
  const result = await saveSet(currentSet);
  if (!result.ok) {
    error = result.error;
    return;
  }
  // success: reset count, advance set number, etc.
}
```

**Component layer**: Components receive error via props and display it inline:
```svelte
<!-- In a component: -->
{#if error}
  <p role="alert" class="text-red-400 text-sm mt-2">{error}</p>
{/if}
```

**Rules**:
- Never use `try/catch` in components or stores for Tauri calls — that's the service's job.
- Never show raw error strings from Rust to the user. Services should sanitize.
- Use `role="alert"` on error messages so screen readers announce them.
- Errors are transient — clear them when the user takes a new action.

### Database Schema

SQLite tables (created in `src-tauri/src/db/mod.rs`):

```sql
CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    duration_minutes INTEGER
);

CREATE TABLE IF NOT EXISTS sets (
    id TEXT PRIMARY KEY,
    workout_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    reps INTEGER NOT NULL,
    weight REAL,
    unit TEXT NOT NULL DEFAULT 'lb',
    timestamp TEXT NOT NULL,
    notes TEXT DEFAULT '',
    FOREIGN KEY (workout_id) REFERENCES workouts(id)
);

CREATE TABLE IF NOT EXISTS custom_exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    muscle_group TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

**Schema rules**:
- Schema changes are managed by a versioned migration system in `src-tauri/src/db/mod.rs`. On startup, `migrate_db()` reads the current version from `schema_version`, then applies any pending migrations in order inside individual transactions.
- **Never edit existing entries in `MIGRATIONS`.** Only append new ones with the next version number. This ensures existing user DBs are upgraded correctly.
- Migration 1 is the original 4-table schema (`workouts`, `sets`, `custom_exercises`, `settings`). All migrations use `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE` — never `DROP TABLE`.
- All IDs are UUID v4 strings, generated by the frontend (TypeScript `crypto.randomUUID()`) and passed to Rust.
- Dates are ISO 8601 strings, not SQLite date types.
- The `settings` table is a simple key-value store for user preferences (font_scale, weight_unit, last_exercise_id).
- Exercise names are case-insensitive unique (`COLLATE NOCASE`).

---

## Testing Requirements

### Testing Stack

- **Vitest** — test runner, assertions, mocking
- **@testing-library/svelte** — render Svelte components into a DOM for testing
- **@testing-library/user-event** — simulate realistic user interactions (clicks, typing, keyboard)
- **@testing-library/jest-dom** — extra DOM matchers (`toBeInTheDocument`, `toBeVisible`, `toHaveTextContent`, etc.)
- **Playwright** — end-to-end tests (add in Phase 4+, not needed initially)

Install all test dependencies:
```bash
npm install -D vitest @testing-library/svelte @testing-library/user-event @testing-library/jest-dom
```

Add the `svelteTesting` plugin to your Vite config:
```typescript
// vite.config.ts
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
});
```

### What to Test

| Layer | What to test | How |
|---|---|---|
| **Stores** | Initial state, all mutations, derived values, edge cases, error states | Import store directly, call functions, assert state changes |
| **Utils** | Normal input, boundary values, invalid input | Pure function tests, no DOM needed |
| **Services** | Tauri invoke calls with mocked backend | `vi.mock('@tauri-apps/api')`, assert invoke called with correct args |
| **Components** | Rendering, user interactions, prop variations, accessibility | `@testing-library/svelte` render + `user-event` interactions |
| **Rust commands** | Command logic with test data | `#[cfg(test)]` module in each command file |

### Two Types of Component Tests

Every component needs BOTH rendering tests and interaction tests.

**Rendering tests** — Does the component show the right content for given props?

```typescript
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import RepCounter from './RepCounter.svelte';

test('displays the exercise name', () => {
  render(RepCounter, { exerciseName: 'Bench Press', reps: 0 });
  expect(screen.getByText('Bench Press')).toBeInTheDocument();
});

test('displays the current rep count', () => {
  render(RepCounter, { exerciseName: 'Squat', reps: 8 });
  expect(screen.getByText('8')).toBeInTheDocument();
});

test('shows set number', () => {
  render(RepCounter, { exerciseName: 'Squat', reps: 0, setNumber: 3 });
  expect(screen.getByText(/set 3/i)).toBeInTheDocument();
});
```

**Interaction tests** — Does the component respond correctly when the user taps, clicks, or types?

```typescript
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import RepCounter from './RepCounter.svelte';

test('tapping the count area increments reps', async () => {
  const user = userEvent.setup();
  render(RepCounter, { exerciseName: 'Bench Press', reps: 0 });

  const countArea = screen.getByRole('button', { name: /tap to count/i });
  await user.click(countArea);
  await user.click(countArea);
  await user.click(countArea);

  expect(screen.getByText('3')).toBeInTheDocument();
});

test('minus button decrements reps', async () => {
  const user = userEvent.setup();
  render(RepCounter, { exerciseName: 'Bench Press', reps: 5 });

  const minusButton = screen.getByRole('button', { name: /decrement/i });
  await user.click(minusButton);

  expect(screen.getByText('4')).toBeInTheDocument();
});

test('reps cannot go below zero', async () => {
  const user = userEvent.setup();
  render(RepCounter, { exerciseName: 'Bench Press', reps: 0 });

  const minusButton = screen.getByRole('button', { name: /decrement/i });
  await user.click(minusButton);

  expect(screen.getByText('0')).toBeInTheDocument();
});

test('cannot save a set with zero reps', async () => {
  const user = userEvent.setup();
  render(RepCounter, { exerciseName: 'Squat', reps: 0 });

  const saveButton = screen.getByRole('button', { name: /save set/i });
  await user.click(saveButton);

  expect(screen.getByText(/add some reps first/i)).toBeInTheDocument();
});

test('weight stepper increases by increment', async () => {
  const user = userEvent.setup();
  render(WeightInput, { weight: 135, unit: 'lb' });

  const plusButton = screen.getByRole('button', { name: /increase weight/i });
  await user.click(plusButton);

  expect(screen.getByDisplayValue('140')).toBeInTheDocument();
});
```

### Querying Elements — Prefer Accessible Queries

Use queries that reflect how users and assistive technology find elements. In order of preference:

1. **`getByRole`** — best. Finds by ARIA role: `getByRole('button', { name: /save set/i })`. This also tests that your element has the correct accessibility role.
2. **`getByText`** — for non-interactive text content: `getByText('Set 3 of 3')`.
3. **`getByLabelText`** — for form inputs: `getByLabelText(/weight/i)`.
4. **`getByPlaceholderText`** — acceptable for search inputs: `getByPlaceholderText(/search exercises/i)`.
5. **`getByDisplayValue`** — for inputs with a current value: `getByDisplayValue('135')`.
6. **`getByTestId`** — last resort only. Use `data-testid` only when no semantic query works.

**Never** query by CSS class name, component internal state, or DOM structure. These are implementation details that break when the UI is refactored.

### Testing User Flows (Multi-Step Interactions)

For flows that span multiple interactions, write tests that mirror the actual user sequence:

```typescript
test('full set logging flow: select exercise, count reps, save', async () => {
  const user = userEvent.setup();
  render(CounterPage);

  // Select exercise
  const exerciseSelector = screen.getByRole('button', { name: /select exercise/i });
  await user.click(exerciseSelector);
  await user.click(screen.getByText('Squat'));

  // Count reps
  const countArea = screen.getByRole('button', { name: /tap to count/i });
  for (let i = 0; i < 8; i++) {
    await user.click(countArea);
  }
  expect(screen.getByText('8')).toBeInTheDocument();

  // Save set
  const saveButton = screen.getByRole('button', { name: /save set/i });
  await user.click(saveButton);

  // Verify set was saved and counter reset
  expect(screen.getByText('0')).toBeInTheDocument(); // count reset
  expect(screen.getByText(/8 reps/i)).toBeInTheDocument(); // set in list
});
```

### Testing Accessibility

Components must be tested for basic accessibility:

```typescript
test('rep count changes are announced to screen readers', () => {
  render(RepCounter, { exerciseName: 'Bench Press', reps: 5 });

  const liveRegion = screen.getByRole('status'); // aria-live="polite"
  expect(liveRegion).toHaveTextContent('5');
});

test('all interactive elements are keyboard focusable', () => {
  render(RepCounter, { exerciseName: 'Bench Press', reps: 0 });

  const buttons = screen.getAllByRole('button');
  buttons.forEach(button => {
    expect(button).not.toHaveAttribute('tabindex', '-1');
  });
});

test('touch targets meet minimum size', () => {
  render(RepCounter, { exerciseName: 'Bench Press', reps: 0 });

  const saveButton = screen.getByRole('button', { name: /save set/i });
  const rect = saveButton.getBoundingClientRect();
  expect(rect.height).toBeGreaterThanOrEqual(48);
});
```

### Testing Font Scale

At minimum, test that the component renders without overflow at the largest font scale:

```typescript
test('renders without overflow at extra large font scale', () => {
  // Set root font size to 32px (extra large)
  document.documentElement.style.fontSize = '32px';

  render(RepCounter, { exerciseName: 'Bench Press', reps: 12 });

  const container = screen.getByRole('main');
  expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth);

  // Clean up
  document.documentElement.style.fontSize = '';
});
```

### How to Test

- **File location**: Test files live next to source files: `RepCounter.svelte` → `RepCounter.test.ts`.
- **Naming**: `describe('[ComponentName]', () => { test('[user action] [expected result]', ...) })`.
- **Use `test` for interaction tests** (reads more naturally: "test tapping the count area increments reps").
- **Use `describe`/`it` for grouped logic tests** (reads more naturally: "it should reject negative rep count").
- **No snapshot tests** for logic. Snapshot tests are acceptable only for stable UI markup that doesn't contain dynamic content.
- **Test data**: Use factory functions in `tests/fixtures/` to create test data. Don't repeat object literals across tests.

### Test Fixture Factories

```typescript
// tests/fixtures/workout.ts
import type { Exercise, WorkoutSet, Workout } from '$lib/shared/types/workout';

export function createExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'test-exercise-1',
    name: 'Bench Press',
    muscleGroup: 'chest',
    isCustom: false,
    ...overrides,
  };
}

export function createWorkoutSet(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
  return {
    id: 'test-set-1',
    exerciseId: 'test-exercise-1',
    reps: 10,
    weight: 135,
    unit: 'lb',
    timestamp: '2026-04-08T10:00:00Z',
    notes: '',
    ...overrides,
  };
}

export function createWorkout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'test-workout-1',
    date: '2026-04-08',
    sets: [],
    durationMinutes: null,
    ...overrides,
  };
}
```

### Test Coverage Rules

- Every component must have at least one rendering test AND at least one interaction test.
- Every user-facing validation (e.g., "cannot save with zero reps") must have a test.
- Every callback prop must be tested (verify it fires with the correct arguments on the correct user action).
- Tests that only assert a component renders without error and make no content or interaction assertions are not acceptable.

---

## Rust Testing

Rust has a built-in test framework — no external test runner needed. You run all Rust tests with `cargo test` from the `src-tauri/` directory.

### How Rust Tests Work

Rust tests live inside the same file as the code they test, in a module gated by `#[cfg(test)]`. This means test code is only compiled when you run `cargo test`, never in production builds.

```rust
// src-tauri/src/models/workout.rs

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkoutSet {
    pub id: String,
    pub exercise_id: String,
    pub reps: u32,
    pub weight: Option<f64>,
    pub unit: String,
    pub timestamp: String,
    pub notes: String,
}

impl WorkoutSet {
    pub fn new(id: String, exercise_id: String, reps: u32) -> Self {
        Self {
            id,
            exercise_id,
            reps,
            weight: None,
            unit: "lb".to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            notes: String::new(),
        }
    }

    pub fn is_valid(&self) -> bool {
        self.reps > 0 && self.weight.map_or(true, |w| w > 0.0)
    }
}

// ---- Tests live here, in the same file ----

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_set_has_no_weight() {
        let set = WorkoutSet::new(
            "id-1".to_string(),
            "ex-1".to_string(),
            10,
        );
        assert_eq!(set.reps, 10);
        assert!(set.weight.is_none());
    }

    #[test]
    fn set_with_zero_reps_is_invalid() {
        let mut set = WorkoutSet::new(
            "id-1".to_string(),
            "ex-1".to_string(),
            0,
        );
        assert!(!set.is_valid());
    }

    #[test]
    fn set_with_positive_reps_is_valid() {
        let set = WorkoutSet::new(
            "id-1".to_string(),
            "ex-1".to_string(),
            8,
        );
        assert!(set.is_valid());
    }

    #[test]
    fn set_with_negative_weight_is_invalid() {
        let mut set = WorkoutSet::new(
            "id-1".to_string(),
            "ex-1".to_string(),
            8,
        );
        set.weight = Some(-10.0);
        assert!(!set.is_valid());
    }
}
```

### What to Test in Each Rust Layer

| Layer | What to test | Notes |
|---|---|---|
| **Models** (`models/`) | Struct constructors, validation methods, serialization/deserialization | Test that `serde` round-trips correctly (serialize then deserialize and compare). Test all validation edge cases. |
| **Repositories** (`repo/`) | All CRUD operations, query results, error cases | Use an in-memory SQLite database for tests (`:memory:`). Test with empty data, single records, and multiple records. |
| **Commands** (`commands/`) | That the command calls the right repo function and returns the right shape | Use Tauri's mock runtime. Keep these tests minimal — logic should be in the repo. |

### Testing Repositories (Data Access)

Repositories contain the core logic and are the most important Rust tests. Use an in-memory database so tests are fast and isolated:

```rust
// src-tauri/src/repo/workout_repo.rs

use crate::db;
use crate::models::workout::{Workout, WorkoutSet};
use rusqlite::Connection;

pub fn save_set(conn: &Connection, set: &WorkoutSet) -> Result<(), String> {
    conn.execute(
        "INSERT INTO sets (id, exercise_id, reps, weight, unit, timestamp, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            set.id, set.exercise_id, set.reps,
            set.weight, set.unit, set.timestamp, set.notes
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn get_sets_for_workout(
    conn: &Connection,
    workout_id: &str,
) -> Result<Vec<WorkoutSet>, String> {
    // query implementation...
    todo!()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::initialize_db;

    /// Helper: create a fresh in-memory database with schema applied
    fn test_db() -> Connection {
        let conn = Connection::open_in_memory()
            .expect("Failed to open in-memory DB");
        initialize_db(&conn)
            .expect("Failed to apply schema");
        conn
    }

    #[test]
    fn save_and_retrieve_set() {
        let conn = test_db();
        let set = WorkoutSet::new(
            "set-1".to_string(),
            "ex-1".to_string(),
            10,
        );

        save_set(&conn, &set).expect("Failed to save set");

        let sets = get_sets_for_workout(&conn, "workout-1")
            .expect("Failed to get sets");
        assert_eq!(sets.len(), 1);
        assert_eq!(sets[0].reps, 10);
    }

    #[test]
    fn get_sets_returns_empty_for_unknown_workout() {
        let conn = test_db();

        let sets = get_sets_for_workout(&conn, "nonexistent")
            .expect("Failed to get sets");
        assert!(sets.is_empty());
    }

    #[test]
    fn save_set_with_weight() {
        let conn = test_db();
        let mut set = WorkoutSet::new(
            "set-1".to_string(),
            "ex-1".to_string(),
            8,
        );
        set.weight = Some(135.0);
        set.unit = "lb".to_string();

        save_set(&conn, &set).expect("Failed to save set");

        let sets = get_sets_for_workout(&conn, "workout-1")
            .expect("Failed to get sets");
        assert_eq!(sets[0].weight, Some(135.0));
    }
}
```

### Testing Tauri Commands

Commands should be thin — just wiring. Test them with Tauri's built-in mock runtime to verify they call the right repo function and return properly. For most commands, the repo tests cover the real logic.

```rust
// src-tauri/src/commands/workout.rs

use crate::models::workout::WorkoutSet;
use crate::repo::workout_repo;
use tauri::State;
use rusqlite::Connection;
use std::sync::Mutex;

#[tauri::command]
pub fn save_workout_set(
    db: State<'_, Mutex<Connection>>,
    set: WorkoutSet,
) -> Result<(), String> {
    if !set.is_valid() {
        return Err("Invalid set: reps must be > 0".to_string());
    }
    let conn = db.lock().map_err(|e| e.to_string())?;
    workout_repo::save_set(&conn, &set)
}

#[cfg(test)]
mod tests {
    use super::*;

    // For thin commands, you can test the validation logic directly
    // without the full Tauri mock runtime:

    #[test]
    fn rejects_invalid_set() {
        let set = WorkoutSet::new(
            "set-1".to_string(),
            "ex-1".to_string(),
            0, // zero reps — invalid
        );
        assert!(!set.is_valid());
        // The command would return Err before reaching the repo
    }
}
```

For commands that need the full Tauri app context (e.g., accessing managed state), use `tauri::test::mock_app()`:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tauri::Manager;

    #[test]
    fn command_with_state() {
        let app = tauri::test::mock_app();
        let conn = Connection::open_in_memory().unwrap();
        // initialize schema...
        app.manage(Mutex::new(conn));

        let db_state = app.state::<Mutex<Connection>>();
        let set = WorkoutSet::new(
            "set-1".to_string(),
            "ex-1".to_string(),
            10,
        );

        let result = save_workout_set(db_state, set);
        assert!(result.is_ok());
    }
}
```

### Testing Serialization (The Frontend–Backend Contract)

Since the Rust models must serialize to JSON that matches the TypeScript types, test the serialization explicitly:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn workout_set_serializes_to_camel_case() {
        let set = WorkoutSet::new(
            "id-1".to_string(),
            "ex-1".to_string(),
            10,
        );
        let json = serde_json::to_value(&set).unwrap();

        // Verify camelCase field names (matching TypeScript)
        assert!(json.get("exerciseId").is_some());
        assert!(json.get("exercise_id").is_none()); // not snake_case
    }

    #[test]
    fn workout_set_roundtrips_through_json() {
        let original = WorkoutSet::new(
            "id-1".to_string(),
            "ex-1".to_string(),
            10,
        );
        let json = serde_json::to_string(&original).unwrap();
        let deserialized: WorkoutSet = serde_json::from_str(&json).unwrap();

        assert_eq!(original.id, deserialized.id);
        assert_eq!(original.reps, deserialized.reps);
    }
}
```

### Rust Test Naming

Use descriptive names that state the scenario and expected outcome:

```rust
// ✅ Good — reads as a sentence when the test fails
#[test]
fn save_set_with_zero_reps_returns_error() { ... }

#[test]
fn get_workout_history_returns_empty_when_no_workouts() { ... }

#[test]
fn settings_default_to_medium_font_scale() { ... }

// ❌ Bad — too vague, doesn't help when it fails
#[test]
fn test_save() { ... }

#[test]
fn it_works() { ... }
```

### Rust Test Coverage Rules

- Every model struct with validation methods must have tests for valid and invalid cases.
- Every repo function must have at least: a happy-path test, an empty/not-found test, and one error case.
- Every serialized struct must have a camelCase serialization test (this is the contract with the frontend).
- Commands with validation logic must test the validation. Commands that are pure delegation can rely on repo tests.
- Use `assert_eq!` for value comparisons, `assert!` for boolean conditions, and `.expect("meaningful message")` on Results in test setup (not on the code under test).
- Never use `.unwrap()` on the value being tested — use `assert!(result.is_ok())` or match on the `Result`.

### Running Rust Tests

```bash
# Run all Rust tests (local development — full compile)
cd src-tauri && cargo test

# CI environments (ubuntu-latest) — library tests only, avoids needing a display server
cd src-tauri && cargo test --lib

# Run tests for a specific module
cargo test repo::workout_repo

# Run a specific test by name
cargo test save_set_with_zero_reps_returns_error

# Run tests with output (see println! in tests)
cargo test -- --nocapture
```

> **CI note**: On Linux CI runners, `cargo test` (without `--lib`) attempts to compile and link the full Tauri binary, which requires GTK/WebKit native libraries (`libwebkit2gtk-4.1-dev`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`). Both `ci.yml` and `release.yml` install these via `apt-get` before running `cargo test --lib`. When running Rust tests locally on Windows or macOS, the plain `cargo test` command works without this step.

---

## What NOT To Do

These are common agent failure modes. Do not:

- ❌ Install additional state management libraries (no Redux, no Zustand, no Pinia)
- ❌ Install a CSS framework besides Tailwind (no Bootstrap, no Material UI)
- ❌ Write raw CSS properties in `<style>` blocks — use `@apply` with Tailwind utilities only
- ❌ Add arbitrary CSS to `app.css` — it's for global Tailwind utilities only (`.focus-ring`, keyframes)
- ❌ Install an ORM — use raw SQL with Tauri's SQLite plugin or simple JSON storage
- ❌ Create global mutable state outside of Svelte stores
- ❌ Put Tauri `invoke()` calls directly in components — always go through a service
- ❌ Use `var` or implicit `any`
- ❌ Create files outside the defined project structure
- ❌ Add features not specified in the UI spec without asking
- ❌ Write tests that only test the framework (e.g., "it renders without crashing" with no assertions)
- ❌ Query elements by CSS class name, component internal state, or DOM nesting structure — use `getByRole`, `getByText`, `getByLabelText` instead
- ❌ Use `getByTestId` when a semantic query (`getByRole`, `getByText`, `getByLabelText`) would work
- ❌ Use `fireEvent` directly — use `@testing-library/user-event` instead (it simulates real user behaviour more accurately, including focus, pointer events, and input sequences)
- ❌ Write component tests that only check rendering without any interaction tests — every component with interactive elements needs both
- ❌ Assert against component internal state or props — assert against what the user sees in the DOM
- ❌ Use `// @ts-ignore` or `// @ts-expect-error` — fix the type instead
- ❌ Import from `node:` built-in modules in frontend code (this is a browser context via Tauri)
- ❌ Use `console.log` for error handling — use proper error propagation
- ❌ Use `px` units for font-size, padding, margin, gap, width, or height — use `rem` via Tailwind classes
- ❌ Make any interaction depend solely on hover — hover is an enhancement, not a requirement
- ❌ Use native `<select>` dropdowns for the exercise picker — they don't support grouped/searchable UX on mobile
- ❌ Use `long-press` as the only way to access an action — always provide a visible tap alternative
- ❌ Set fixed heights in `px` on containers that hold text — text must be allowed to grow with font scale
- ❌ Use `overflow: hidden` on text containers without also adding `text-overflow: ellipsis` — clipped text with no indicator is invisible to the user
- ❌ Import from one feature into another (e.g., `features/counter/` → `features/history/`). Cross-feature shared code goes in `shared/`.
- ❌ Import from `shared/` into `shared/` types/utils/components (shared modules must be standalone)
- ❌ Pre-emptively move code to `shared/` before a second feature actually needs it
- ❌ Create a `features/[name]/index.ts` barrel file — import from the specific file
- ❌ Use `.unwrap()` or `.expect()` in Rust production code — use `Result` with `?` and handle errors properly
- ❌ Put SQL queries or database logic in Rust command handlers — all data access goes through `repo/`
- ❌ Put business logic in Rust model structs beyond basic validation — complex logic goes in `repo/`
- ❌ Skip the `#[cfg(test)] mod tests` block in any Rust file that contains logic
- ❌ Use `.unwrap()` on the value being tested in Rust tests — use `assert!(result.is_ok())` or pattern match
- ❌ Name Rust tests `test_something` or `it_works` — use descriptive names like `save_set_with_zero_reps_returns_error`
- ❌ Use a file-based database in Rust tests — use `Connection::open_in_memory()` for speed and isolation
- ❌ Skip serialization tests for Rust models — the camelCase JSON output is a contract with the frontend
- ❌ Import between Rust command modules (e.g., `commands::workout` → `commands::exercise`) — shared logic goes in `repo/` or a shared module

---

## Workflow Checklist

After every change, verify:

**Frontend checks:**
1. `npx svelte-check --tsconfig ./tsconfig.json` — zero errors
2. `npx eslint src/` — zero warnings
3. `npx vitest run` — all tests pass (both rendering AND interaction tests)

**Backend checks (if any Rust code changed):**
4. `cd src-tauri && cargo check` — compiles with no errors
5. `cd src-tauri && cargo test` — all tests pass (use `cargo test --lib` on Linux CI)
6. `cd src-tauri && cargo clippy` — no warnings (Rust linter)

**Structure checks:**
7. If you added a new component with interactive elements, confirm it has both rendering AND interaction tests
8. If you added a new store, service, or util, confirm a test file exists for it
9. If you added or changed a Rust repo function, confirm it has unit tests
10. If you added or changed a Rust model, confirm it has a serialization test

If any check fails, fix the issue before moving on. Do not proceed with failing checks.

---

## How to Add Common Things

### Adding a Component to an Existing Feature

1. Identify which feature it belongs to (counter, exercises, history, settings)
2. Create `src/lib/features/[feature]/components/MyComponent.svelte`
3. Define props using `let { propName }: { propName: Type } = $props()`
4. Import shared types from `$lib/shared/types/` if needed
5. No store imports in the component — receive data via props, emit actions via callbacks
6. Write tests in `src/lib/features/[feature]/components/MyComponent.test.ts`
7. Use the component from the feature's route `+page.svelte` or from a parent component in the same feature

### Adding a Store to an Existing Feature

1. Create `src/lib/features/[feature]/[feature]Store.svelte.ts`
2. Export a function that returns reactive state using `$state()` and `$derived()`
3. If it needs persistence, import from the feature's own service file
4. Write tests in `src/lib/features/[feature]/[feature]Store.test.ts`
5. Wire it up in the feature's route file

### Adding a Tauri Command

1. Add the Rust function in `src-tauri/src/commands/[domain].rs` with `#[tauri::command]`
2. Register it in `main.rs` via `tauri::generate_handler![]`
3. Add matching TypeScript types in `src/lib/shared/types/` (if shared) or `src/lib/features/[feature]/types.ts` (if feature-specific)
4. Create or update the service in `src/lib/features/[feature]/[feature].service.ts`
5. Write tests on both sides
6. Call the service from the feature's store

### Adding a New Feature

1. Create the feature folder: `src/lib/features/[newFeature]/`
2. Inside it, create:
   - `components/` directory
   - `[newFeature]Store.svelte.ts`
   - `[newFeature].service.ts` (if it needs Tauri commands)
   - `types.ts` (if it has feature-specific types)
3. Add a route: `src/routes/[newFeature]/+page.svelte`
4. Add the route to the `BottomNav` component in `shared/components/`
5. Write tests for store, service, and components
6. Update this AGENTS.md file to document the new feature

### Moving Code to Shared

Only move code to `shared/` when a **second feature** needs it. The process:

1. Confirm two or more features genuinely need the same code
2. Move the file from `features/[original]/` to `shared/[components|utils|types]/`
3. Update all imports in both features
4. Run the full test suite to verify nothing broke
5. Do NOT pre-emptively move code to shared "just in case"
