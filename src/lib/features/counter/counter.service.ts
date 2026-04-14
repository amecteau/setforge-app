import { invoke } from '@tauri-apps/api/core';
import type { WorkoutSet, Workout } from '$lib/shared/types/workout.js';

export async function startWorkout(id: string, date: string): Promise<void> {
	await invoke('start_workout', { id, date });
}

export async function finishWorkout(id: string, durationMinutes: number): Promise<void> {
	await invoke('finish_workout', { id, durationMinutes });
}

export async function saveSet(workoutId: string, set: WorkoutSet): Promise<void> {
	await invoke('save_set', { workoutId, set });
}

export async function getWorkouts(): Promise<Workout[]> {
	return invoke<Workout[]>('get_workouts');
}

export async function getIncompleteWorkout(): Promise<Workout | null> {
	return invoke<Workout | null>('get_incomplete_workout');
}

export async function deleteWorkout(id: string): Promise<void> {
	await invoke('delete_workout', { id });
}
