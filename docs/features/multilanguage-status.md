# Feature: Multi-Language Support — Status

> **Per-feature status file.** Tracks the multi-language (English + Spanish) feature in detail.
> The top-level [docs/project-status.md](../project-status.md) lists this feature in its "Features" section and points here.
> Update this file after completing each task. Do not batch updates.

---

## Goal

Support English and Spanish in the UI. Add a Settings screen reachable via a gear icon in the top bar. Users can pick a specific language or "Match system" — the latter re-resolves the OS locale at every launch.

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked (see notes)
- 🔁 Needs rework (see notes)

## Current State

**Current phase**: ML.1 — Data model foundations (not started)

---

## Reference Documents

- UI mockup: [docs/ui-spec.md § Screen 4: Settings](../ui-spec.md)
- Architecture: [.claude/AGENTS.md § Internationalization (i18n)](../../.claude/AGENTS.md)
- Plan source: chat history (2026-04-27)

---

## Phase ML.1: Data model foundations

> **Goal**: Extend the persisted settings schema (TypeScript and Rust) to carry the language preference. No UI yet.

| # | Task | Status | Notes |
|---|---|---|---|
| ML.1.1 | Extend `src/lib/shared/types/settings.ts` with `Language`, `LanguagePreference`, and add `language: LanguagePreference` to `UserSettings` | ⬜ | Default `'system'`. Update any factory/test fixture that constructs `UserSettings`. |
| ML.1.2 | Add `pub language: String` to `src-tauri/src/models/settings.rs` `UserSettings` struct | ⬜ | `#[serde(rename_all = "camelCase")]` already applied at the struct level. |
| ML.1.3 | Update `src-tauri/src/repo/settings_repo.rs` to read/write the `language` key (default `"system"`) | ⬜ | No DB migration — `settings` is already key/value. Add `language` round-trip test. |
| ML.1.4 | Run Rust checklist: `cargo check && cargo test --lib && cargo clippy` | ⬜ | All must pass before proceeding. |

**Phase ML.1 exit criteria**: `UserSettings` round-trips a `language` value through the Rust repo. All Rust tests pass.

---

## Phase ML.2: i18n feature scaffold

> **Goal**: Build the new `src/lib/features/i18n/` feature folder — dictionaries, system detection, and the translation store.

| # | Task | Status | Notes |
|---|---|---|---|
| ML.2.1 | Create folder `src/lib/features/i18n/` with `locales/`, `types.ts`, `detectLanguage.ts`, `i18nStore.svelte.ts` | ⬜ | Per AGENTS.md feature-folder rules — no barrel files. |
| ML.2.2 | Build `locales/en.ts` — flat dictionary, source of truth | ⬜ | Keys: `nav.*`, `muscleGroup.*` (all 11), `exercise.*` (all built-in IDs), `settings.*`, `counter.*`, `history.*`, `exercises.*`, `confirm.*`, `validation.*`, `units.*`. |
| ML.2.3 | Build `locales/es.ts` typed `Record<TranslationKey, string>` | ⬜ | TypeScript will fail if any key is missing. Translate every key. |
| ML.2.4 | Build `detectLanguage.ts` + tests | ⬜ | Reads `navigator.language`. Returns `'es'` for prefix `es`, else `'en'`. Test cases: `en-US`, `es-MX`, `es`, `fr`, `undefined`. |
| ML.2.5 | Build `i18nStore.svelte.ts` + tests | ⬜ | `$state` preference, `$derived` active language and dict, `t()` lookup with key fallback. Tests: default state, `setPreference('es')` flips active, Spanish strings returned, `system` resolves to detected, fallback to key for unknown lookups. |

**Phase ML.2 exit criteria**: `i18nStore.t('nav.counter')` returns "Counter" when active is `en`, "Contador" when `es`. All i18n unit tests pass.

---

## Phase ML.3: Wire i18n into the app shell

> **Goal**: Connect the new store to the existing settings store and the layout, so the resolved language flows through the whole app.

| # | Task | Status | Notes |
|---|---|---|---|
| ML.3.1 | Extend `settingsStore.svelte.ts` with `language` state, getter, setter, load/persist | ⬜ | Update `settingsStore.test.ts` with language round-trip. |
| ML.3.2 | In `+layout.svelte`, sync `i18nStore.setPreference(settingsStore.language)` after `settingsStore.load()` | ⬜ | Add `$effect` so setting changes flow back into i18n. |
| ML.3.3 | Set `document.documentElement.lang = i18nStore.language` via `$effect` | ⬜ | Accessibility — screen readers honor the lang attribute. |

**Phase ML.3 exit criteria**: Changing the persisted `language` value updates `i18nStore.language` reactively. `<html lang>` reflects the active language.

