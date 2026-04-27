# SetForge — UI Specification

This document describes every screen, interaction, and user flow in the app. It is the source of truth for what the app should do. If a feature is not described here, do not build it without asking.

---

## Design Principles

- **One-handed operation**: Primary actions (counting reps) must work with a single thumb tap on a large target area. The entire app must be usable without a keyboard.
- **Glanceable**: Current rep count and exercise name must be readable from arm's length (large text, high contrast).
- **Scalable UI**: Users can scale the interface font size up or down. Someone without their glasses should be able to read the rep count and exercise name comfortably. The entire layout must reflow gracefully at larger font sizes without breaking or overflowing.
- **Minimal friction**: Starting a workout and logging reps should take the fewest possible taps.
- **Dark-first**: Default to a dark theme. Gym lighting is variable; dark UI reduces glare and eye strain.
- **Forgiveness**: Undo/decrement is always available. Accidental taps happen during exercise.
- **Touch-native**: All interactions are designed for touch first. No interaction should depend on hover, right-click, long-press-only, or keyboard shortcuts. Those are enhancements, not requirements.

---

## Screen Inventory

The app has three screens accessible via the bottom navigation, plus a **Settings** screen reached via the gear icon in the top bar:

1. **Counter** (main screen, default on launch)
2. **History** (past workouts)
3. **Exercises** (manage exercise list)
4. **Settings** (preferences — reached via the gear icon in the top bar, not the bottom nav)

---

## Screen 1: Counter (Main Screen)

This is where the user spends 95% of their time during a workout.

### Layout

The three most important pieces of information — exercise, weight, and reps — are visible at a glance without scrolling. The previous sets list scrolls off below the fold by design.

```
┌──────────────────────────────┐
│  SetForge        [A−A+] [⚙]  │  ← Top bar: title, font scale, settings
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │  Bench Press        ▼  │  │  ← Exercise selector (opens picker)
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  WEIGHT                │  │  ← Weight card
│  │                        │  │
│  │  [−5]    135    [+5]  │  │     −/+ flank the hero number
│  │           lb           │  │     unit label tappable to toggle
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  REPS          Set 3   │  │  ← Reps card (set number top-right)
│  │                        │  │
│  │          12            │  │     Tap anywhere in card to +1
│  │                        │  │
│  │   [ − ]        [ + ]  │  │     −/+ buttons inside the card
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │      Save Set ✓        │  │  ← Full-width save button
│  └────────────────────────┘  │
│                              │
│  ── Previous Sets ────────── │  ← scrolls off below the fold
│  Set 1: 12 reps @ 135 lb  ← │     swipe left to reveal Undo
│  Set 2: 10 reps @ 135 lb  ← │
│                              │
│  ┌────────────────────────┐  │
│  │    Finish Workout 🏁   │  │
│  └────────────────────────┘  │
│                              │
├──────────────────────────────┤
│  [Counter]  [History]  [Ex.] │  ← Bottom nav (icons + text labels)
└──────────────────────────────┘
```

### States

**No Active Workout (initial state on launch)**:
- Show a "Start Workout" button center screen.
- Tapping it creates a new Workout with today's date and transitions to the active workout state.
- If there's an unsaved workout from today (app was closed mid-workout), prompt: "Resume today's workout?" with Resume / Start Fresh options.

**Active Workout**:
- Exercise selector defaults to the last-used exercise, or the first in the list if first time.
- Rep count starts at 0 for each new set.
- Weight input pre-fills with the weight from the last set of the same exercise.
- Unit selector (kg/lb) remembers the user's last choice and persists across sessions.

**Set Complete**:
- After tapping "Save Set", the set appears in the "Previous Sets" list below.
- Rep count resets to 0.
- Set counter increments.
- Weight remains filled in.
- Brief confirmation animation (the count area flashes green or shows a checkmark for 500ms).

### Interactions

| Action | Input | Result |
|---|---|---|
| Increment rep count | Tap the giant number area, or tap the `+` button | Count increases by 1, subtle visual pulse on the number |
| Decrement rep count | Tap the `−` button (always visible) | Count decreases by 1, minimum 0 |
| Change exercise | Tap exercise selector | Opens full-screen exercise picker with search bar and muscle group sections |
| Set weight | Tap weight field (opens numeric keypad) or use `−5`/`+5` stepper buttons flanking the field | Numeric input, accepts decimals. Steppers adjust by 5 lb or 2.5 kg depending on unit. |
| Toggle unit | Tap unit toggle (shows "kg" or "lb") | Switch between kg and lb. Does NOT convert the number. |
| Save set | Tap "Save Set" button (full width, prominent) | Saves the set to current workout, resets count, advances set number |
| Undo last set | Swipe left on a set in the previous sets list → tap revealed "Undo" button | Removes the set, decrements set counter. Two-step action prevents accidental deletion. |
| Finish workout | Tap "Finish Workout" button | Saves workout, returns to "No Active Workout" state |

