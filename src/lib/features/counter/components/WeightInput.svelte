<script lang="ts">
	import type { WeightUnit } from '$lib/shared/types/workout.js';

	let {
		weight,
		unit,
		onWeightChange,
		onUnitChange,
		onAdjust
	}: {
		weight: number | null;
		unit: WeightUnit;
		onWeightChange: (w: number | null) => void;
		onUnitChange: (u: WeightUnit) => void;
		onAdjust: (delta: number) => void;
	} = $props();

	const step = $derived(unit === 'lb' ? 5 : 2.5);

	function handleInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		onWeightChange(val ? parseFloat(val) : null);
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center gap-2">
		<button
			onclick={() => onAdjust(-step)}
			aria-label={`-${step}`}
			class="flex h-12 w-16 items-center justify-center rounded-lg bg-zinc-800 text-sm font-medium text-white active:bg-zinc-700"
		>
			−{step}
		</button>

		<input
			type="text"
			inputmode="decimal"
			value={weight ?? ''}
			oninput={handleInput}
			aria-label="Weight"
			placeholder="Weight"
			class="h-12 flex-1 rounded-lg bg-zinc-800 px-3 text-center text-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>

		<button
			onclick={() => onAdjust(step)}
			aria-label={`+${step}`}
			class="flex h-12 w-16 items-center justify-center rounded-lg bg-zinc-800 text-sm font-medium text-white active:bg-zinc-700"
		>
			+{step}
		</button>
	</div>

	<button
		onclick={() => onUnitChange(unit === 'lb' ? 'kg' : 'lb')}
		aria-label={`Unit: ${unit}, tap to toggle`}
		class="mx-auto flex h-9 items-center gap-1 rounded-full bg-zinc-800 px-4 text-sm text-zinc-300 active:bg-zinc-700"
	>
		{unit} ▾
	</button>
</div>
