<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		actionLabel,
		onAction,
		children
	}: {
		actionLabel: string;
		onAction: () => void;
		children?: Snippet;
	} = $props();

	const ACTION_WIDTH = 80;
	const THRESHOLD = 50;

	let revealed = $state(false);
	let dragging = $state(false);
	let keyboardRevealed = $state(false);
	let startX = 0;
	let currentX = $state(0);

	const effectiveTranslateX = $derived(keyboardRevealed ? -ACTION_WIDTH : currentX);

	function onPointerDown(e: PointerEvent) {
		startX = e.clientX;
		dragging = true;
		(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		const dx = e.clientX - startX;
		if (dx < 0) {
			currentX = Math.max(dx, -ACTION_WIDTH);
		} else if (revealed) {
			currentX = Math.min(0, -ACTION_WIDTH + dx);
		}
	}

	function onPointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		const dx = e.clientX - startX;
		if (!revealed && dx < -THRESHOLD) {
			revealed = true;
			currentX = -ACTION_WIDTH;
		} else if (revealed && dx > THRESHOLD) {
			revealed = false;
			currentX = 0;
		} else {
			currentX = revealed ? -ACTION_WIDTH : 0;
		}
	}

	function handleAction() {
		revealed = false;
		currentX = 0;
		onAction();
	}
</script>

<div class="relative overflow-hidden">
	<!-- Action button revealed behind the content -->
	<div
		class="absolute inset-y-0 right-0 flex items-center justify-center bg-red-600"
		style="width: {ACTION_WIDTH}px"
	>
		<button
			onclick={handleAction}
			onfocus={() => { keyboardRevealed = true; }}
			onblur={() => { keyboardRevealed = false; }}
			aria-label={actionLabel}
			class="h-full w-full text-sm font-semibold text-white"
		>
			{actionLabel}
		</button>
	</div>

	<!-- Swipeable content layer -->
	<div
		role="presentation"
		style="transform: translateX({effectiveTranslateX}px); transition: {dragging
			? 'none'
			: 'transform 0.2s ease-out'}"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={() => {
			dragging = false;
			currentX = revealed ? -ACTION_WIDTH : 0;
		}}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
