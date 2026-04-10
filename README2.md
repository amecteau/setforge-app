# Dev Container — Gym Rep Counter

## What lives where

| Task | Where it runs |
|---|---|
| `npx svelte-check` | Container ✅ |
| `npx eslint src/` | Container ✅ |
| `npx vitest run` | Container ✅ |
| `cargo check / test / clippy` | Container ✅ |
| `cargo tauri dev` (native window) | **Host machine** ⚠️ |
| `cargo tauri build` | Either (container is fine for CI) |

The container has everything except a display server, so all the checks
from CLAUDE.md run cleanly inside it. The Tauri native window is the one
thing you launch on your host.

---

## First-time host setup (one-off)

You only need this to actually *run* the GUI. Skip if you only want the
checks to work.

### macOS
```bash
# Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Tauri v2 system deps — macOS already has WebKit, just need Xcode tools
xcode-select --install
```

### Ubuntu / Debian
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
sudo apt update && sudo apt install -y \
  libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev \
  patchelf libgtk-3-dev libssl-dev pkg-config build-essential
```

### Windows
Install [Rust via rustup](https://rustup.rs) and
[WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
(usually already present on Windows 11).

---

## Daily workflow

### All checks (inside container)
Open the project in VS Code → "Reopen in Container" → then:

```bash
# Frontend
npx svelte-check --tsconfig ./tsconfig.json
npx eslint src/
npx vitest run

# Rust
cd src-tauri && cargo check && cargo test && cargo clippy
```

### Running the app (host terminal, outside container)
```bash
npm install          # first time only
cargo tauri dev
```

---

## Rebuilding the container

The Cargo registry is cached in a named Docker volume (`rep-counter-cargo-cache`)
so crates survive a container rebuild. If you need a clean slate:

```bash
docker volume rm rep-counter-cargo-cache rep-counter-cargo-git
```

Then rebuild via VS Code: **Ctrl/Cmd+Shift+P → "Dev Containers: Rebuild Container"**.

---

## Why not run `cargo tauri dev` inside the container?

Tauri opens a native OS window via WebKit/WebView2. Containers don't have
a display server by default. You *can* add X11 forwarding (see below) but
the host-split approach avoids the extra complexity for a single-developer
desktop app.

### Optional: X11 forwarding (Linux hosts only)
If you're on Linux and want to run the full app inside the container, add
this to `devcontainer.json`:

```json
"runArgs": ["--env=DISPLAY=${localEnv:DISPLAY}", "--volume=/tmp/.X11-unix:/tmp/.X11-unix"]
```

And on your host before opening VS Code:
```bash
xhost +local:docker
```
