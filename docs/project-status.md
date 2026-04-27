# SetForge — Project Status

> **This file is the single source of truth for project progress.**
> Claude Code: read this file when the user asks for "status", "where are we", "what's next", or "next".
> Update this file after completing each task by changing its status.

---

## Current Phase: Phase 8 — Bug Fixes & Error Handling

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
| 2.1 | Create settingsStore | ✅ | Factory pattern; setFontScale applies to document root; increase/decrease helpers |
| 2.2 | Create FontScaleControl component | ✅ | A−/A+ buttons; disabled at min/max scale |
| 2.3 | Create BottomNav component | ✅ | Three tabs with aria-current; text + symbol labels |
| 2.4 | Create app layout | ✅ | +layout.svelte: top bar, main scroll area, BottomNav |
| 2.5 | Create defaultExercises.ts | ✅ | 27 built-in exercises across 8 muscle groups |
| 2.6 | Create exerciseStore | ✅ | Factory pattern; search/filter, addCustom, removeCustom |
| 2.7 | Create ExercisePicker component | ✅ | Full-screen dialog, search input, grouped by muscle |
| 2.8 | Create counterStore | ✅ | Factory pattern; full workout lifecycle |
| 2.9 | Create RepCounter component | ✅ | Giant tap area, +/− buttons, aria-live status region |
| 2.10 | Create WeightInput component | ✅ | −N/+N steppers (5lb / 2.5kg), unit toggle |
| 2.11 | Create SetList component | ✅ | Sets list with per-row Undo button |
| 2.12 | Wire Counter page | ✅ | +page.svelte composing all counter components |
| 2.13 | Implement "Start Workout" flow | ✅ | No-workout state → active; Start Workout button |
| 2.14 | Implement "Save Set" flow | ✅ | Validation (0 reps), inline error, rep count resets |
| 2.15 | Implement "Finish Workout" flow | ✅ | Discard dialog when no sets; clears store on finish |
| 2.16 | Write interaction tests for RepCounter | ✅ | Tap area, + button, − button, aria-live region |
| 2.17 | Write interaction tests for WeightInput | ✅ | Steppers, unit toggle, null weight |
| 2.18 | Write interaction tests for ExercisePicker | ✅ | Search, select, cancel, grouping |
| 2.19 | Write store tests for counterStore | ✅ | All mutations, edge cases, 16 tests |
| 2.20 | Write store tests for exerciseStore | ✅ | Filter, search, addCustom, removeCustom, 11 tests |
| 2.21 | Write font scale rendering tests | ✅ | All 4 scale levels apply correct px to document root |
| 2.22 | Verify all sensors pass | ✅ | svelte-check ✅ eslint ✅ vitest 83/83 ✅ |

**Phase 2 exit criteria**: User can start a workout, select exercises, count reps by tapping, enter weight, save sets, and finish a workout. All interaction tests pass. Font scale works across all levels.

---

## Phase 3: Persistence

> **Goal**: Wire the frontend to the Rust backend so workout data survives app restarts.

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Implement Rust workout repo | ✅ | save_workout, finish_workout, save_set, get_workouts, get_incomplete_workout, delete_workout |
| 3.2 | Implement Rust exercise repo | ✅ | save_custom_exercise, get_custom_exercises, delete_custom_exercise |
| 3.3 | Implement Rust settings repo | ✅ | save_settings, get_settings; key-value upsert |
| 3.4 | Implement Tauri commands | ✅ | Thin wrappers in commands/; DbConn state in lib.rs; DB opens at app data dir |
| 3.5 | Write Rust repo tests | ✅ | 15 repo tests (7 workout, 4 exercise, 4 settings) + 3 existing = 18 total |
| 3.6 | Write Rust serialization tests | ✅ | Covered by existing workout model tests from Phase 1 |
| 3.7 | Create frontend service files | ✅ | counter.service.ts, exercise.service.ts, settings.service.ts |
| 3.8 | Wire stores to services | ✅ | All stores call services; async startWorkout/saveSet/finish/discard |
| 3.9 | Implement workout resume | ✅ | getIncompleteWorkout on mount; Resume / Start Fresh dialog |
| 3.10 | Implement settings persistence | ✅ | load() on startup, persist() on change via $effect in layout |
| 3.11 | Write service tests with mocked invoke | ✅ | 14 service tests across 3 service files |
| 3.12 | Manual integration test | ✅ | Run tauri dev and verify end-to-end |
| 3.13 | Verify all sensors pass | ✅ | svelte-check ✅ eslint ✅ vitest 97/97 ✅ cargo test 18/18 ✅ clippy ✅ |