### Validation Rules

- Rep count cannot go below 0.
- Weight is optional (for bodyweight exercises). If provided, must be > 0.
- Cannot save a set with 0 reps (show brief inline message: "Add some reps first").
- "Finish Workout" with no saved sets should prompt: "No sets recorded. Discard workout?"

---

## Screen 2: History

Shows past workouts in reverse chronological order.

### Layout

```
┌──────────────────────────────┐
│  [≡ Nav]      History        │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │  Today, Apr 6 2026     │  │  ← Workout card
│  │  4 exercises · 16 sets │  │
│  │  Bench Press: 3×12     │  │     Summary of exercises
│  │  Squat: 4×8            │  │
│  │  Barbell Row: 3×10     │  │
│  │  Overhead Press: 3×8   │  │
│  │                    [→] │  │     Tap to expand
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  Apr 4, 2026           │  │
│  │  3 exercises · 12 sets │  │
│  │  ...                   │  │
│  └────────────────────────┘  │
│                              │
│  (scrollable list)           │
│                              │
├──────────────────────────────┤
│  [Counter]  [History]  [Ex.] │
└──────────────────────────────┘
```

### Expanded Workout View

Tapping a workout card expands it inline (or navigates to a detail view) showing:

```
  Today, Apr 6 2026
  Duration: 52 min

  Bench Press
    Set 1: 12 × 135 lb
    Set 2: 10 × 135 lb
    Set 3: 8 × 140 lb

  Squat
    Set 1: 8 × 225 lb
    Set 2: 8 × 225 lb
    Set 3: 8 × 225 lb
    Set 4: 6 × 235 lb
  ...
```

### Interactions

| Action | Input | Result |
|---|---|---|
| View workout detail | Tap workout card | Expands to show all sets per exercise |
| Collapse detail | Tap again or tap a collapse button | Returns to summary view |
| Delete workout | Swipe left on card, or long-press → Delete | Confirmation dialog: "Delete workout from Apr 6?" with Cancel / Delete |

### Empty State

If no workouts exist, show:
- Illustration or icon (dumbbell, simple and clean)
- "No workouts yet"
- "Start your first workout from the Counter tab"

---

## Screen 3: Exercises

Manage the exercise library.

### Layout

```
┌──────────────────────────────┐
│  [≡ Nav]     Exercises       │
├──────────────────────────────┤
│                              │
│  [🔍 Search exercises... ]   │  ← Search/filter bar
│                              │
│  CHEST ──────────────────    │  ← Grouped by muscle group
│  Bench Press           ★     │     ★ = frequently used (auto)
│  Incline Bench Press         │
│  Dumbbell Fly                │
│  Push-Up                     │
│                              │
│  BACK ───────────────────    │
│  Pull-Up               ★     │
│  Barbell Row                 │
│  ...                         │
│                              │
│  CUSTOM ─────────────────    │  ← User-created exercises at bottom
│  Cable Crunch (core)         │
│  Hip Thrust (legs)           │
│                              │
│  ┌────────────────────────┐  │
│  │  + Add Custom Exercise │  │
│  └────────────────────────┘  │
│                              │
├──────────────────────────────┤
│  [Counter]  [History]  [Ex.] │
└──────────────────────────────┘
```

### Add Custom Exercise Flow

Tapping "+ Add Custom Exercise" opens an inline form or modal:

```
  Exercise Name: [____________]
  Muscle Group:  [Chest ▼     ]

  [Cancel]  [Save]
```

### Interactions

| Action | Input | Result |
|---|---|---|
| Search exercises | Type in search bar | Filters list in real time across all groups |
| Add custom exercise | Tap "+ Add Custom Exercise" | Shows inline form |
| Save custom exercise | Fill form, tap Save | Validates (name required, must be unique), adds to list under CUSTOM |
| Delete custom exercise | Swipe left on custom exercise | Confirmation dialog. Cannot delete built-in exercises. |
| Select exercise | Tap exercise name | Navigates to Counter screen with this exercise selected |

### Validation Rules

- Exercise name is required, 1–50 characters.
- Exercise name must be unique (case-insensitive).
- Muscle group is required.
- Built-in exercises cannot be edited or deleted.

---

## Screen 4: Settings

Reached by tapping the gear icon (⚙) in the top bar. Hosts user preferences. Not part of the bottom navigation — it's a peripheral screen, not part of the workout flow.

### Layout

