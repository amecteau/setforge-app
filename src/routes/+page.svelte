<script lang="ts">
	import { counterStore } from '$lib/features/counter/counterStore.svelte.js';
	import { exerciseStore } from '$lib/features/exercises/exerciseStore.svelte.js';
	import { settingsStore } from '$lib/features/settings/settingsStore.svelte.js';
	import { getIncompleteWorkout } from '$lib/features/counter/counter.service.js';
	import RepCounter from '$lib/features/counter/components/RepCounter.svelte';
	import WeightInput from '$lib/features/counter/components/WeightInput.svelte';
	import SetList from '$lib/features/counter/components/SetList.svelte';
	import ExercisePicker from '$lib/features/exercises/components/ExercisePicker.svelte';
	import type { Workout } from '$lib/shared/types/workout.js';
	import { createKeyboardHandler } from '$lib/features/counter/keyboardShortcuts.js';
	import { focusTrap } from '$lib/shared/utils/focusTrap.js';

	let showPicker = $state(false);
	let saveError = $state<string | null>(null);
	let showDiscardDialog = $state(false);
	let resumeWorkout = $state<Workout | null>(null);
	let savedFlash = $state(false);

	// On mount: check for an incomplete workout to resume
	$effect(() => {
		getIncompleteWorkout()
			.then((w) => {
				if (w && !counterStore.workout) {
					resumeWorkout = w;
				}
			})
			.catch(() => {});
	});

	// Keyboard shortcuts — active only when a workout is running
	$effect(() => {
		if (!counterStore.workout) return;

		const handleKeydown = createKeyboardHandler({
			increment: () => counterStore.increment(),
			decrement: () => counterStore.decrement(),
			saveSet: handleSaveSet,
			isPickerOpen: () => showPicker,
			isDialogOpen: () => showDiscardDialog
		});

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	async function handleSaveSet() {
		const result = await counterStore.saveSet();
		if (!result.success) {
			saveError = result.error ?? 'Error saving set';
			setTimeout(() => {
				saveError = null;
			}, 2000);
		} else {
			// Brief green flash on the save button
			savedFlash = true;
			setTimeout(() => {
				savedFlash = false;
			}, 500);
			// Persist last-used exercise
			if (counterStore.currentExercise) {
				settingsStore.setLastExerciseId(counterStore.currentExercise.id);
			}
		}
	}

	async function handleFinishWorkout() {
		const result = await counterStore.finishWorkout();
		if (!result.success) {
			showDiscardDialog = true;
		}
	}

	function handleSelectExercise(exercise: import('$lib/shared/types/exercise.js').Exercise) {
		counterStore.setExercise(exercise);
		exerciseStore.setSearchQuery('');
		showPicker = false;
	}

	function handlePickerCancel() {
		exerciseStore.setSearchQuery('');
		showPicker = false;
	}
</script>

<!-- Resume prompt -->
{#if resumeWorkout && !counterStore.workout}
	<div
		role="alertdialog"
		aria-label="Resume workout"
		aria-modal="true"
		use:focusTrap
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
	>
		<div class="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 text-center">
			<p class="mb-2 font-semibold text-white">Resume today's workout?</p>
			<p class="mb-6 text-sm text-zinc-400">
				You have {resumeWorkout.sets.length} saved set{resumeWorkout.sets.length === 1
					? ''
					: 's'} from an earlier session.
			</p>
			<div class="flex gap-3">
				<button
					onclick={() => {
						counterStore.discardWorkout();
						resumeWorkout = null;
					}}
					class="flex-1 rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300 active:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
				>
					Start Fresh
				</button>
				<button
					onclick={() => {
						if (resumeWorkout) {
							counterStore.resumeWorkout({
								id: resumeWorkout.id,
								startedAt: resumeWorkout.date,
								sets: resumeWorkout.sets
							});
						}
						resumeWorkout = null;
					}}
					class="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white active:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
				>
					Resume
				</button>
			</div>
		</div>
	</div>
{:else if !counterStore.workout}
	<!-- No active workout state -->
	<div class="flex h-full flex-col items-center justify-center gap-4 p-8">
		<p class="text-zinc-500">Ready to train?</p>
		<button
			onclick={() => counterStore.startWorkout()}
			class="w-full max-w-xs rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white active:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			Start Workout
		</button>
	</div>
{:else}
	<!-- Active workout -->
	<div class="flex flex-col gap-4 p-4">
		<!-- Exercise selector -->
		<button
			onclick={() => (showPicker = true)}
			aria-label="Select exercise"
			aria-haspopup="dialog"
			class="flex h-14 w-full items-center justify-between rounded-xl bg-zinc-900 px-4 text-left active:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			<span class="truncate font-medium text-white">
				{counterStore.currentExercise?.name ?? 'Select Exercise'}
			</span>
			<span aria-hidden="true" class="ml-2 text-zinc-500">▼</span>
		</button>

		<!-- Weight input -->
		<WeightInput
			weight={counterStore.weight}
			unit={counterStore.weightUnit}
			onWeightChange={(w) => counterStore.setWeight(w)}
			onUnitChange={(u) => counterStore.setUnit(u)}
			onAdjust={(d) => counterStore.adjustWeight(d)}
		/>

		<!-- Set indicator -->
		<p class="text-center text-sm text-zinc-500">
			Set {counterStore.setNumber}
		</p>

		<!-- Rep counter (main interaction) -->
		<RepCounter
			repCount={counterStore.repCount}
			onIncrement={() => counterStore.increment()}
			onDecrement={() => counterStore.decrement()}
		/>

		<!-- Inline error message -->
		{#if saveError}
			<p role="alert" class="text-center text-sm text-red-400">{saveError}</p>
		{/if}

		<!-- Save set button — flashes green for 500ms on success -->
		<button
			onclick={handleSaveSet}
			class="w-full rounded-2xl py-4 text-lg font-semibold text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 {savedFlash
				? 'bg-green-600'
				: 'bg-blue-600 active:bg-blue-700'}"
		>
			{savedFlash ? 'Saved ✓' : 'Save Set ✓'}
		</button>

		<!-- Previous sets list -->
		<SetList
			sets={counterStore.sets}
			exercises={exerciseStore.allExercises}
			onUndo={() => counterStore.undoLastSet()}
		/>

		<!-- Finish workout button -->
		<button
			onclick={handleFinishWorkout}
			class="w-full rounded-2xl border border-zinc-700 py-3 text-sm font-medium text-zinc-400 active:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			Finish Workout 🏁
		</button>
	</div>

	<!-- Discard confirmation dialog -->
	{#if showDiscardDialog}
		<div
			role="dialog"
			aria-label="No sets recorded"
			aria-modal="true"
			use:focusTrap={{ onEscape: () => { showDiscardDialog = false; } }}
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
		>
			<div class="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 text-center">
				<p class="mb-6 text-zinc-300">No sets recorded. Discard workout?</p>
				<div class="flex gap-3">
					<button
						onclick={() => (showDiscardDialog = false)}
						class="flex-1 rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300 active:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
					>
						Keep Going
					</button>
					<button
						onclick={async () => {
							await counterStore.discardWorkout();
							showDiscardDialog = false;
						}}
						class="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white active:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
					>
						Discard
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}

<!-- Exercise picker overlay -->
{#if showPicker}
	<ExercisePicker
		exercises={exerciseStore.exercises}
		searchQuery={exerciseStore.searchQuery}
		onSelect={handleSelectExercise}
		onSearch={(q) => exerciseStore.setSearchQuery(q)}
		onCancel={handlePickerCancel}
	/>
{/if}
