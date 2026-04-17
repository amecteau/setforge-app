<script lang="ts">
	import type { FontScale } from '$lib/shared/types/settings.js';

	let {
		fontScale,
		onDecrease,
		onIncrease
	}: {
		fontScale: FontScale;
		onDecrease: () => void;
		onIncrease: () => void;
	} = $props();

	const atMin = $derived(fontScale === 'small');
	const atMax = $derived(fontScale === 'extraLarge');
</script>

<div class="flex items-center gap-1">
	<button
		onclick={onDecrease}
		disabled={atMin}
		aria-label="Decrease font size"
		class="flex h-11 w-11 items-center justify-center rounded text-sm text-zinc-400 hover:text-white disabled:opacity-30"
	>
		A−
	</button>
	<button
		onclick={onIncrease}
		disabled={atMax}
		aria-label="Increase font size"
		class="flex h-11 w-11 items-center justify-center rounded text-sm text-zinc-400 hover:text-white disabled:opacity-30"
	>
		A+
	</button>
</div>
