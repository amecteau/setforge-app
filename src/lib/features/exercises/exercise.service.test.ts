import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
	invoke: vi.fn()
}));

import { invoke } from '@tauri-apps/api/core';
import * as service from './exercise.service.js';
import type { Exercise } from '$lib/shared/types/exercise.js';

const mockInvoke = vi.mocked(invoke);

const customExercise: Exercise = {
	id: 'ex1',
	name: 'Cable Fly',
	muscleGroup: 'chest',
	isCustom: true
};

beforeEach(() => {
	mockInvoke.mockReset();
});

describe('exercise.service', () => {
	it('saveCustomExercise invokes save_custom_exercise', async () => {
		mockInvoke.mockResolvedValueOnce(undefined);
		await service.saveCustomExercise(customExercise);
		expect(mockInvoke).toHaveBeenCalledWith('save_custom_exercise', {
			exercise: customExercise
		});
	});

	it('getCustomExercises invokes get_custom_exercises and returns list', async () => {
		mockInvoke.mockResolvedValueOnce([customExercise]);
		const result = await service.getCustomExercises();
		expect(mockInvoke).toHaveBeenCalledWith('get_custom_exercises');
		expect(result).toEqual([customExercise]);
	});

	it('getCustomExercises returns empty array when none exist', async () => {
		mockInvoke.mockResolvedValueOnce([]);
		const result = await service.getCustomExercises();
		expect(result).toEqual([]);
	});

	it('deleteCustomExercise invokes delete_custom_exercise with id', async () => {
		mockInvoke.mockResolvedValueOnce(undefined);
		await service.deleteCustomExercise('ex1');
		expect(mockInvoke).toHaveBeenCalledWith('delete_custom_exercise', { id: 'ex1' });
	});
});