**Phase 3 exit criteria**: All workout data persists across app restarts. Settings persist. Workout resume works. All Rust tests pass.

---

## Phase 4: History & Exercises Screens

> **Goal**: Build the remaining two screens so users can browse past workouts and manage their exercise library.

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | Create historyStore | ✅ | Load past workouts, expand/collapse state |
| 4.2 | Create WorkoutCard component | ✅ | Summary view with exercise list |
| 4.3 | Create WorkoutDetail component | ✅ | Expanded set-by-set view |
| 4.4 | Wire History page | ✅ | +page.svelte composing history components |
| 4.5 | Implement workout deletion | ✅ | SwipeToReveal + ConfirmDialog |
| 4.6 | Create ExerciseList component | ✅ | Grouped by muscle, search, custom section |
| 4.7 | Create AddExerciseForm component | ✅ | Inline form: name + muscle group |
| 4.8 | Wire Exercises page | ✅ | +page.svelte with search, list, add form |
| 4.9 | Implement custom exercise CRUD | ✅ | Add, delete custom exercises (built-ins read-only) |
| 4.10 | Implement "tap exercise to select" | ✅ | Sets exercise on counterStore and goto('/') |
| 4.11 | Create ConfirmDialog shared component | ✅ | Reusable confirmation modal in shared/ |
| 4.12 | Create SwipeToReveal shared component | ✅ | Pointer-event swipe wrapper in shared/ |
| 4.13 | Write interaction tests for all new components | ✅ | WorkoutCard, WorkoutDetail, ExerciseList, AddExerciseForm, ConfirmDialog, SwipeToReveal |
| 4.14 | Write store tests for historyStore | ✅ | 8 tests covering load, toggle, delete |
| 4.15 | Implement empty states | ✅ | No workouts message on History; no-custom-section hidden |
| 4.16 | Verify all sensors pass | ✅ | svelte-check ✅ eslint ✅ vitest 151/151 ✅ cargo test 18/18 ✅ clippy ✅ |

**Phase 4 exit criteria**: All three screens fully functional. Exercise management works. History shows past workouts with expand/collapse. Delete flows work with confirmation.

---

## Phase 5: Polish

> **Goal**: Refine the experience with animations, keyboard shortcuts, and visual polish.

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | Add rep count animation | ✅ | Scale pulse on increment via `requestAnimationFrame` + CSS keyframe; RepCounter uses `handleIncrement` wrapper |
| 5.2 | Add set save confirmation animation | ✅ | Save Set button flashes green for 500ms on success |
| 5.3 | Add reduced-motion support | ✅ | `@media (prefers-reduced-motion: reduce)` disables `.rep-pulse`; fade transition uses 0ms duration |
| 5.4 | Add keyboard shortcuts | ✅ | Space/Enter=increment, Backspace=decrement, Ctrl+S/Meta+S=save; extracted to `keyboardShortcuts.ts` with 10 tests |
| 5.5 | Add transition animations between screens | ✅ | `{#key page.url.pathname}` + `in:fade` in layout; 120ms duration |
| 5.6 | Visual polish pass | ✅ | `focus-visible:ring` added to all interactive elements; active states on dialogs |
| 5.7 | Accessibility audit | ✅ | Focus rings on BottomNav, WeightInput, RepCounter, ConfirmDialog, all page buttons |
| 5.8 | Font scale QA at all levels | ✅ | Test all screens at small, medium, large, extraLarge |
| 5.9 | Touch target size audit | ✅ | Verify all targets meet minimums |
| 5.10 | Final sensor pass | ✅ | svelte-check ✅ eslint ✅ vitest 162/162 ✅ cargo test 18/18 ✅ clippy ✅ |

**Phase 5 exit criteria**: App feels polished. Animations are smooth and purposeful. Accessibility passes. All font scales work on all screens.

---

## Phase 6: Release & Distribution

> **Goal**: Build and package the app for Windows and Android using GitHub Actions (free tier). A git tag push triggers the workflow, produces installers/APK, and publishes them as a GitHub Release accessible from the repo.

### Platform targets

