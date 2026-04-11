import { describe, it, expect } from 'vitest';
import { createCounterStore } from './counterStore.svelte.js';
import type { Exercise } from '$lib/shared/types/exercise.js';

const benchPress: Exercise = {
	id: 'bench-press',
	name: 'Bench Press',
	muscleGroup: 'chest',
	isCustom: false
};

const squat: Exercise = {
	id: 'squat',
	name: 'Squat',
	muscleGroup: 'legs',
	isCustom: false
};

describe('counterStore', () => {
	it('starts with no workout', () => {
		const store = createCounterStore();
		expect(store.workout).toBeNull();
		expect(store.repCount).toBe(0);
		expect(store.sets).toHaveLength(0);
	});

	it('startWorkout creates a workout', () => {
		const store = createCounterStore();
		store.startWorkout();
		expect(store.workout).not.toBeNull();
		expect(store.workout?.sets).toHaveLength(0);
	});

	it('increment increases repCount by 1', () => {
		const store = createCounterStore();
		store.increment();
		store.increment();
		expect(store.repCount).toBe(2);
	});

	it('decrement decreases repCount by 1', () => {
		const store = createCounterStore();
		store.increment();
		store.increment();
		store.increment();
		store.decrement();
		expect(store.repCount).toBe(2);
	});

	it('decrement does not go below 0', () => {
		const store = createCounterStore();
		store.decrement();
		expect(store.repCount).toBe(0);
	});

	it('saveSet with 0 reps returns an error', () => {
		const store = createCounterStore();
		store.startWorkout();
		store.setExercise(benchPress);
		const result = store.saveSet();
		expect(result.success).toBe(false);
		expect(result.error).toContain('reps');
	});

	it('saveSet adds to sets and resets repCount', () => {
		const store = createCounterStore();
		store.startWorkout();
		store.setExercise(benchPress);
		store.increment();
		store.increment();
		store.increment();
		const result = store.saveSet();
		expect(result.success).toBe(true);
		expect(store.sets).toHaveLength(1);
		expect(store.sets[0].reps).toBe(3);
		expect(store.repCount).toBe(0);
	});

	it('saveSet records weight and unit', () => {
		const store = createCounterStore();
		store.startWorkout();
		store.setExercise(benchPress);
		store.setWeight(135);
		store.setUnit('lb');
		store.increment();
		store.saveSet();
		expect(store.sets[0].weight).toBe(135);
		expect(store.sets[0].unit).toBe('lb');
	});

	it('setNumber reflects current exercise sets', () => {
		const store = createCounterStore();
		store.startWorkout();
		store.setExercise(benchPress);
		expect(store.setNumber).toBe(1);
		store.increment();
		store.saveSet();
		expect(store.setNumber).toBe(2);
	});

	it('setExercise resets repCount', () => {
		const store = createCounterStore();
		store.increment();
		store.increment();
		store.setExercise(benchPress);
		expect(store.repCount).toBe(0);
	});

	it('setNumber resets when exercise changes', () => {
		const store = createCounterStore();
		store.startWorkout();
		store.setExercise(benchPress);
		store.increment();
		store.saveSet();
		store.setExercise(squat);
		expect(store.setNumber).toBe(1);
	});

	it('undoLastSet removes the most recent set', () => {
		const store = createCounterStore();
		store.startWorkout();
		store.setExercise(benchPress);
		store.increment();
		store.saveSet();
		store.increment();
		store.increment();
		store.saveSet();
		expect(store.sets).toHaveLength(2);
		store.undoLastSet();
		expect(store.sets).toHaveLength(1);
	});

	it('finishWorkout with no sets returns error', () => {
		const store = createCounterStore();
		store.startWorkout();
		const result = store.finishWorkout();
		expect(result.success).toBe(false);
		expect(result.error).toContain('No sets');
	});

	it('finishWorkout with sets clears the workout', () => {
		const store = createCounterStore();
		store.startWorkout();
		store.setExercise(benchPress);
		store.increment();
		store.saveSet();
		const result = store.finishWorkout();
		expect(result.success).toBe(true);
		expect(store.workout).toBeNull();
		expect(store.repCount).toBe(0);
	});

	it('discardWorkout clears the workout immediately', () => {
		const store = createCounterStore();
		store.startWorkout();
		store.discardWorkout();
		expect(store.workout).toBeNull();
	});

	it('adjustWeight adds delta and floors at 0', () => {
		const store = createCounterStore();
		store.adjustWeight(5);
		expect(store.weight).toBe(5);
		store.adjustWeight(-10);
		expect(store.weight).toBe(0);
	});
});
