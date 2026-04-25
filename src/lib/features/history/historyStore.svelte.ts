import type { Workout } from '$lib/shared/types/workout.js';
import type { StoreResult } from '$lib/shared/types/common.js';
import * as historyService from './history.service.js';

export function createHistoryStore() {
	let workouts = $state<Workout[]>([]);
	let expandedId = $state<string | null>(null);

	return {
		get workouts() {
			return workouts;
		},
		get expandedId() {
			return expandedId;
		},

		async load() {
			const loaded = await historyService.getWorkouts();
			workouts = [...loaded].sort((a, b) => b.date.localeCompare(a.date));
		},

		toggleExpand(id: string) {
			expandedId = expandedId === id ? null : id;
		},

		async deleteWorkout(id: string): Promise<StoreResult> {
			try {
				await historyService.deleteWorkout(id);
				workouts = workouts.filter((w) => w.id !== id);
				if (expandedId === id) expandedId = null;
				return { success: true };
			} catch (e) {
				return { success: false, error: e instanceof Error ? e.message : 'Failed to delete workout' };
			}
		}
	};
}

export const historyStore = createHistoryStore();
