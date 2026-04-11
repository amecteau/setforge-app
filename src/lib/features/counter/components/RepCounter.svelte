<script lang="ts">
	let {
		repCount,
		onIncrement,
		onDecrement
	}: {
		repCount: number;
		onIncrement: () => void;
		onDecrement: () => void;
	} = $props();
</script>

<!-- Visually hidden live region announces rep count changes to screen readers -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
	{repCount} reps
</div>

<div class="flex flex-col items-center gap-4">
	<!-- Giant tap area — the primary counting input -->
	<button
		onclick={onIncrement}
		aria-label="Tap to count"
		class="flex min-h-[11rem] w-full items-center justify-center rounded-2xl bg-zinc-900 active:bg-zinc-800"
	>
		<span aria-hidden="true" class="text-[7rem] font-bold leading-none text-blue-400">
			{repCount}
		</span>
	</button>

	<!-- Visible +/− buttons -->
	<div class="flex w-full items-center justify-between px-4">
		<button
			onclick={onDecrement}
			aria-label="Decrement"
			class="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-2xl font-light text-white active:bg-zinc-700"
		>
			−
		</button>
		<button
			onclick={onIncrement}
			aria-label="Increment"
			class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-light text-white active:bg-blue-700"
		>
			+
		</button>
	</div>
</div>