| Platform | Runner | Output |
|---|---|---|
| Windows | `windows-latest` | `.msi` + `.exe` NSIS installer |
| Android | `ubuntu-latest` | `.apk` |

### GitHub Actions used (all free/MIT)

| Action | Purpose |
|---|---|
| `actions/checkout@v4` | Checkout repo |
| `actions/setup-node@v4` | Node.js |
| `dtolnay/rust-toolchain@stable` | Rust + Android cross-compile targets |
| `actions/setup-java@v4` | JDK 17 (required by Android build tools) |
| `android-actions/setup-android@v3` | Android SDK + NDK |
| `actions/upload-artifact@v4` | Pass build outputs between jobs |
| `softprops/action-gh-release@v2` | Create GitHub Release + attach files |

### Workflows

| Workflow | Trigger | Jobs |
|---|---|---|
| `ci.yml` | Push to any branch (not tags) | `test` only |
| `release.yml` | `v*` tag push | `test` → `build-windows` + `build-android` → `release` |

`ci.yml` uses `branches: ['**']` so tag pushes don't trigger it — no double test run. `release.yml` always re-runs its own `test` job so a direct tag push can't bypass tests.

To release: `git tag v0.1.0 && git push origin v0.1.0`.

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Fix `tauri.conf.json` identifier | ✅ | Changed `com.tauri.dev` → `io.github.amecteau.repcounter`. |
| 6.2 | ~~Initialize Tauri Android target locally~~ | ✅ | Skipped — Android SDK not installed locally. CI job runs `npx tauri android init` before building instead. |
| 6.3 | Add Android Rust targets | ✅ | Created `rust-toolchain.toml` with stable channel + 4 Android targets. |
| 6.4 | Local Windows build test | ✅ | `SetForge_0.1.0_x64_en-US.msi` + `SetForge_0.1.0_x64-setup.exe` produced. Fixed adapter-auto → adapter-static (fallback: index.html) required for Tauri static output. |
| 6.5 | Create `.github/workflows/release.yml` | ✅ | Single workflow file with all three jobs. Triggers on `v*` tags. |
| 6.6 | Windows CI job | ✅ | `windows-latest`: checkout → Node → Rust stable → `npm ci` → `npx tauri build` → upload `.msi` + `.exe`. |
| 6.7 | Android CI job | ✅ | `ubuntu-latest`: checkout → Node → Java 17 → Android SDK → NDK 27.2 → Rust + 4 targets → `npm ci` → `npx tauri android init` → `npx tauri android build --apk` → upload `.apk`. |
| 6.8 | Release job | ✅ | Depends on both build jobs. Downloads all artifacts, uses `softprops/action-gh-release@v2` with `generate_release_notes: true`. |
| 6.9 | Version sync script | ✅ | `scripts/version-sync.mjs` wired to npm `version` hook. Syncs `tauri.conf.json` version and stages it in the same commit. |
| 6.10 | Test workflow end-to-end | ✅ | Push `v0.1.0` tag. Verify both artifacts appear on GitHub Releases page. |
| 6.11 | Add release badge to README | ✅ | Rewrote default SvelteKit README with project info, shields.io release badge, download table, and release instructions. |
| 6.12 | Android APK signing — Step 1: debug build | ✅ | Change CI step to `npx tauri android build --apk --debug` to confirm APK installs on device (debug builds are auto-signed). Verifies signing is the root cause of "App not installed" on Samsung S25. |
| 6.13 | Android APK signing — Step 2: release keystore | ✅ | Generated keystore locally; added 4 GitHub secrets (`ANDROID_KEYSTORE`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `ANDROID_STORE_PASSWORD`). CI now builds an unsigned release APK and signs it via `apksigner` with passwords read from env vars (`--ks-pass env:`, `--key-pass env:`) — secrets never written to disk. Debug APK and signed release APK both attached to release. |
| 6.14 | Add unit test gate to `release.yml` | ✅ | New `test` job (ubuntu-latest) runs `npx vitest run` + `cargo test`. Both build jobs use `needs: [test]` so failed tests abort before any Tauri compilation. |
| 6.15 | Create `ci.yml` for branch push tests | ✅ | Separate workflow triggers on `branches: ['**']` (not tags) to avoid double test run on tag push. Runs same test suite as `release.yml` test job. |

**Phase 6 exit criteria**: Pushing a `v*` tag produces a GitHub Release with a Windows installer and Android APK attached, downloadable via a public link on the repo Releases page.

