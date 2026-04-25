<script lang="ts">
	import { historyStore } from '$lib/features/history/historyStore.svelte.js';
	import { exerciseStore } from '$lib/features/exercises/exerciseStore.svelte.js';
	import WorkoutCard from '$lib/features/history/components/WorkoutCard.svelte';

	let deleteError = $state<string | null>(null);

	$effect(() => {
		historyStore.load();
		exerciseStore.loadCustomExercises();
	});

	async function handleDelete(id: string): Promise<void> {
		const result = await historyStore.deleteWorkout(id);
		if (!result.success) {
			deleteError = result.error ?? 'Failed to delete workout';
			setTimeout(() => {
				deleteError = null;
			}, 3000);
		}
	}
</script>

{#if historyStore.workouts.length === 0}
	<div class="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
		<p class="text-4xl" aria-hidden="true">🏋️</p>
		<p class="font-medium text-white">No workouts yet</p>
		<p class="text-sm text-zinc-500">Start your first workout from the Counter tab</p>
	</div>
{:else}
	<div class="flex flex-col gap-3 p-4">
		{#each historyStore.workouts as workout (workout.id)}
			<WorkoutCard
				{workout}
				exercises={exerciseStore.allExercises}
				expanded={historyStore.expandedId === workout.id}
				onToggle={() => historyStore.toggleExpand(workout.id)}
				onDelete={() => handleDelete(workout.id)}
			/>
		{/each}
	</div>

	{#if deleteError}
		<p role="alert" class="px-4 text-center text-sm text-red-400">{deleteError}</p>
	{/if}
{/if}
