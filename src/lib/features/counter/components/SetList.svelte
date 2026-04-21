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

	const grouped = $derived.by(() => {
		const order: string[] = [];
		const map = new Map<string, { set: WorkoutSet; flatIndex: number }[]>();
		for (let i = 0; i < sets.length; i++) {
			const s = sets[i];
			if (!map.has(s.exerciseId)) {
				order.push(s.exerciseId);
				map.set(s.exerciseId, []);
			}
			map.get(s.exerciseId)!.push({ set: s, flatIndex: i });
		}
		return order.map((id) => ({ exerciseId: id, items: map.get(id)! }));
	});
</script>

<style>
	@reference "tailwindcss";
	.set-row {
		@apply flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-300;
	}
	.undo-btn {
		@apply ml-3 flex min-h-[2.75rem] min-w-[3rem] items-center justify-center rounded px-3 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-white active:bg-zinc-700;
	}
	.group-heading {
		@apply text-xs font-semibold uppercase tracking-wider text-zinc-500;
	}
</style>

{#if sets.length > 0}
	<section aria-label="Previous sets" class="flex flex-col gap-3">
		<h2 class="text-xs font-medium uppercase tracking-wider text-zinc-500">Previous Sets</h2>
		{#each grouped as group (group.exerciseId)}
			<div class="flex flex-col gap-1">
				<h3 class="group-heading px-1">{getExerciseName(group.exerciseId)}</h3>
				<ol class="flex flex-col gap-1">
					{#each group.items as { set, flatIndex }, i (set.id)}
						<li class="set-row">
							<span>
								<span class="text-zinc-500">Set {i + 1}:</span>
								{set.reps} reps @ {formatWeight(set)}
							</span>
							<button
								onclick={() => onUndo(flatIndex)}
								aria-label={`Undo set ${i + 1}`}
								class="undo-btn"
							>
								Undo
							</button>
						</li>
					{/each}
				</ol>
			</div>
		{/each}
	</section>
{/if}
