#!/usr/bin/env node
/**
 * Syncs the version from package.json into src-tauri/tauri.conf.json.
 * Runs automatically via the npm `version` lifecycle hook.
 * Stages the change so it is included in the version commit.
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const pkgPath = resolve(root, 'package.json');
const tauriPath = resolve(root, 'src-tauri', 'tauri.conf.json');

const { version } = JSON.parse(readFileSync(pkgPath, 'utf8'));
const tauriConf = JSON.parse(readFileSync(tauriPath, 'utf8'));

tauriConf.version = version;

writeFileSync(tauriPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log(`tauri.conf.json version → ${version}`);

// Stage the file so it is included in the version commit
execSync('git add src-tauri/tauri.conf.json', { cwd: root });