---

## Phase ML.4: Settings screen

> **Goal**: Build the gear-icon entry point and the Settings route hosting `LanguageControl`.

| # | Task | Status | Notes |
|---|---|---|---|
| ML.4.1 | Add gear icon `<a href="/settings">` to header in `+layout.svelte` | ⬜ | Next to `FontScaleControl`. `aria-label="Settings"`, ≥`3rem` touch target. |
| ML.4.2 | Create `src/routes/settings/+page.svelte` | ⬜ | Back link, title, sections. Composes the settings feature. |
| ML.4.3 | Build `LanguageControl.svelte` | ⬜ | Radio group: Match system / English / Español. Show resolved language in parens for "Match system". Receives `preference`, `resolvedLanguage`, `onChange` via props. No store imports. |
| ML.4.4 | Write `LanguageControl.test.ts` | ⬜ | Rendering test (three options, current selection visible) + interaction test (clicking each fires `onChange` with right value). |
| ML.4.5 | Compose `LanguageControl` in `/settings/+page.svelte` | ⬜ | Wire props from `i18nStore` and `settingsStore`. |

**Phase ML.4 exit criteria**: Gear icon navigates to `/settings`. Selecting a language persists and immediately re-renders the UI in that language.

---

## Phase ML.5: Translate existing UI

> **Goal**: Replace every hardcoded user-visible string in the app with a `t()` lookup, passing translated values down via props (per AGENTS.md component contract).

| # | Task | Status | Notes |
|---|---|---|---|
| ML.5.1 | `BottomNav.svelte` — accept `labels` prop instead of hardcoding tab names | ⬜ | Layout passes `t('nav.*')`. |
| ML.5.2 | Exercises feature: `ExerciseList`, `ExercisePicker`, `AddExerciseForm` | ⬜ | Replace `MUSCLE_GROUP_LABELS` constant with `labels` prop. Built-in exercises: `t(\`exercise.\${id}\`)`. Custom: `exercise.name` as-is. |
| ML.5.3 | Counter feature: `RepCounter`, `WeightInput`, `SetList` | ⬜ | Pass labels for "Tap to count", "Save Set", "Set N", weight unit labels, validation messages. |
| ML.5.4 | History feature: `WorkoutCard`, `WorkoutDetail` | ⬜ | Translated labels and locale-aware date formatting. |
| ML.5.5 | `formatDate.ts` — accept `locale: string` argument; pass `i18nStore.language` from routes | ⬜ | Update `formatDate.test.ts` with `en-US` and `es-ES` cases. |
| ML.5.6 | `ConfirmDialog.svelte` — accept `confirmLabel` and `cancelLabel` props | ⬜ | English defaults; callers pass translated values. |
| ML.5.7 | `FontScaleControl.svelte` — accept aria-label as prop | ⬜ | |
| ML.5.8 | Update touched component tests | ⬜ | English-text assertions render with explicit prop values. No behaviour change since defaults are English. |

**Phase ML.5 exit criteria**: No user-visible English string remains hardcoded in any component. All component tests pass.

---

## Phase ML.6: Verification

> **Goal**: Sensors green, manual smoke test on Android with multiple OS locales.

| # | Task | Status | Notes |
|---|---|---|---|
| ML.6.1 | Frontend checklist: `npx svelte-check`, `npx eslint src/`, `npx vitest run` | ⬜ | Zero errors/warnings. |
| ML.6.2 | Backend checklist: `cargo check && cargo test --lib && cargo clippy` | ⬜ | Zero errors/warnings. |
| ML.6.3 | Manual: launch with system locale `es_*`, confirm "Match system" resolves to Español | ⬜ | Toggle each option. Restart app and confirm preference persists. Restart with different OS locale and confirm `system` re-resolves. Verify dates render in active locale on history screen. |
| ML.6.4 | Test at `extraLarge` font scale | ⬜ | Spanish strings are 15-30% longer than English. Check tab labels, save button, muscle group headers for overflow. |

**Phase ML.6 exit criteria**: Both sensor suites clean. App switches between English and Spanish on demand and via OS locale change. No layout breaks at extraLarge scale in either language.

---

## Steering Log (this feature only)

> Track any decisions or harness changes made *while building this feature*. Mirrored to the project-level Steering Log only when the change affects the whole project (not just this feature).

| Date | What changed | Why |
|---|---|---|
| 2026-04-27 | Created this file as the first per-feature status doc | New convention: major features get their own status file under `docs/features/` so feature work doesn't bloat the project-level status. |
| 2026-04-27 | Added i18n architecture section to AGENTS.md and Settings screen mockup to ui-spec.md | These are the durable spec artifacts; this status file tracks execution against them. |
