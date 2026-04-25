<script lang="ts">
	import type { Workout } from '$lib/shared/types/workout.js';
	import type { Exercise } from '$lib/shared/types/exercise.js';
	import WorkoutDetail from './WorkoutDetail.svelte';
	import ConfirmDialog from '$lib/shared/components/ConfirmDialog.svelte';
	import SwipeToReveal from '$lib/shared/components/SwipeToReveal.svelte';

	let {
		workout,
		exercises,
		expanded,
		onToggle,
		onDelete
	}: {
		workout: Workout;
		exercises: Exercise[];
		expanded: boolean;
		onToggle: () => void;
		onDelete: () => void | Promise<void>;
	} = $props();

	let showConfirm = $state(false);

	// Compute per-exercise set counts, preserving order of first appearance
	const summaries = $derived.by(() => {
		const order: string[] = [];
		const map = new Map<string, number>();
		for (const set of workout.sets) {
			if (!map.has(set.exerciseId)) {
				order.push(set.exerciseId);
				map.set(set.exerciseId, 0);
			}
			map.set(set.exerciseId, (map.get(set.exerciseId) ?? 0) + 1);
		}
		return order.map((id) => ({
			name: exercises.find((e) => e.id === id)?.name ?? id,
			setCount: map.get(id)!
		}));
	});

	const exerciseCount = $derived(summaries.length);
	const setCount = $derived(workout.sets.length);

	function formatDate(dateStr: string): string {
		const today = new Date().toISOString().slice(0, 10);
		const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
		// Use noon to avoid timezone edge cases
		const d = new Date(dateStr + 'T12:00:00');
		const formatted = d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
		if (dateStr === today) return `Today, ${formatted}`;
		if (dateStr === yesterday) return `Yesterday, ${formatted}`;
		return formatted;
	}

	const dateLabel = $derived(formatDate(workout.date));
	const confirmMessage = $derived(`Delete workout from ${dateLabel}?`);
</script>

<SwipeToReveal actionLabel="Delete" onAction={() => (showConfirm = true)}>
	<article class="rounded-xl bg-zinc-900 p-4">
		<button onclick={onToggle} aria-expanded={expanded} class="w-full text-left">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<p class="font-semibold text-white">{dateLabel}</p>
					<p class="mt-0.5 text-xs text-zinc-500">
						{exerciseCount} exercise{exerciseCount === 1 ? '' : 's'} · {setCount} set{setCount ===
						1
							? ''
							: 's'}
					</p>
					{#if !expanded}
						<ul class="mt-2 flex flex-col gap-0.5" aria-label="Exercise summary">
							{#each summaries as s (s.name)}
								<li class="text-sm text-zinc-400">{s.name}: {s.setCount}×</li>
							{/each}
						</ul>
					{/if}
				</div>
				<span aria-hidden="true" class="mt-0.5 text-zinc-500">{expanded ? '▲' : '▼'}</span>
			</div>
		</button>

		{#if expanded}
			<WorkoutDetail {workout} {exercises} />
		{/if}
	</article>
</SwipeToReveal>

{#if showConfirm}
	<ConfirmDialog
		message={confirmMessage}
		confirmLabel="Delete"
		onConfirm={async () => {
			showConfirm = false;
			await onDelete();
		}}
		onCancel={() => (showConfirm = false)}
	/>
{/if}
