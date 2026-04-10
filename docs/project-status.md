# Rep Counter — Project Status

> **This file is the single source of truth for project progress.**
> Claude Code: read this file when the user asks for "status", "where are we", "what's next", or "next".
> Update this file after completing each task by changing its status.

---

## Current Phase: Phase 1 — Scaffold & Harness

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked (see notes)
- 🔁 Needs rework (see notes)

---

## Phase 1: Scaffold & Harness

> **Goal**: Set up the project skeleton, install dependencies, configure all tooling, and verify every sensor (linter, type-checker, test runner) passes clean. No features yet — this is pure harness.

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Scaffold Tauri v2 + SvelteKit project | ✅ | Used `npx sv create` + `npx tauri init` (sveltekit-ts template deprecated) |
| 1.2 | Install frontend dependencies | ✅ | tailwindcss, @tailwindcss/vite, vitest, @testing-library/svelte, @testing-library/user-event, @testing-library/jest-dom, jsdom |
| 1.3 | Configure TypeScript strict mode | ✅ | strict, noImplicitAny, noUnusedLocals, noUnusedParameters all set |
| 1.4 | Configure ESLint + Prettier + svelte-check | ✅ | eslint.config.js with svelte + ts + no-restricted-imports rule; prettier installed |
| 1.5 | Configure Tailwind CSS | ✅ | @tailwindcss/vite in vite.config.ts; app.css imported in +layout.svelte |
| 1.6 | Set up Vitest with svelteTesting plugin | ✅ | svelteTesting in plugins; jsdom env; test-setup.ts with jest-dom matchers |
| 1.7 | Create feature folder structure | ✅ | All features/, shared/, Rust module dirs created |
| 1.8 | Create shared type files | ✅ | exercise.ts, workout.ts, settings.ts, common.ts in shared/types/ |
| 1.9 | Create Rust module structure | ✅ | commands/, models/, repo/, db/ with mod.rs files wired into lib.rs |
| 1.10 | Create Rust model structs | ✅ | WorkoutSet, Workout, Exercise, UserSettings with serde camelCase |
| 1.11 | Add Rust test feature flag | ✅ | tauri = { features = ["test"] }, rusqlite (bundled), uuid added to Cargo.toml |
| 1.12 | Write first serialization test | ✅ | 7 TS type smoke tests + 3 Rust tests (2 serialization, 1 schema) all pass |
| 1.13 | Set up database schema | ✅ | initialize_db() in db/mod.rs creates 4 tables |
| 1.14 | Verify all sensors pass | ✅ | svelte-check ✅ eslint ✅ vitest 7/7 ✅ cargo test 3/3 ✅ clippy ✅ |
| 1.15 | Place .claude/AGENTS.md | ✅ | Pre-existing |
| 1.16 | Place .claude/settings.json | ✅ | Pre-existing with allowed commands |
| 1.17 | Place .claude/commands/ | ✅ | Pre-existing: bootstrap, done, next, review, status, test |
| 1.18 | Place docs/ui-spec.md | ✅ | Pre-existing |

**Phase 1 exit criteria**: Every sensor passes clean. `npm run dev` launches the app (blank screen is fine). `cargo test` passes with at least one serialization test. All harness files are in place.

---

## Phase 2: Core Counter

