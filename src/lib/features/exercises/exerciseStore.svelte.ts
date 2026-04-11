import type { Exercise, MuscleGroup } from '$lib/shared/types/exercise.js';
import { DEFAULT_EXERCISES } from './defaultExercises.js';

export function createExerciseStore() {
	let customExercises = $state<Exercise[]>([]);
	let searchQuery = $state('');

	const allExercises = $derived([...DEFAULT_EXERCISES, ...customExercises]);

	const filteredExercises = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return allExercises;
		return allExercises.filter(
			(e) =>
				e.name.toLowerCase().includes(q) ||
				(e.muscleGroup as string).toLowerCase().includes(q)
		);
	});

	return {
		get exercises(): Exercise[] {
			return filteredExercises;
		},
		get allExercises(): Exercise[] {
			return allExercises;
		},
		get searchQuery() {
			return searchQuery;
		},

		getById(id: string): Exercise | null {
			return allExercises.find((e) => e.id === id) ?? null;
		},

		setSearchQuery(q: string) {
			searchQuery = q;
		},

		addCustom(exercise: Exercise) {
			customExercises = [...customExercises, exercise];
		},

		removeCustom(id: string) {
			customExercises = customExercises.filter((e) => e.id !== id);
		},

		getByMuscleGroup(group: MuscleGroup): Exercise[] {
			return allExercises.filter((e) => e.muscleGroup === group);
		}
	};
}

export const exerciseStore = createExerciseStore();
