<script lang="ts">
	import type { WorkoutSet } from '$lib/shared/types/workout.js';
	import type { Exercise } from '$lib/shared/types/exercise.js';

	let {
		sets,
		exercises,
		onUndo
	}: {
		sets: WorkoutSet[];
		exercises: Exercise[];
		onUndo: (index: number) => void;
	} = $props();

	function getExerciseName(exerciseId: string): string {
		return exercises.find((e) => e.id === exerciseId)?.name ?? exerciseId;
	}

	function formatWeight(set: WorkoutSet): string {
		if (set.weight === null) return 'bodyweight';
		return `${set.weight} ${set.unit}`;
	}
</script>

<style>
	@reference "tailwindcss";
	.set-row {
		@apply flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-300;
	}
	.undo-btn {
		@apply ml-3 flex min-h-[2.75rem] min-w-[3rem] items-center justify-center rounded px-3 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-white active:bg-zinc-700;
	}
</style>

{#if sets.length > 0}
	<section aria-label="Previous sets" class="flex flex-col gap-1">
		<h2 class="text-xs font-medium uppercase tracking-wider text-zinc-500">Previous Sets</h2>
		<ol class="flex flex-col gap-1">
			{#each sets as set, i (set.id)}
				<li class="set-row">
					<span>
						<span class="text-zinc-500">Set {i + 1}:</span>
						{set.reps} reps @ {formatWeight(set)}
						<span class="ml-1 text-zinc-600 text-xs">{getExerciseName(set.exerciseId)}</span>
					</span>
					<button onclick={() => onUndo(i)} aria-label={`Undo set ${i + 1}`} class="undo-btn">
						Undo
					</button>
				</li>
			{/each}
		</ol>
	</section>
{/if}
