import { describe, it, expect, vi } from 'vitest';

vi.mock('./history.service.js', () => ({
	getWorkouts: vi.fn().mockResolvedValue([]),
	deleteWorkout: vi.fn().mockResolvedValue(undefined)
}));

import { createHistoryStore } from './historyStore.svelte.js';
import * as historyService from './history.service.js';
import type { Workout } from '$lib/shared/types/workout.js';

const w1: Workout = { id: 'w1', date: '2026-04-10', sets: [], durationMinutes: 45 };
const w2: Workout = { id: 'w2', date: '2026-04-12', sets: [], durationMinutes: 30 };

describe('historyStore', () => {
	it('starts with no workouts and no expanded id', () => {
		const store = createHistoryStore();
		expect(store.workouts).toHaveLength(0);
		expect(store.expandedId).toBeNull();
	});

	it('load fetches workouts and sorts reverse chronologically', async () => {
		vi.mocked(historyService.getWorkouts).mockResolvedValueOnce([w1, w2]);
		const store = createHistoryStore();
		await store.load();
		expect(store.workouts[0].id).toBe('w2');
		expect(store.workouts[1].id).toBe('w1');
	});

	it('load with empty list leaves workouts empty', async () => {
		vi.mocked(historyService.getWorkouts).mockResolvedValueOnce([]);
		const store = createHistoryStore();
		await store.load();
		expect(store.workouts).toHaveLength(0);
	});

	it('toggleExpand sets expandedId', () => {
		const store = createHistoryStore();
		store.toggleExpand('w1');
		expect(store.expandedId).toBe('w1');
	});

	it('toggleExpand collapses when same id clicked again', () => {
		const store = createHistoryStore();
		store.toggleExpand('w1');
		store.toggleExpand('w1');
		expect(store.expandedId).toBeNull();
	});

	it('toggleExpand switches to a different id', () => {
		const store = createHistoryStore();
		store.toggleExpand('w1');
		store.toggleExpand('w2');
		expect(store.expandedId).toBe('w2');
	});

	it('deleteWorkout removes the workout from the list', async () => {
		vi.mocked(historyService.getWorkouts).mockResolvedValueOnce([w1, w2]);
		const store = createHistoryStore();
		await store.load();
		await store.deleteWorkout('w1');
		expect(store.workouts).toHaveLength(1);
		expect(store.workouts[0].id).toBe('w2');
	});

	it('deleteWorkout clears expandedId if it was the deleted workout', async () => {
		vi.mocked(historyService.getWorkouts).mockResolvedValueOnce([w1]);
		const store = createHistoryStore();
		await store.load();
		store.toggleExpand('w1');
		await store.deleteWorkout('w1');
		expect(store.expandedId).toBeNull();
	});

	it('deleteWorkout does not clear expandedId for a different workout', async () => {
		vi.mocked(historyService.getWorkouts).mockResolvedValueOnce([w1, w2]);
		const store = createHistoryStore();
		await store.load();
		store.toggleExpand('w2');
		await store.deleteWorkout('w1');
		expect(store.expandedId).toBe('w2');
	});

	it('deleteWorkout calls the service', async () => {
		vi.mocked(historyService.getWorkouts).mockResolvedValueOnce([w1]);
		const store = createHistoryStore();
		await store.load();
		await store.deleteWorkout('w1');
		expect(historyService.deleteWorkout).toHaveBeenCalledWith('w1');
	});

	it('deleteWorkout returns success: true on success', async () => {
		vi.mocked(historyService.getWorkouts).mockResolvedValueOnce([w1]);
		const store = createHistoryStore();
		await store.load();
		const result = await store.deleteWorkout('w1');
		expect(result).toEqual({ success: true });
	});

	it('deleteWorkout does not mutate store and returns error when service throws', async () => {
		vi.mocked(historyService.getWorkouts).mockResolvedValueOnce([w1]);
		vi.mocked(historyService.deleteWorkout).mockRejectedValueOnce(new Error('DB error'));
		const store = createHistoryStore();
		await store.load();
		const result = await store.deleteWorkout('w1');
		expect(result).toEqual({ success: false, error: 'DB error' });
		expect(store.workouts).toHaveLength(1);
	});
});
