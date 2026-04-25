<script lang="ts">
  import { exerciseStore } from "$lib/features/exercises/exerciseStore.svelte.js";
  import { counterStore } from "$lib/features/counter/counterStore.svelte.js";
  import ExerciseList from "$lib/features/exercises/components/ExerciseList.svelte";
  import AddExerciseForm from "$lib/features/exercises/components/AddExerciseForm.svelte";
  import { goto } from "$app/navigation";
  import type { Exercise, MuscleGroup } from "$lib/shared/types/exercise.js";

  let showAddForm = $state(false);
  let nameError = $state<string | null>(null);
  let deleteError = $state<string | null>(null);

  $effect(() => {
    exerciseStore.loadCustomExercises();
  });

  async function handleSave(name: string, muscleGroup: MuscleGroup) {
    const exists = exerciseStore.allExercises.some(
      (e) => e.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      nameError = "An exercise with this name already exists";
      return;
    }
    nameError = null;
    await exerciseStore.addCustom({
      id: crypto.randomUUID(),
      name,
      muscleGroup,
      isCustom: true,
    });
    showAddForm = false;
  }

  async function handleDeleteCustom(id: string): Promise<void> {
    const result = await exerciseStore.removeCustom(id);
    if (!result.success) {
      deleteError = result.error ?? "Failed to delete, exercise in use";
      setTimeout(() => {
        deleteError = null;
      }, 3000);
    }
  }

  function handleSelect(exercise: Exercise) {
    if (counterStore.workout) {
      counterStore.setExercise(exercise);
    }
    goto("/");
  }
</script>

<div class="flex flex-col gap-4 p-4">
  <!-- Search bar -->
  <input
    type="search"
    placeholder="Search exercises..."
    value={exerciseStore.searchQuery}
    oninput={(e) =>
      exerciseStore.setSearchQuery((e.target as HTMLInputElement).value)}
    aria-label="Search exercises"
    class="h-11 w-full rounded-lg bg-zinc-800 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  <!-- Grouped exercise list -->
  <ExerciseList
    exercises={exerciseStore.exercises}
    onSelect={handleSelect}
    onDeleteCustom={handleDeleteCustom}
  />

  {#if deleteError}
    <p role="alert" class="text-center text-sm text-red-400">{deleteError}</p>
  {/if}

  <!-- Add custom exercise -->
  {#if showAddForm}
    <AddExerciseForm
      onSave={handleSave}
      onCancel={() => {
        showAddForm = false;
        nameError = null;
      }}
      externalError={nameError}
    />
  {:else}
    <button
      onclick={() => (showAddForm = true)}
      class="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 text-sm text-zinc-400 active:bg-zinc-800"
    >
      + Add Custom Exercise
    </button>
  {/if}
</div>
