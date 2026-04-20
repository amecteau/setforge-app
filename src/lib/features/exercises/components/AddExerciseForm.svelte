<script lang="ts">
	import type { MuscleGroup } from '$lib/shared/types/exercise.js';

	let {
		onSave,
		onCancel,
		externalError = null
	}: {
		onSave: (name: string, muscleGroup: MuscleGroup) => void;
		onCancel: () => void;
		externalError?: string | null;
	} = $props();

	const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
		{ value: 'chest', label: 'Chest' },
		{ value: 'back', label: 'Back' },
		{ value: 'shoulders', label: 'Shoulders' },
		{ value: 'biceps', label: 'Biceps' },
		{ value: 'triceps', label: 'Triceps' },
		{ value: 'legs', label: 'Legs' },
		{ value: 'core', label: 'Core' },
		{ value: 'fullBody', label: 'Full Body' }
	];

	let name = $state('');
	let muscleGroup = $state<MuscleGroup>('chest');
	let internalError = $state<string | null>(null);

	const displayError = $derived(internalError ?? externalError);

	function handleSave() {
		const trimmed = name.trim();
		if (!trimmed) {
			internalError = 'Name is required';
			return;
		}
		if (trimmed.length > 50) {
			internalError = 'Name must be 50 characters or fewer';
			return;
		}
		internalError = null;
		onSave(trimmed, muscleGroup);
	}
</script>

<style>
	@reference "tailwindcss";
	.form-input {
		@apply h-11 w-full rounded-lg bg-zinc-900 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500;
	}
	.btn-cancel {
		@apply flex-1 rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300;
	}
	.btn-save {
		@apply flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white;
	}
</style>

<div class="rounded-xl bg-zinc-800 p-4">
	<div class="flex flex-col gap-3">
		<div>
			<label for="exercise-name" class="mb-1 block text-xs font-medium text-zinc-400">
				Exercise Name
			</label>
			<input
				id="exercise-name"
				type="text"
				bind:value={name}
				placeholder="e.g. Cable Fly"
				maxlength={50}
				class="form-input"
			/>
		</div>
		<div>
			<label for="muscle-group" class="mb-1 block text-xs font-medium text-zinc-400">
				Muscle Group
			</label>
			<select id="muscle-group" bind:value={muscleGroup} class="form-input">
				{#each MUSCLE_GROUPS as g (g.value)}
					<option value={g.value}>{g.label}</option>
				{/each}
			</select>
		</div>
		{#if displayError}
			<p role="alert" class="text-xs text-red-400">{displayError}</p>
		{/if}
		<div class="flex gap-3">
			<button onclick={onCancel} class="btn-cancel">Cancel</button>
			<button onclick={handleSave} class="btn-save">Save</button>
		</div>
	</div>
</div>