```
┌──────────────────────────────┐
│  [← Back]      Settings      │  ← Top bar: back link, title
├──────────────────────────────┤
│                              │
│  LANGUAGE ───────────────    │
│                              │
│  (●) Match system (English)  │  ← Default. Persists "system",
│  ( ) English                 │     resolves to OS locale at launch.
│  ( ) Español                 │     Parens show the detected language
│                              │     when "Match system" is selected.
│                              │
│  WEIGHT UNIT ────────────    │
│                              │
│  ( ) Kilograms (kg)          │  (Future — not in initial i18n build)
│  (●) Pounds (lb)             │
│                              │
│  ABOUT ──────────────────    │
│                              │
│  SetForge v0.0.10            │
│                              │
├──────────────────────────────┤
│  [Counter]  [History]  [Ex.] │  ← Bottom nav still visible
└──────────────────────────────┘
```

### Interactions

| Action | Input | Result |
|---|---|---|
| Change language | Tap a radio option | Persists choice; UI re-renders in the chosen language immediately. |
| Match system | Tap "Match system" | Persists the literal value `system`. On every launch the app re-detects the OS locale (`navigator.language`) and uses that. The current resolution is shown in parens next to the option. |
| Return | Tap back link, or any bottom-nav tab | Returns to the previous screen. |

### Behaviour

- The language preference is stored as one of: `system`, `en`, `es`.
- The default on first launch (before any setting is saved) is **Match system**.
- When set to `system`, the app re-evaluates the OS locale at every launch — changing your phone's language between sessions will switch the app's language.
- Supported languages are **English** and **Spanish** only. If the OS reports any other locale and the preference is `system`, the app falls back to **English**.
- Custom exercise names entered by the user are not translated — they appear exactly as typed regardless of language.
- Built-in exercise names and muscle group labels are translated.
- Dates in the History screen are formatted using `Intl.DateTimeFormat` with the active locale; ISO-8601 strings remain in storage.

### Validation Rules

- The radio group always has exactly one selection.

---

## Navigation

### Bottom Navigation Bar

Three tabs, always visible:
- **Counter** — icon: circle with number or tally marks
- **History** — icon: clock or calendar
- **Exercises** — icon: dumbbell

Active tab is highlighted. Tapping Counter always goes to the current workout state (active or start screen).

### Top Bar

- App title: "SetForge" (left)
- Font scale control (`A−` / `A+`) (right)
- Settings gear icon (⚙) (right of font scale) — links to the Settings screen. `aria-label="Settings"`. Touch target ≥ `3rem`.

---

## Data Persistence Behaviour

- Workout data is saved to local storage via Tauri (SQLite or JSON file).
- **Auto-save**: Each set is persisted immediately when "Save Set" is tapped. If the app crashes mid-workout, saved sets are preserved.
- **Workout resume**: If the app is reopened and there's an incomplete workout from today (sets saved but "Finish Workout" not tapped), offer to resume.
- **Weight unit preference**: Persisted across sessions as a user setting.
- **Last-used exercise**: Persisted so the Counter opens to it next session.

---

## Visual Design Direction

- **Color palette**: Dark background (near-black, e.g., `#0a0a0a`), with a bold accent color for the rep count and primary actions (electric blue, vivid green, or warm orange — pick one and commit).
- **Typography**: The rep count number should be enormous — at least 120px at the default scale, possibly larger. Use a bold, clean sans-serif. Supporting text in a lighter weight of the same family. All font sizes must be defined in `rem` units (never `px`) so they scale with the root font size.
- **Spacing**: Generous. Touch targets minimum 48px (ideally 56px+). The main tap area (rep count) should be at least 200×200px at default scale. Use `rem` or relative units for spacing so it scales proportionally with font size.
- **Animations**: Subtle and purposeful. The rep count should animate on change (scale up briefly). Set save should have a brief success flash. No decorative animations.
- **Borders and cards**: Minimal. Use spacing and subtle background shade differences to separate sections, not heavy borders.

---

## Font Scaling

Users must be able to increase the UI font size for readability without glasses.

### Implementation

- All sizing uses `rem` units, anchored to the root `<html>` font size.
- A **font scale control** is always accessible from the top bar — a simple `A−` / `A+` button pair or a small/medium/large toggle.
- Scale levels: **Small** (14px base), **Medium** (18px base, default), **Large** (24px base), **Extra Large** (32px base).
- The selected scale is persisted across sessions as a user setting.
- When the scale changes, the entire UI reflows. Layouts must not break, overflow, or clip at any scale level.

### Layout Rules at Large Scales