> **Goal**: Build the main counting interface. User can select an exercise, tap to count reps, enter weight, and save sets within a workout session.

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Create settingsStore | ⬜ | FontScale, weightUnit, lastExerciseId. Persists via settings.service.ts |
| 2.2 | Create FontScaleControl component | ⬜ | A−/A+ buttons in top bar. Applies root font size. |
| 2.3 | Create BottomNav component | ⬜ | Three tabs: Counter, History, Exercises. Icons + text labels. |
| 2.4 | Create app layout | ⬜ | +layout.svelte with top bar (font scale), BottomNav, content area |
| 2.5 | Create defaultExercises.ts | ⬜ | Built-in exercise list as a constant |
| 2.6 | Create exerciseStore | ⬜ | Exercise list state, search/filter logic |
| 2.7 | Create ExercisePicker component | ⬜ | Full-screen/bottom-sheet picker with search and muscle group sections |
| 2.8 | Create counterStore | ⬜ | Active workout state: current exercise, rep count, set list, weight |
| 2.9 | Create RepCounter component | ⬜ | Giant tap area, +/− buttons, rep count display with aria-live |
| 2.10 | Create WeightInput component | ⬜ | Weight field with −5/+5 steppers, unit toggle |
| 2.11 | Create SetList component | ⬜ | Previous sets display with swipe-to-reveal undo |
| 2.12 | Wire Counter page | ⬜ | +page.svelte composing all counter components |
| 2.13 | Implement "Start Workout" flow | ⬜ | No-workout state → active workout state |
| 2.14 | Implement "Save Set" flow | ⬜ | Validation, save to store, reset count, confirmation animation |
| 2.15 | Implement "Finish Workout" flow | ⬜ | Save workout, return to start state |
| 2.16 | Write interaction tests for RepCounter | ⬜ | Tap to increment, minus button, zero-floor, save validation |
| 2.17 | Write interaction tests for WeightInput | ⬜ | Steppers, unit toggle, numeric input |
| 2.18 | Write interaction tests for ExercisePicker | ⬜ | Search, select, cancel |
| 2.19 | Write store tests for counterStore | ⬜ | All mutations, edge cases |
| 2.20 | Write store tests for exerciseStore | ⬜ | Filter, search, add custom |
| 2.21 | Write font scale rendering tests | ⬜ | Verify no overflow at extraLarge |
| 2.22 | Verify all sensors pass | ⬜ | Full workflow checklist |

**Phase 2 exit criteria**: User can start a workout, select exercises, count reps by tapping, enter weight, save sets, and finish a workout. All interaction tests pass. Font scale works across all levels.

---

## Phase 3: Persistence

> **Goal**: Wire the frontend to the Rust backend so workout data survives app restarts.

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Implement Rust workout repo | ⬜ | save_workout, save_set, get_workouts, get_sets |
| 3.2 | Implement Rust exercise repo | ⬜ | save_custom_exercise, get_custom_exercises, delete_custom_exercise |
| 3.3 | Implement Rust settings repo | ⬜ | save_settings, get_settings |
| 3.4 | Implement Tauri commands | ⬜ | Thin wrappers calling repo functions |
| 3.5 | Write Rust repo tests | ⬜ | All CRUD operations with in-memory SQLite |
| 3.6 | Write Rust serialization tests | ⬜ | All models round-trip correctly |
| 3.7 | Create frontend service files | ⬜ | workout.service.ts, exercise.service.ts, settings.service.ts |
| 3.8 | Wire stores to services | ⬜ | counterStore → workout.service, exerciseStore → exercise.service |
| 3.9 | Implement workout resume | ⬜ | Detect incomplete workout on launch, prompt to resume |
| 3.10 | Implement settings persistence | ⬜ | Font scale, weight unit, last exercise saved/loaded |
| 3.11 | Write service tests with mocked invoke | ⬜ | All service functions |
| 3.12 | Manual integration test | ⬜ | Start workout → count reps → save sets → close app → reopen → verify data |
| 3.13 | Verify all sensors pass | ⬜ | Full workflow checklist (frontend + backend) |

**Phase 3 exit criteria**: All workout data persists across app restarts. Settings persist. Workout resume works. All Rust tests pass.

---

## Phase 4: History & Exercises Screens

