<script lang="ts">
	let { currentPath }: { currentPath: string } = $props();

	const tabs = [
		{ path: '/', label: 'Counter', symbol: '◉' },
		{ path: '/history', label: 'History', symbol: '⏱' },
		{ path: '/exercises', label: 'Exercises', symbol: '⊞' }
	];
</script>

<nav aria-label="Main navigation" class="border-t border-zinc-800 bg-zinc-950">
	<ul class="flex">
		{#each tabs as tab (tab.path)}
			<li class="flex-1">
				<a
					href={tab.path}
					aria-current={currentPath === tab.path ? 'page' : undefined}
					class="flex min-h-[3rem] flex-col items-center justify-center gap-0.5 py-2 text-xs
						{currentPath === tab.path ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}"
				>
					<span aria-hidden="true" class="text-lg leading-none">{tab.symbol}</span>
					<span>{tab.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
