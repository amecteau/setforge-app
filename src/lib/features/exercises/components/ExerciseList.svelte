<script lang="ts">
	import type { Exercise, MuscleGroup } from '$lib/shared/types/exercise.js';
	import SwipeToReveal from '$lib/shared/components/SwipeToReveal.svelte';
	import ConfirmDialog from '$lib/shared/components/ConfirmDialog.svelte';

	let {
		exercises,
		onSelect,
		onDeleteCustom
	}: {
		exercises: Exercise[];
		onSelect: (exercise: Exercise) => void;
		onDeleteCustom: (id: string) => void;
	} = $props();

	const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
		chest: 'Chest',
		back: 'Back',
		shoulders: 'Shoulders',
		biceps: 'Biceps',
		triceps: 'Triceps',
		legs: 'Legs',
		core: 'Core',
		fullBody: 'Full Body'
	};

	const MUSCLE_GROUP_ORDER: MuscleGroup[] = [
		'chest',
		'back',
		'shoulders',
		'biceps',
		'triceps',
		'legs',
		'core',
		'fullBody'
	];

	const builtIn = $derived(exercises.filter((e) => !e.isCustom));
	const custom = $derived(exercises.filter((e) => e.isCustom));

	const grouped = $derived.by(() => {
		const groups = new Map<MuscleGroup, Exercise[]>(MUSCLE_GROUP_ORDER.map((g) => [g, []]));
		for (const exercise of builtIn) {
			groups.get(exercise.muscleGroup)?.push(exercise);
		}
		return groups;
	});

	let pendingDeleteId = $state<string | null>(null);
	const pendingDeleteName = $derived(
		custom.find((e) => e.id === pendingDeleteId)?.name ?? ''
	);
</script>

<div class="flex flex-col gap-2">
	{#each [...grouped.entries()].filter(([, exs]) => exs.length > 0) as [group, groupExercises] (group)}
		<section>
			<h2 class="section-heading mb-1 px-1">{MUSCLE_GROUP_LABELS[group]}</h2>
			<ul class="flex flex-col gap-1">
				{#each groupExercises as exercise (exercise.id)}
					<li>
						<button onclick={() => onSelect(exercise)} class="exercise-btn">
							{exercise.name}
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	{#if custom.length > 0}
		<section>
			<h2 class="section-heading mb-1 px-1">Custom</h2>
			<ul class="flex flex-col gap-1">
				{#each custom as exercise (exercise.id)}
					<li>
						<SwipeToReveal
							actionLabel="Delete {exercise.name}"
							onAction={() => (pendingDeleteId = exercise.id)}
						>
							<button onclick={() => onSelect(exercise)} class="exercise-btn">
								{exercise.name}
								<span aria-hidden="true" class="custom-icon">✎</span>
								<span class="sr-only">(custom)</span>
							</button>
						</SwipeToReveal>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	@reference "tailwindcss";
	.section-heading {
		@apply text-xs font-semibold uppercase tracking-wider text-zinc-500;
	}
	.exercise-btn {
		@apply flex h-12 w-full items-center rounded-lg bg-zinc-900 px-4 text-left text-sm text-white hover:bg-zinc-800 active:bg-zinc-700;
	}
	.custom-icon {
		@apply ml-2 text-zinc-500;
	}
</style>

{#if pendingDeleteId}
	<ConfirmDialog
		message="Delete {pendingDeleteName}?"
		confirmLabel="Delete"
		onConfirm={() => {
			onDeleteCustom(pendingDeleteId!);
			pendingDeleteId = null;
		}}
		onCancel={() => (pendingDeleteId = null)}
	/>
{/if}
