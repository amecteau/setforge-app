<script lang="ts">
	let {
		repCount,
		setNumber = 1,
		onIncrement,
		onDecrement
	}: {
		repCount: number;
		setNumber?: number;
		onIncrement: () => void;
		onDecrement: () => void;
	} = $props();

	let pulsing = $state(false);

	function handleIncrement() {
		onIncrement();
		// Restart animation so rapid taps re-trigger it each time
		pulsing = false;
		requestAnimationFrame(() => {
			pulsing = true;
			setTimeout(() => {
				pulsing = false;
			}, 200);
		});
	}
</script>

<!-- Visually hidden live region announces rep count changes to screen readers -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
	{repCount} reps
</div>

<div class="flex flex-col gap-3 rounded-2xl bg-zinc-900 p-4">
	<div class="flex items-center justify-between">
		<span class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Reps</span>
		<span class="text-xs text-zinc-500">Set {setNumber}</span>
	</div>

	<!-- Giant tap area — the primary counting input -->
	<button onclick={handleIncrement} aria-label="Tap to count" class="tap-area focus-ring">
		<span aria-hidden="true" class="rep-count {pulsing ? 'rep-pulse' : ''}">
			{repCount}
		</span>
	</button>

	<!-- +/− buttons inside the card -->
	<div class="flex items-center justify-between px-4">
		<button onclick={onDecrement} aria-label="Decrement" class="round-btn neutral focus-ring">
			−
		</button>
		<button onclick={handleIncrement} aria-label="Increment" class="round-btn primary focus-ring">
			+
		</button>
	</div>
</div>

<style>
	@reference "tailwindcss";
	.tap-area {
		@apply flex min-h-[8rem] w-full items-center justify-center rounded-xl active:bg-zinc-800;
	}
	.rep-count {
		@apply text-[5.5rem] font-bold leading-none text-blue-400;
	}
	.round-btn {
		@apply flex h-14 w-14 items-center justify-center rounded-full text-2xl font-light text-white;
	}
	.round-btn.neutral {
		@apply bg-zinc-800 active:bg-zinc-700;
	}
	.round-btn.primary {
		@apply bg-blue-600 active:bg-blue-700;
	}
</style>