- The counter screen prioritises the rep count and tap area. At Extra Large scale, secondary elements (previous sets list, weight input) may scroll off-screen — that's acceptable. The rep count and Save Set button must always be visible without scrolling.
- Exercise names that are too long to fit at large scale should truncate with ellipsis, not wrap to multiple lines in the selector.
- Bottom navigation icons should include visible text labels at all scales (not icon-only), and the bar should grow taller at larger scales to maintain touch targets.
- The history screen cards can grow taller to accommodate larger text. The card list remains scrollable.

### What NOT To Do with Scaling

- Do NOT use browser zoom or CSS `transform: scale()` — this creates blurry text and broken layouts.
- Do NOT use `px` for font sizes, paddings, margins, or touch target sizes. Use `rem`.
- Do NOT cap the maximum font size. If the user wants Extra Large, respect it.

---

## Touch & Mobile Interaction

The app must be fully usable on a mobile device (via Tauri mobile or a future PWA) with no keyboard and no mouse. Every interaction has a touch-first design.

### Touch Target Sizes

- **Primary actions** (rep count tap area, Save Set, Finish Workout): minimum 56px tall, full width or near-full width.
- **Secondary actions** (increment/decrement buttons, exercise selector): minimum 48px × 48px.
- **Destructive actions** (delete set, delete workout): minimum 44px, require a confirmation step.
- **Navigation tabs**: minimum 48px tall, evenly spaced across screen width.
- **Spacing between targets**: At least 8px gap between adjacent tappable elements to prevent mis-taps.

### Gesture Support

| Gesture | Where | Action |
|---|---|---|
| Tap | Rep count area | Increment count |
| Tap | `−` / `+` buttons | Decrement / increment |
| Swipe left | Set row in previous sets list | Reveal delete/undo button |
| Swipe left | Workout card in history | Reveal delete button |
| Pull down | History list | Refresh (if applicable) |

### What Replaces Keyboard/Hover/Right-Click

Every interaction that was described with a keyboard shortcut or desktop convention must also have a visible, tappable equivalent:

| Desktop convention | Touch equivalent |
|---|---|
| Keyboard Space/Enter to count | The giant tap area IS the primary input |
| Keyboard Backspace to decrement | Visible `−` button, always on screen |
| Ctrl+S to save set | Visible "Save Set" button, always on screen |
| Hover to reveal options | Options always visible, or revealed via swipe |
| Right-click to delete | Swipe left to reveal, then tap confirm |
| Long-press for context menu | Do NOT rely on long-press — use swipe-to-reveal instead. Long-press is easy to miss and conflicts with OS-level interactions. |

### Numeric Input (Weight Field)

- Tap the weight field to open the device's **numeric keyboard** (use `inputmode="decimal"` and `type="text"` to get a number pad without spinner arrows).
- Include visible `+` / `−` stepper buttons flanking the weight field for quick 5lb/2.5kg adjustments without opening the keyboard.
- The weight field should be large enough to tap accurately (full width, at least 48px tall).

### Exercise Selector on Mobile

- Tapping the exercise dropdown opens a **full-screen or bottom-sheet picker**, not a native `<select>` dropdown (which is hard to use with muscle group sections).
- The picker includes a search bar at the top with auto-focus so the keyboard opens immediately.
- Exercises are grouped by muscle group with sticky section headers.
- Tapping an exercise selects it and closes the picker.
- A "Cancel" button or tap-outside-to-dismiss is always available.

---

## Keyboard Shortcuts (Enhancement Only)

These are available on desktop but the app never depends on them. Every action has a visible touch equivalent (see above).

- **Space bar** or **Enter**: Increment rep count (when counter is focused)
- **Backspace**: Decrement rep count
- **Ctrl+S / Cmd+S**: Save current set
- **Tab navigation**: All interactive elements reachable via Tab

---

## Accessibility

- **Screen reader**: Rep count changes announced via `aria-live="polite"` region. Exercise name and set number included in announcements.
- **Contrast**: All text meets WCAG AA contrast ratios against the dark background. The accent color for the rep count must have at least 4.5:1 contrast against the background.
- **Focus indicators**: Visible focus rings on all interactive elements for keyboard/switch-access users. Do not remove default focus outlines without providing a visible alternative.
- **Reduced motion**: Respect `prefers-reduced-motion` media query. When enabled, skip the rep count scale animation and set-save flash — use instant state changes instead.
- **Font scaling**: See Font Scaling section above. The app must remain usable at all scale levels.

---

## Out of Scope (Do NOT Build)

These features are explicitly excluded from the initial build:

- User accounts or authentication
- Cloud sync or multi-device support
- Exercise tutorials or form videos
- Rest timer between sets (future Phase 5)
- Workout templates / routines
- Social features (sharing, leaderboards)
- Body weight / measurement tracking
- Charts or graphs (future Phase 4+)
- Export to CSV/PDF
- Notifications or reminders
- Music integration
