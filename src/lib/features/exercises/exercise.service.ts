import { invoke } from '@tauri-apps/api/core';
import type { Exercise } from '$lib/shared/types/exercise.js';

export async function saveCustomExercise(exercise: Exercise): Promise<void> {
	await invoke('save_custom_exercise', { exercise });
}

export async function getCustomExercises(): Promise<Exercise[]> {
	return invoke<Exercise[]>('get_custom_exercises');
}

export async function deleteCustomExercise(id: string): Promise<void> {
	await invoke('delete_custom_exercise', { id });
}
