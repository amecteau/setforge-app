import type { Exercise } from '$lib/shared/types/exercise.js';

export const DEFAULT_EXERCISES: Exercise[] = [
	// Chest
	{ id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', isCustom: false },
	{ id: 'incline-bench-press', name: 'Incline Bench Press', muscleGroup: 'chest', isCustom: false },
	{ id: 'dumbbell-fly', name: 'Dumbbell Fly', muscleGroup: 'chest', isCustom: false },
	{ id: 'push-up', name: 'Push-Up', muscleGroup: 'chest', isCustom: false },
	// Back
	{ id: 'pull-up', name: 'Pull-Up', muscleGroup: 'back', isCustom: false },
	{ id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'back', isCustom: false },
	{ id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', isCustom: false },
	{ id: 'seated-row', name: 'Seated Row', muscleGroup: 'back', isCustom: false },
	// Shoulders
	{ id: 'overhead-press', name: 'Overhead Press', muscleGroup: 'shoulders', isCustom: false },
	{ id: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'shoulders', isCustom: false },
	{ id: 'front-raise', name: 'Front Raise', muscleGroup: 'shoulders', isCustom: false },
	// Biceps
	{ id: 'barbell-curl', name: 'Barbell Curl', muscleGroup: 'biceps', isCustom: false },
	{ id: 'dumbbell-curl', name: 'Dumbbell Curl', muscleGroup: 'biceps', isCustom: false },
	{ id: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'biceps', isCustom: false },
	// Triceps
	{ id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'triceps', isCustom: false },
	{ id: 'skull-crusher', name: 'Skull Crusher', muscleGroup: 'triceps', isCustom: false },
	{ id: 'dips', name: 'Dips', muscleGroup: 'triceps', isCustom: false },
	// Legs
	{ id: 'squat', name: 'Squat', muscleGroup: 'legs', isCustom: false },
	{ id: 'deadlift', name: 'Deadlift', muscleGroup: 'legs', isCustom: false },
	{ id: 'leg-press', name: 'Leg Press', muscleGroup: 'legs', isCustom: false },
	{ id: 'leg-curl', name: 'Leg Curl', muscleGroup: 'legs', isCustom: false },
	{ id: 'calf-raise', name: 'Calf Raise', muscleGroup: 'legs', isCustom: false },
	// Core
	{ id: 'plank', name: 'Plank', muscleGroup: 'core', isCustom: false },
	{ id: 'crunch', name: 'Crunch', muscleGroup: 'core', isCustom: false },
	{ id: 'leg-raise', name: 'Leg Raise', muscleGroup: 'core', isCustom: false },
	// Full Body
	{ id: 'clean-and-press', name: 'Clean and Press', muscleGroup: 'fullBody', isCustom: false },
	{ id: 'kettlebell-swing', name: 'Kettlebell Swing', muscleGroup: 'fullBody', isCustom: false }
];
