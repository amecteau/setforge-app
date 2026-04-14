import type { WorkoutSet, WeightUnit } from '$lib/shared/types/workout.js';
import type { Exercise } from '$lib/shared/types/exercise.js';
import * as counterService from './counter.service.js';

interface ActiveWorkout {
	id: string;
	startedAt: string;
	sets: WorkoutSet[];
}

export interface StoreResult {
	success: boolean;
	error?: string;
}

export function createCounterStore() {
	let workout = $state<ActiveWorkout | null>(null);
	let currentExercise = $state<Exercise | null>(null);
	let repCount = $state(0);
	let weight = $state<number | null>(null);
	let weightUnit = $state<WeightUnit>('lb');

	return {
		get workout() {
			return workout;
		},
		get currentExercise() {
			return currentExercise;
		},
		get repCount() {
			return repCount;
		},
		get weight() {
			return weight;
		},
		get weightUnit() {
			return weightUnit;
		},
		get sets(): WorkoutSet[] {
			return workout?.sets ?? [];
		},
		get setNumber(): number {
			const exerciseSets =
				workout?.sets.filter((s) => s.exerciseId === currentExercise?.id) ?? [];
			return exerciseSets.length + 1;
		},

		async startWorkout() {
			const id = crypto.randomUUID();
			const date = new Date().toISOString().slice(0, 10);
			await counterService.startWorkout(id, date);
			workout = { id, startedAt: new Date().toISOString(), sets: [] };
		},

		/** Resume an existing workout loaded from the backend. */
		resumeWorkout(w: { id: string; startedAt: string; sets: WorkoutSet[] }) {
			workout = w;
		},

		setExercise(exercise: Exercise) {
			currentExercise = exercise;
			repCount = 0;
		},

		increment() {
			repCount++;
		},

		decrement() {
			if (repCount > 0) repCount--;
		},

		setWeight(w: number | null) {
			weight = w;
		},

		adjustWeight(delta: number) {
			weight = Math.max(0, (weight ?? 0) + delta);
		},

		setUnit(unit: WeightUnit) {
			weightUnit = unit;
		},

		async saveSet(): Promise<StoreResult> {
			if (!workout || !currentExercise) return { success: false, error: 'No active workout' };
			if (repCount === 0) return { success: false, error: 'Add some reps first' };

			const set: WorkoutSet = {
				id: crypto.randomUUID(),
				exerciseId: currentExercise.id,
				reps: repCount,
				weight,
				unit: weightUnit,
				timestamp: new Date().toISOString(),
				notes: ''
			};

			await counterService.saveSet(workout.id, set);
			workout = { ...workout, sets: [...workout.sets, set] };
			repCount = 0;
			return { success: true };
		},

		undoLastSet() {
			if (!workout) return;
			workout = { ...workout, sets: workout.sets.slice(0, -1) };
		},

		async finishWorkout(): Promise<StoreResult> {
			if (!workout) return { success: false, error: 'No active workout' };
			if (workout.sets.length === 0) {
				return { success: false, error: 'No sets recorded. Discard workout?' };
			}
			const startedMs = new Date(workout.startedAt).getTime();
			const durationMinutes = Math.round((Date.now() - startedMs) / 60_000);
			await counterService.finishWorkout(workout.id, durationMinutes);
			workout = null;
			currentExercise = null;
			repCount = 0;
			weight = null;
			return { success: true };
		},

		async discardWorkout() {
			if (workout) {
				// Mark as finished with 0 duration so it won't show as incomplete on resume
				await counterService.finishWorkout(workout.id, 0);
			}
			workout = null;
			currentExercise = null;
			repCount = 0;
			weight = null;
		}
	};
}

export const counterStore = createCounterStore();