> **Goal**: Build the remaining two screens so users can browse past workouts and manage their exercise library.

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | Create historyStore | ⬜ | Load past workouts, expand/collapse state |
| 4.2 | Create WorkoutCard component | ⬜ | Summary view with exercise list |
| 4.3 | Create WorkoutDetail component | ⬜ | Expanded set-by-set view |
| 4.4 | Wire History page | ⬜ | +page.svelte composing history components |
| 4.5 | Implement workout deletion | ⬜ | Swipe-to-reveal delete with confirmation dialog |
| 4.6 | Create ExerciseList component | ⬜ | Grouped by muscle, search bar, custom section |
| 4.7 | Create AddExerciseForm component | ⬜ | Inline form: name + muscle group |
| 4.8 | Wire Exercises page | ⬜ | +page.svelte composing exercise management components |
| 4.9 | Implement custom exercise CRUD | ⬜ | Add, delete custom exercises (built-ins read-only) |
| 4.10 | Implement "tap exercise to select" | ⬜ | Navigate to counter with exercise pre-selected |
| 4.11 | Create ConfirmDialog shared component | ⬜ | Reusable confirmation modal, move to shared/ |
| 4.12 | Create SwipeToReveal shared component | ⬜ | Reusable swipe gesture wrapper, move to shared/ |
| 4.13 | Write interaction tests for all new components | ⬜ | |
| 4.14 | Write store tests for historyStore | ⬜ | |
| 4.15 | Implement empty states | ⬜ | No workouts message, no custom exercises message |
| 4.16 | Verify all sensors pass | ⬜ | Full workflow checklist |

**Phase 4 exit criteria**: All three screens fully functional. Exercise management works. History shows past workouts with expand/collapse. Delete flows work with confirmation.

---

## Phase 5: Polish

> **Goal**: Refine the experience with animations, keyboard shortcuts, and visual polish.

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | Add rep count animation | ⬜ | Scale pulse on increment |
| 5.2 | Add set save confirmation animation | ⬜ | Brief green flash or checkmark |
| 5.3 | Add reduced-motion support | ⬜ | Respect prefers-reduced-motion |
| 5.4 | Add keyboard shortcuts | ⬜ | Space/Enter to count, Backspace to decrement, Ctrl+S to save |
| 5.5 | Add transition animations between screens | ⬜ | Subtle slide or fade |
| 5.6 | Visual polish pass | ⬜ | Spacing, contrast, font choices, color consistency |
| 5.7 | Accessibility audit | ⬜ | Screen reader test, contrast check, focus indicators |
| 5.8 | Font scale QA at all levels | ⬜ | Test all screens at small, medium, large, extraLarge |
| 5.9 | Touch target size audit | ⬜ | Verify all targets meet minimums |
| 5.10 | Final sensor pass | ⬜ | All checks green, all tests passing |

**Phase 5 exit criteria**: App feels polished. Animations are smooth and purposeful. Accessibility passes. All font scales work on all screens.

---

## Completed Milestones

| Milestone | Date | Notes |
|---|---|---|
| Harness plan created | 2026-04-08 | AGENTS.md, ui-spec.md, project-status.md |
| Phase 1 scaffold complete | 2026-04-10 | All sensors green: svelte-check, eslint, vitest 7/7, cargo test 3/3, clippy clean |

---

## Known Issues & Decisions

> Track any issues, blockers, or decisions made during development here.

| Issue | Status | Decision/Resolution |
|---|---|---|
| (none yet) | | |

---

## Steering Log

> When you update the harness (AGENTS.md, ui-spec.md, eslint rules, etc.) based on observed agent behaviour, log it here so you can track how the harness evolves.

| Date | What changed | Why |
|---|---|---|
| 2026-04-09 | Used `npx sv create` instead of `npm create tauri-app` with sveltekit-ts | sveltekit-ts template removed from create-tauri-app; sv create is now canonical SvelteKit scaffolder |
| 2026-04-09 | vitest config uses `vitest/config` defineConfig, not `vite` | vite's defineConfig doesn't include the `test` key in its type; must use vitest's export |
| 2026-04-09 | test-setup.ts uses `expect.extend(matchers)` pattern, not bare `import '@testing-library/jest-dom'` | jest-dom bare import calls `expect` before vitest defines it globally; extend pattern avoids the timing issue |
