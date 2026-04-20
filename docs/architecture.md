# SetForge — Architecture Overview

A Tauri v2 desktop app. The frontend is SvelteKit (TypeScript/Svelte 5) running in a Webview; the backend is Rust, accessed exclusively through named Tauri commands over an IPC bridge. All data lives in a local SQLite file — there is no network layer.

---

## High-Level Layers

```mermaid
graph TD
    subgraph FE["Frontend — SvelteKit Webview"]
        Pages["Pages / Routes"]
        Components["UI Components"]
        Stores["Svelte 5 Stores"]
        Services["Service Files"]
    end

    subgraph IPC["Tauri IPC Bridge"]
        Invoke["invoke() — @tauri-apps/api/core"]
    end

    subgraph BE["Backend — Rust / Tauri process"]
        Commands["Tauri Commands"]
        Repos["Repository Layer"]
        DBInit["db::initialize_db"]
    end

    subgraph Storage["Local Storage"]
        SQLite[("SQLite — repcounter.db")]
    end

    Pages --> Components
    Pages --> Stores
    Components --> Stores
    Stores --> Services
    Services --> Invoke
    Invoke -->|"JSON over IPC"| Commands
    Commands --> Repos
    Repos --> SQLite
    DBInit --> SQLite
```

---

## Data Capture & Persistence Flow

The critical path from a user tap to a persisted row.

```mermaid
sequenceDiagram
    actor User
    participant RC as RepCounter.svelte
    participant CS as counterStore
    participant SVC as counter.service.ts
    participant CMD as Tauri Command
    participant REPO as workout_repo
    participant DB as SQLite

    User->>RC: Tap rep area
    RC->>CS: store.increment()
    Note over CS: repCount++ in memory only

    User->>RC: Press Save Set
    RC->>CS: store.saveSet()
    CS->>CS: Build WorkoutSet object
    CS->>SVC: counterService.saveSet(workoutId, set)
    SVC->>CMD: invoke("save_set", workoutId + set)
    CMD->>REPO: workout_repo::save_set
    REPO->>DB: INSERT INTO sets
    DB-->>REPO: Ok
    REPO-->>CMD: Ok(())
    CMD-->>SVC: resolved Promise
    SVC-->>CS: resolved Promise
    CS->>CS: Append set to workout.sets, reset repCount to 0
    CS-->>RC: reactive update
    RC-->>User: Set appears in SetList
```

---

## Workout Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: app start, no incomplete workout
    [*] --> ResumePrompt: app start, incomplete workout found

    ResumePrompt --> Active: Resume chosen
    ResumePrompt --> Active: Start Fresh chosen

    Idle --> Active: Start Workout button
    Active --> Active: increment / decrement / saveSet
    Active --> Finished: Finish Workout (sets exist)
    Active --> Idle: Discard Workout

    Finished --> Idle: store cleared
```

---

## Frontend Module Structure

```mermaid
graph LR
    subgraph shared["shared/"]
        Types["types/\nexercise, workout,\nsettings, common"]
        SharedComp["components/\nBottomNav"]
    end

    subgraph counter["features/counter/"]
        cStore["counterStore\nrep count, sets,\nactive workout"]
        cSvc["counter.service\nstart_workout\nsave_set\nfinish_workout\nget_incomplete_workout\ndelete_workout"]
        cComp["components/\nRepCounter\nWeightInput\nSetList"]
    end

    subgraph exercises["features/exercises/"]
        eStore["exerciseStore\nbuilt-ins + custom\nsearch / filter"]
        eSvc["exercise.service\nsave_custom_exercise\nget_custom_exercises\ndelete_custom_exercise"]
        eComp["components/\nExercisePicker"]
    end

    subgraph settings["features/settings/"]
        sStore["settingsStore\nfontScale\nweightUnit\nlastExerciseId"]
        sSvc["settings.service\nsave_settings\nget_settings"]
        sComp["components/\nFontScaleControl"]
    end

    subgraph history["features/history/ (Phase 4)"]
        hStore["historyStore\nnot yet built"]
        hSvc["history.service\nnot yet built"]
    end

    Types --> cStore
    Types --> eStore
    Types --> sStore
    cStore --> cSvc
    eStore --> eSvc
    sStore --> sSvc
