<script lang="ts">
	import type { Exercise, MuscleGroup } from '$lib/shared/types/exercise.js';
	import { focusTrap } from '$lib/shared/utils/focusTrap.js';

	let {
		exercises,
		searchQuery,
		onSelect,
		onSearch,
		onCancel
	}: {
		exercises: Exercise[];
		searchQuery: string;
		onSelect: (exercise: Exercise) => void;
		onSearch: (query: string) => void;
		onCancel: () => void;
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

	const grouped = $derived.by(() => {
		const groups = new Map<MuscleGroup, Exercise[]>(MUSCLE_GROUP_ORDER.map((g) => [g, []]));
		for (const exercise of exercises) {
			groups.get(exercise.muscleGroup)?.push(exercise);
		}
		return groups;
	});
</script>

<div
	role="dialog"
	aria-label="Select exercise"
	aria-modal="true"
	use:focusTrap={{ onEscape: onCancel }}
	class="fixed inset-0 z-50 flex flex-col bg-zinc-950"
>
	<!-- Search bar -->
	<div class="flex items-center gap-3 border-b border-zinc-800 p-4">
		<input
			type="search"
			placeholder="Search exercises..."
			value={searchQuery}
			oninput={(e) => onSearch((e.target as HTMLInputElement).value)}
			aria-label="Search exercises"
			class="h-11 flex-1 rounded-lg bg-zinc-800 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
		<button
			onclick={onCancel}
			aria-label="Cancel"
			class="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white"
		>
			Cancel
		</button>
	</div>

	<!-- Exercise list -->
	<div class="flex-1 overflow-y-auto p-4">
		{#each [...grouped.entries()].filter(([, exs]) => exs.length > 0) as [group, groupExercises] (group)}
			<section class="mb-4">
				<h3 class="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
					{MUSCLE_GROUP_LABELS[group]}
				</h3>
				<ul class="flex flex-col gap-1">
					{#each groupExercises as exercise (exercise.id)}
						<li>
							<button
								onclick={() => onSelect(exercise)}
								class="flex h-12 w-full items-center rounded-lg bg-zinc-900 px-4 text-left text-sm text-white hover:bg-zinc-800 active:bg-zinc-700"
							>
								{exercise.name}
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</div>