---

## Phase 7: Data Safety

> **Goal**: Ensure user data survives app upgrades indefinitely. Introduce a versioned migration system so future schema changes are applied automatically and safely when the app starts.

### Design

The migration system lives entirely in `src-tauri/src/db/mod.rs`. No new dependencies are required.

**`schema_version` table** — a single-row table tracking which migrations have been applied:
```sql
CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL DEFAULT 0);
```

**`MIGRATIONS` constant** — a static, append-only list of `(version, sql)` pairs. Each entry is a complete SQL statement that advances the schema by one version. Never edit an existing entry; only append new ones.

```rust
const MIGRATIONS: &[(u32, &str)] = &[
    (1, "CREATE TABLE IF NOT EXISTS workouts (...)"),
    (1, "CREATE TABLE IF NOT EXISTS sets (...)"),
    // future: (2, "ALTER TABLE sets ADD COLUMN ...")
];
```

**`migrate_db(&conn)`** — replaces `initialize_db()` in the Tauri startup hook:
1. Creates `schema_version` if it does not exist (handles fresh installs and existing v0 installs alike).
2. Reads the current version (0 if the table is empty).
3. Collects all migrations with version > current version, in order.
4. Runs each migration in its own transaction. On failure, the transaction rolls back and an error is returned — the app does not start with a half-migrated DB.
5. After each successful migration, updates `schema_version` to the new version.

**Existing installs** — the 4 current tables already exist. Migration 1 uses `CREATE TABLE IF NOT EXISTS`, so running it on an existing DB is a no-op. All user data is preserved.

**Adding future schema changes** — append a new entry to `MIGRATIONS` with the next version number (e.g., version 2). On the user's next app launch, only the new migration runs.

### Files changed

| File | Change |
|---|---|
| `src-tauri/src/db/mod.rs` | Replace `initialize_db()` with `migrate_db()` + supporting private functions |
| `src-tauri/src/lib.rs` | Call `migrate_db()` instead of `initialize_db()` in the Tauri setup hook |

### Tests added (in `db/mod.rs` `#[cfg(test)]` block)

| Test | What it verifies |
|---|---|
| `fresh_install_creates_all_tables` | Running migrations on an empty DB creates all 4 tables |
| `existing_install_skips_applied_migrations` | Set version to 1, add migration 2, verify only migration 2 runs |
| `version_increments_after_each_migration` | After 2 migrations, `schema_version` reads 2 |
| `failed_migration_rolls_back_and_returns_error` | Bad SQL in migration 2 leaves version at 1 and returns `Err` |
| `migrate_is_idempotent` | Running `migrate_db()` twice on the same DB is safe |

### Tasks

| # | Task | Status | Notes |
|---|---|---|---|
| 7.1 | Implement `migrate_db()` in `db/mod.rs` | ✅ | Replace `initialize_db()`. Migration 1 = current 4-table schema. |
| 7.2 | Update `lib.rs` startup hook | ✅ | Call `migrate_db()` instead of `initialize_db()`. Map error to a meaningful panic message so the user sees something useful if the DB is corrupt. |
| 7.3 | Write Rust migration tests | ✅ | 5 tests in `db::tests`. Updated repo test helpers to use `migrate_db`. 22/22 cargo tests pass. |
| 7.4 | Update `AGENTS.md` schema rules | ✅ | Replace "No migrations system for v1" note with the new append-only migration convention. |
| 7.5 | Run full sensor pass | ✅ | svelte-check ✅ eslint ✅ vitest 165/165 ✅ cargo check ✅ cargo test 22/22 ✅ |

**Phase 7 exit criteria**: App startup runs `migrate_db()`. All 5 migration tests pass. Existing DB files (with user data) are left untouched. `AGENTS.md` documents the convention for future schema changes.

---

## Phase 8: Bug Fixes & Error Handling

