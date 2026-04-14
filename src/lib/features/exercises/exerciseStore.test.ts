import { describe, it, expect, vi } from 'vitest';

vi.mock('./exercise.service.js', () => ({
	saveCustomExercise: vi.fn().mockResolvedValue(undefined),
	getCustomExercises: vi.fn().mockResolvedValue([]),
	deleteCustomExercise: vi.fn().mockResolvedValue(undefined)
}));

import { createExerciseStore } from './exerciseStore.svelte.js';
import { DEFAULT_EXERCISES } from './defaultExercises.js';
import type { Exercise } from '$lib/shared/types/exercise.js';

const customExercise: Exercise = {
	id: 'custom-1',
	name: 'Cable Crunch',
	muscleGroup: 'core',
	isCustom: true
};

describe('exerciseStore', () => {
	it('contains all default exercises', () => {
		const store = createExerciseStore();
		expect(store.allExercises.length).toBe(DEFAULT_EXERCISES.length);
	});

	it('exercises returns all by default (no filter)', () => {
		const store = createExerciseStore();
		expect(store.exercises.length).toBe(DEFAULT_EXERCISES.length);
	});

	it('setSearchQuery filters by name', () => {
		const store = createExerciseStore();
		store.setSearchQuery('bench');
		const results = store.exercises;
		expect(results.length).toBeGreaterThan(0);
		expect(results.every((e) => e.name.toLowerCase().includes('bench'))).toBe(true);
	});

	it('setSearchQuery filters by muscle group', () => {
		const store = createExerciseStore();
		store.setSearchQuery('chest');
		const results = store.exercises;
		expect(results.length).toBeGreaterThan(0);
		expect(results.every((e) => e.muscleGroup === 'chest')).toBe(true);
	});

	it('clearing searchQuery restores all exercises', () => {
		const store = createExerciseStore();
		store.setSearchQuery('bench');
		store.setSearchQuery('');
		expect(store.exercises.length).toBe(DEFAULT_EXERCISES.length);
	});

	it('getById returns the correct exercise', () => {
		const store = createExerciseStore();
		const found = store.getById('bench-press');
		expect(found?.name).toBe('Bench Press');
	});

	it('getById returns null for unknown id', () => {
		const store = createExerciseStore();
		expect(store.getById('does-not-exist')).toBeNull();
	});

	it('addCustom includes the new exercise', async () => {
		const store = createExerciseStore();
		await store.addCustom(customExercise);
		expect(store.allExercises.some((e) => e.id === 'custom-1')).toBe(true);
	});

	it('addCustom exercise appears in filtered results when matching query', async () => {
		const store = createExerciseStore();
		await store.addCustom(customExercise);
		store.setSearchQuery('cable');
		expect(store.exercises.some((e) => e.id === 'custom-1')).toBe(true);
	});

	it('removeCustom removes the exercise', async () => {
		const store = createExerciseStore();
		await store.addCustom(customExercise);
		await store.removeCustom('custom-1');
		expect(store.allExercises.some((e) => e.id === 'custom-1')).toBe(false);
	});

	it('getByMuscleGroup returns only that group', () => {
		const store = createExerciseStore();
		const chestExercises = store.getByMuscleGroup('chest');
		expect(chestExercises.length).toBeGreaterThan(0);
		expect(chestExercises.every((e) => e.muscleGroup === 'chest')).toBe(true);
	});
});
