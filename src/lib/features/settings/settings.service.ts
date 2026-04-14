import { invoke } from '@tauri-apps/api/core';
import type { UserSettings } from '$lib/shared/types/settings.js';

export async function saveSettings(settings: UserSettings): Promise<void> {
	await invoke('save_settings', { settings });
}

export async function getSettings(): Promise<UserSettings | null> {
	return invoke<UserSettings | null>('get_settings');
}
