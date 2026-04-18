# Rep Counter — Project Status

> **This file is the single source of truth for project progress.**
> Claude Code: read this file when the user asks for "status", "where are we", "what's next", or "next".
> Update this file after completing each task by changing its status.

---

## Current Phase: Phase 5 — Polish

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
| 5.8 | Font scale QA at all levels | ⬜ | Test all screens at small, medium, large, extraLarge |
| 5.9 | Touch target size audit | ⬜ | Verify all targets meet minimums |
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

### Trigger

Workflow runs on `v*` tag push only. To release: `git tag v0.1.0 && git push origin v0.1.0`.

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Fix `tauri.conf.json` identifier | ✅ | Changed `com.tauri.dev` → `io.github.amecteau.repcounter`. |
| 6.2 | ~~Initialize Tauri Android target locally~~ | ✅ | Skipped — Android SDK not installed locally. CI job runs `npx tauri android init` before building instead. |
| 6.3 | Add Android Rust targets | ✅ | Created `rust-toolchain.toml` with stable channel + 4 Android targets. |
| 6.4 | Local Windows build test | ✅ | `Rep Counter_0.1.0_x64_en-US.msi` + `Rep Counter_0.1.0_x64-setup.exe` produced. Fixed adapter-auto → adapter-static (fallback: index.html) required for Tauri static output. |
| 6.5 | Create `.github/workflows/release.yml` | ✅ | Single workflow file with all three jobs. Triggers on `v*` tags. |
| 6.6 | Windows CI job | ✅ | `windows-latest`: checkout → Node → Rust stable → `npm ci` → `npx tauri build` → upload `.msi` + `.exe`. |
| 6.7 | Android CI job | ✅ | `ubuntu-latest`: checkout → Node → Java 17 → Android SDK → NDK 27.2 → Rust + 4 targets → `npm ci` → `npx tauri android init` → `npx tauri android build --apk` → upload `.apk`. |
| 6.8 | Release job | ✅ | Depends on both build jobs. Downloads all artifacts, uses `softprops/action-gh-release@v2` with `generate_release_notes: true`. |
| 6.9 | Version sync script | ✅ | `scripts/version-sync.mjs` wired to npm `version` hook. Syncs `tauri.conf.json` version and stages it in the same commit. |
| 6.10 | Test workflow end-to-end | ✅ | Push `v0.1.0` tag. Verify both artifacts appear on GitHub Releases page. |
| 6.11 | Add release badge to README | ✅ | Rewrote default SvelteKit README with project info, shields.io release badge, download table, and release instructions. |
| 6.12 | Android APK signing — Step 1: debug build | 🔄 | Change CI step to `npx tauri android build --apk --debug` to confirm APK installs on device (debug builds are auto-signed). Verifies signing is the root cause of "App not installed" on Samsung S25. |
| 6.13 | Android APK signing — Step 2: release keystore | ⬜ | Generate keystore locally: `keytool -genkey -v -keystore release.keystore -alias setforge -keyalg RSA -keysize 2048 -validity 10000`. Add 4 GitHub secrets: `ANDROID_KEYSTORE` (base64), `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `ANDROID_STORE_PASSWORD`. Decode keystore in CI before build step. Configure signing block in `src-tauri/gen/android/app/build.gradle`. Switch workflow back to release APK. |

**Phase 6 exit criteria**: Pushing a `v*` tag produces a GitHub Release with a Windows installer and Android APK attached, downloadable via a public link on the repo Releases page.

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
| 2026-04-10 | Added `/// <reference types="@testing-library/jest-dom" />` to test-setup.ts | jest-dom matchers not recognized by svelte-check without this type reference |
| 2026-04-10 | Added ESLint rules: no-undef off for TS files; prefer-svelte-reactivity off; no-navigation-without-resolve off | no-undef is redundant in TS; prefer-svelte-reactivity false-positives on new Date().toISOString(); nav rule not applicable without base path |
| 2026-04-10 | Added ESLint parser config for `*.svelte.ts` files (TypeScript parser) | Default ESLint config treats .svelte.ts as plain JS, failing on import type syntax |
| 2026-04-10 | Use `$app/state` not `$app/stores` for page; access as `page.url.pathname` not `$page` | `$app/stores` deprecated in SvelteKit Svelte 5 mode; state object is not a store |
