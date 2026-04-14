import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Tauri invoke before importing the service
vi.mock('@tauri-apps/api/core', () => ({
	invoke: vi.fn()
}));

import { invoke } from '@tauri-apps/api/core';
import * as service from './counter.service.js';
import type { WorkoutSet } from '$lib/shared/types/workout.js';

const mockInvoke = vi.mocked(invoke);

const sampleSet: WorkoutSet = {
	id: 's1',
	exerciseId: 'bench-press',
	reps: 10,
	weight: 135,
	unit: 'lb',
	timestamp: '2026-04-10T10:00:00Z',
	notes: ''
};

beforeEach(() => {
	mockInvoke.mockReset();
});

describe('counter.service', () => {
	it('startWorkout invokes start_workout with id and date', async () => {
		mockInvoke.mockResolvedValueOnce(undefined);
		await service.startWorkout('w1', '2026-04-10');
		expect(mockInvoke).toHaveBeenCalledWith('start_workout', {
			id: 'w1',
			date: '2026-04-10'
		});
	});

	it('finishWorkout invokes finish_workout with id and duration', async () => {
		mockInvoke.mockResolvedValueOnce(undefined);
		await service.finishWorkout('w1', 45);
		expect(mockInvoke).toHaveBeenCalledWith('finish_workout', {
			id: 'w1',
			durationMinutes: 45
		});
	});

	it('saveSet invokes save_set with workoutId and set', async () => {
		mockInvoke.mockResolvedValueOnce(undefined);
		await service.saveSet('w1', sampleSet);
		expect(mockInvoke).toHaveBeenCalledWith('save_set', {
			workoutId: 'w1',
			set: sampleSet
		});
	});

	it('getWorkouts invokes get_workouts and returns result', async () => {
		const workouts = [{ id: 'w1', date: '2026-04-10', sets: [], durationMinutes: 45 }];
		mockInvoke.mockResolvedValueOnce(workouts);
		const result = await service.getWorkouts();
		expect(mockInvoke).toHaveBeenCalledWith('get_workouts');
		expect(result).toEqual(workouts);
	});

	it('getIncompleteWorkout invokes get_incomplete_workout', async () => {
		mockInvoke.mockResolvedValueOnce(null);
		const result = await service.getIncompleteWorkout();
		expect(mockInvoke).toHaveBeenCalledWith('get_incomplete_workout');
		expect(result).toBeNull();
	});

	it('getIncompleteWorkout returns workout when one exists', async () => {
		const workout = { id: 'w1', date: '2026-04-10', sets: [sampleSet], durationMinutes: null };
		mockInvoke.mockResolvedValueOnce(workout);
		const result = await service.getIncompleteWorkout();
		expect(result).toEqual(workout);
	});

	it('deleteWorkout invokes delete_workout with id', async () => {
		mockInvoke.mockResolvedValueOnce(undefined);
		await service.deleteWorkout('w1');
		expect(mockInvoke).toHaveBeenCalledWith('delete_workout', { id: 'w1' });
	});
});