```

---

## Backend Module Structure

```mermaid
graph LR
    subgraph entry["lib.rs"]
        DbConn["DbConn\nMutex-wrapped\nSQLite Connection"]
        Setup["setup()\nopen DB, init schema\nregister commands"]
    end

    subgraph commands["commands/"]
        WCmd["workout.rs\nstart_workout\nfinish_workout\nsave_set\nget_workouts\nget_incomplete_workout\ndelete_workout"]
        ECmd["exercise.rs\nsave_custom_exercise\nget_custom_exercises\ndelete_custom_exercise"]
        SCmd["settings.rs\nsave_settings\nget_settings"]
    end

    subgraph repo["repo/"]
        WRepo["workout_repo.rs\nSQL for workouts + sets\ngroups sets by workout"]
        ERepo["exercise_repo.rs\nSQL for custom_exercises"]
        SRepo["settings_repo.rs\nkey-value upsert"]
    end

    subgraph dbmod["db/"]
        InitDB["mod.rs\ninitialize_db\nCREATE TABLE IF NOT EXISTS\nworkouts, sets,\ncustom_exercises, settings"]
    end

    DbConn --> WCmd
    DbConn --> ECmd
    DbConn --> SCmd
    WCmd --> WRepo
    ECmd --> ERepo
    SCmd --> SRepo
    Setup --> InitDB
```

---

## SQLite Schema

```mermaid
erDiagram
    workouts {
        TEXT id PK
        TEXT date
        INTEGER duration_minutes "NULL means incomplete"
    }
    sets {
        TEXT id PK
        TEXT workout_id FK
        TEXT exercise_id
        INTEGER reps
        REAL weight "nullable"
        TEXT unit "lb or kg"
        TEXT timestamp
        TEXT notes
    }
    custom_exercises {
        TEXT id PK
        TEXT name "UNIQUE"
        TEXT muscle_group
    }
    settings {
        TEXT key PK
        TEXT value "JSON-serialised"
    }

    workouts ||--o{ sets : "has"
```

---

## CI/CD Pipeline

Two GitHub Actions workflows govern quality and releases. Both live in `.github/workflows/`.

### Workflow: `ci.yml` — Continuous Integration

Triggers on **every push to any branch** (not tags). Runs unit tests only.

```
push to branch
    └── test (ubuntu-latest)
            ├── apt-get install libwebkit2gtk-4.1-dev ...  ← Tauri native deps
            ├── npm ci
            ├── npx vitest run                             ← frontend tests
            └── cd src-tauri && cargo test --lib           ← Rust lib tests
```

Purpose: catch regressions fast on every commit. ubuntu-latest is the fastest and cheapest runner for pure test work.

### Workflow: `release.yml` — Release Pipeline

Triggers on **`v*` tag pushes only**. The `test` job acts as a gate: build jobs only start if tests pass.

```
push v* tag
    └── test (ubuntu-latest)          ← same suite as ci.yml
            ├── build-windows (windows-latest)
            │       └── npx tauri build → .msi + .exe
            └── build-android (ubuntu-latest)
                    └── npx tauri android build --apk
                            └── release
                                    └── Create GitHub Release (attaches all artifacts)
```

### Pipeline Rules

| Rule | Reason |
|---|---|
| Tags skip `ci.yml` (`branches: ['**']` filter) | Prevents double test run when a tag is pushed |
| `release.yml` always re-runs its own `test` job | A direct tag push (bypassing a branch push) still can't skip tests |
| Tests run on `ubuntu-latest` in both workflows | ubuntu is faster and cheaper than `windows-latest` for pure Vitest + cargo test work |
| Build jobs use `needs: [test]` | Failed tests abort the pipeline before any expensive Tauri compilation begins |
| Linux CI installs GTK/WebKit system libs before Rust tests | `cargo test --lib` on ubuntu still compiles Tauri crate dependencies that link against `glib-2.0`, `libssl`, `librsvg2`, and `libayatana-appindicator3` |
| CI uses `cargo test --lib` not `cargo test` | `cargo test` without `--lib` also compiles the binary target, which requires a display server — `--lib` tests the library crate only, covering all repo/model/command logic |

---

## Key Architectural Constraints

| Rule | Where enforced |
|---|---|
| Only service files call `invoke()` — never components or stores directly | ESLint `no-restricted-imports` rule |
| Features never import from other features — shared code goes in `shared/` | ESLint `no-restricted-imports` rule |
| All sizing in `rem`, never `px` (except borders) | Code review / CLAUDE.md |
| Components receive data via props — they never import stores | AGENTS.md convention |
| Rust commands are thin (max 10 lines) — logic goes in `repo/` | AGENTS.md convention |
| No `.unwrap()` in Rust production code, no `any` in TypeScript | CLAUDE.md |
