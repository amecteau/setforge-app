import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
	invoke: vi.fn()
}));

import { invoke } from '@tauri-apps/api/core';
import * as service from './settings.service.js';
import type { UserSettings } from '$lib/shared/types/settings.js';

const mockInvoke = vi.mocked(invoke);

const settings: UserSettings = {
	fontScale: 'large',
	weightUnit: 'kg',
	lastExerciseId: 'bench-press'
};

beforeEach(() => {
	mockInvoke.mockReset();
});

describe('settings.service', () => {
	it('saveSettings invokes save_settings with the settings object', async () => {
		mockInvoke.mockResolvedValueOnce(undefined);
		await service.saveSettings(settings);
		expect(mockInvoke).toHaveBeenCalledWith('save_settings', { settings });
	});

	it('getSettings invokes get_settings and returns result', async () => {
		mockInvoke.mockResolvedValueOnce(settings);
		const result = await service.getSettings();
		expect(mockInvoke).toHaveBeenCalledWith('get_settings');
		expect(result).toEqual(settings);
	});

	it('getSettings returns null when no settings saved', async () => {
		mockInvoke.mockResolvedValueOnce(null);
		const result = await service.getSettings();
		expect(result).toBeNull();
	});
});
