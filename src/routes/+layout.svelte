<script lang="ts">
	import { page } from '$app/state';
	import '$lib/app.css';
	import BottomNav from '$lib/shared/components/BottomNav.svelte';
	import FontScaleControl from '$lib/features/settings/components/FontScaleControl.svelte';
	import { settingsStore } from '$lib/features/settings/settingsStore.svelte.js';
	import { exerciseStore } from '$lib/features/exercises/exerciseStore.svelte.js';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	// Load persisted settings and custom exercises on startup
	$effect(() => {
		settingsStore.load().catch(() => {
			// First launch or backend unavailable — defaults are fine
		});
		exerciseStore.loadCustomExercises().catch(() => {});
	});

	// Persist settings whenever font scale or weight unit changes
	$effect(() => {
		const { fontScale, weightUnit, lastExerciseId } = settingsStore;
		// Accessing reactive values registers them as dependencies
		void fontScale;
		void weightUnit;
		void lastExerciseId;
		settingsStore.persist().catch(() => {});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen flex-col bg-[#0a0a0a] text-white">
	<!-- Top bar -->
	<header class="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-2">
		<span class="text-sm font-medium text-zinc-400">Rep Counter</span>
		<FontScaleControl
			fontScale={settingsStore.fontScale}
			onDecrease={() => settingsStore.decrease()}
			onIncrease={() => settingsStore.increase()}
		/>
	</header>

	<!-- Scrollable content area -->
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>

	<!-- Bottom navigation -->
	<BottomNav currentPath={page.url.pathname} />
</div>