> **Goal**: Fix two confirmed bugs (undo doesn't persist, custom exercise deletion causes GUID display) and introduce a consistent error-handling surface across all destructive actions.

### Background

- **GUID bug**: `SetList` falls back to raw `exercise_id` UUID when an exercise isn't found. Root cause: user deleted a custom exercise mid-workout via the Exercises tab. No guard prevents this.
- **Undo bug**: `undoLastSet()` only slices the local array. The set is already written to SQLite, so it returns on resume. `delete_set` does not exist anywhere in the stack.
- **Error surface gaps**: history delete, exercise delete, and undo are all fire-and-forget with no user feedback on failure.

---

### Phase 8A — Guard: prevent deleting a referenced exercise

| # | Task | Status | Notes |
|---|---|---|---|
| 8A.1 | Add `exercise_has_sets(conn, id) -> Result<bool>` to `exercise_repo.rs` | ✅ | `SELECT COUNT(*) FROM sets WHERE exercise_id = ?1` |
| 8A.2 | Enforce guard in `delete_custom_exercise` command — return descriptive `Err(String)` if in use | ✅ | Check runs in command (≤10 lines); repo helper does the query |
| 8A.3 | `exerciseStore.removeCustom` returns `StoreResult`; only mutates local state on success | ✅ | `StoreResult` moved to `shared/types/common.ts`; counterStore re-exports it |
| 8A.4 | `ExerciseList` `onDeleteCustom` prop becomes `async`; exercises page surfaces error with inline alert | ✅ | Same pattern as `saveError` on counter page (red `role="alert"`, 3s auto-dismiss). `ConfirmDialog.onConfirm` is now `() => void \| Promise<void>`; `pendingDeleteId` cleared only after await so exercise name stays visible on failure. |
| 8A.5 | Rust tests: `exercise_has_sets` true/false; guard blocks delete when sets exist | ✅ | 3 new repo tests; 25/25 cargo tests pass |
| 8A.6 | TS tests: `removeCustom` does not mutate store when service throws | ✅ | 180/180 vitest pass |

---

### Phase 8B — Fix undo: persist deletion to DB

| # | Task | Status | Notes |
|---|---|---|---|
| 8B.1 | Add `delete_set(conn, id) -> Result<()>` to `workout_repo.rs` | ✅ | `DELETE FROM sets WHERE id = ?1` |
| 8B.2 | Add `delete_set` Tauri command to `commands/workout.rs`; register in `lib.rs` | ✅ | Thin wrapper per convention |
| 8B.3 | Add `deleteSet(id: string): Promise<void>` to `counter.service.ts` | ✅ | |
| 8B.4 | Replace `undoLastSet()` with `async removeSet(setId: string): Promise<StoreResult>` in `counterStore` | ✅ | Calls service first; only removes from local array on success |
| 8B.5 | `SetList` `onUndo` callback changes from `(index: number)` to `(setId: string)`; pass `set.id` | ✅ | `flatIndex` removed entirely from grouped map; items are now plain `WorkoutSet[]` |
| 8B.6 | `+page.svelte` wires async `onUndo`; surfaces failure via existing `saveError` alert | ✅ | |
| 8B.7 | Rust tests: `delete_set` removes row; unknown id returns `Ok(())` | ✅ | |
| 8B.8 | TS store tests: `removeSet` calls service with correct id; does not mutate store on failure | ✅ | Also added `deleteSet` service test |

---

### Phase 8C — Error surface consistency

| # | Task | Status | Notes |
|---|---|---|---|
| 8C.1 | `historyStore.deleteWorkout` returns `StoreResult`; `WorkoutCard` / history page shows inline error on failure | ✅ | `deleteError` state with 3s auto-dismiss; `WorkoutCard.onDelete` accepts `() => void \| Promise<void>` |
| 8C.2 | `SetList.getExerciseName` fallback: `?? 'Unknown Exercise'` instead of `?? exerciseId` | ✅ | Defensive display for any existing DB rows that reference deleted exercises |
| 8C.3 | `SetList` test: renders "Unknown Exercise" when exercise ID has no match in prop | ✅ | |

**Phase 8 exit criteria**: Deleting a custom exercise that has workout history is blocked with a clear error message. Undo removes the set from SQLite. All destructive actions (undo, exercise delete, workout delete) surface errors to the user. All sensors pass.

---

## Completed Milestones

| Milestone | Date | Notes |
|---|---|---|
| Harness plan created | 2026-04-08 | AGENTS.md, ui-spec.md, project-status.md |
| Phase 1 scaffold complete | 2026-04-10 | All sensors green: svelte-check, eslint, vitest 7/7, cargo test 3/3, clippy clean |
| Phase 2 core counter complete | 2026-04-10 | All stores, components, flows, and tests. 83/83 tests pass. All sensors green. |
| Phase 3 persistence complete | 2026-04-14 | All Tauri commands wired, service layer, workout resume, settings persist. 97/97 tests, 18/18 cargo. |
| Phase 4 history & exercises complete | 2026-04-14 | History and Exercises screens fully functional. ConfirmDialog, SwipeToReveal shared. 151/151 tests, all sensors green. |
| Phase 5 polish in progress | 2026-04-14 | Animations, keyboard shortcuts, reduced-motion, page transitions, focus rings. 162/162 tests. Tasks 5.8–5.9 are manual QA. |

---

## Features

> Major features tracked in their own status file under [docs/features/](features/). The phase tables above are for the core build only; once the app is shipping, additive feature work lives in per-feature files so this document stays a chronological project history rather than an ever-growing TODO list.
>
> A feature gets its own status file when:
> - It introduces a new feature folder (`src/lib/features/[name]/`), OR
> - It spans multiple components AND requires a documented architecture (entries in [AGENTS.md](../.claude/AGENTS.md)) AND a UI mockup (entry in [ui-spec.md](ui-spec.md)).
>
> Smaller enhancements stay in the **Future Features** table below.

| Feature | Status file | Current state |
|---|---|---|
| Multi-language support (English + Spanish) | [features/multilanguage-status.md](features/multilanguage-status.md) | Phase ML.1 — not started |

---

## Future Features

> Ideas and deferred enhancements to revisit after core phases are complete. Not committed to the UI spec.

| # | Feature | Notes |
|---|---|---|
| F.1 | Prevent duplicate exercise names across default + custom | Currently `custom_exercises` DB enforces `UNIQUE COLLATE NOCASE` only within custom exercises. A user can add "Bench Press" as a custom exercise and it coexists with the default. Fix: validate the new name against `DEFAULT_EXERCISES` before saving in the service/store layer. |

---

## Known Issues & Decisions

> Track any issues, blockers, or decisions made during development here.

| Issue | Status | Decision/Resolution |
|---|---|---|
| GUID shown as exercise header in SetList | ✅ Phase 8C.2 | `getExerciseName` now falls back to "Unknown Exercise" instead of raw UUID. Guard deletion handled in 8A. |
| Undo doesn't persist — sets return on resume | ✅ Phase 8B | Fixed: `removeSet(setId)` deletes from SQLite before removing from local state. |
| Custom exercise can be deleted while referenced in active/historical sets | ✅ Phase 8A | `exercise_has_sets` guard blocks delete; error surfaced to UI; exercise name stays visible until result confirmed. |

---

## Steering Log

> When you update the harness (AGENTS.md, ui-spec.md, eslint rules, etc.) based on observed agent behaviour, log it here so you can track how the harness evolves.

| Date | What changed | Why |
|---|---|---|
| 2026-04-09 | Used `npx sv create` instead of `npm create tauri-app` with sveltekit-ts | sveltekit-ts template removed from create-tauri-app; sv create is now canonical SvelteKit scaffolder |
| 2026-04-09 | vitest config uses `vitest/config` defineConfig, not `vite` | vite's defineConfig doesn't include the `test` key in its type; must use vitest's export |
| 2026-04-09 | test-setup.ts uses `expect.extend(matchers)` pattern, not bare `import '@testing-library/jest-dom'` | jest-dom bare import calls `expect` before vitest defines it globally; extend pattern avoids the timing issue |
| 2026-04-10 | Added `/// <reference types="@testing-library/jest-dom" />` to test-setup.ts | jest-dom matchers not recognized by svelte-check without this type reference |
| 2026-04-10 | Added ESLint rules: no-undef off for TS files; prefer-svelte-reactivity off; no-navigation-without-resolve off | no-undef is redundant in TS; prefer-svelte-reactivity false-positives on new Date().toISOString(); nav rule not applicable without base path |
| 2026-04-10 | Added ESLint parser config for `*.svelte.ts` files (TypeScript parser) | Default ESLint config treats .svelte.ts as plain JS, failing on import type syntax |
| 2026-04-10 | Use `$app/state` not `$app/stores` for page; access as `page.url.pathname` not `$page` | `$app/stores` deprecated in SvelteKit Svelte 5 mode; state object is not a store |
| 2026-04-27 | Introduced `docs/features/[name]-status.md` per-feature status files; added "Features" section to project-status.md as the index | Phase tables in project-status.md are scoped to the core build. Major features (new feature folders or spanning multiple components with a documented architecture) get their own file so feature work doesn't bloat this document. |
