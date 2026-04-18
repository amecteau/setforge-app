# SetForge

A gym rep counter desktop and mobile app.

[![Latest Release](https://img.shields.io/github/v/release/amecteau/setforge-app)](https://github.com/amecteau/setforge-app/releases/latest)

## Download

Get the latest installer or APK from the [Releases page](https://github.com/amecteau/setforge-app/releases/latest).

| Platform | File |
|----------|------|
| Windows | `SetForge_x.x.x_x64-setup.exe` (NSIS installer) |
| Android | `SetForge.apk` |

## Development

Built with [Tauri v2](https://tauri.app) + [SvelteKit](https://svelte.dev).

```sh
npm install
npm run dev       # SvelteKit dev server
npx tauri dev     # Tauri desktop app
```

## Releasing

Push a version tag to trigger the GitHub Actions build:

```sh
npm version patch   # bumps package.json + tauri.conf.json
git push origin main --follow-tags
```
