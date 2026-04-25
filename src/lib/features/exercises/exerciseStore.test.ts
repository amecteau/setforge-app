import { describe, it, expect, vi } from "vitest";

vi.mock("./exercise.service.js", () => ({
  saveCustomExercise: vi.fn().mockResolvedValue(undefined),
  getCustomExercises: vi.fn().mockResolvedValue([]),
  deleteCustomExercise: vi.fn().mockResolvedValue(undefined),
}));

import { createExerciseStore } from "./exerciseStore.svelte.js";
import { DEFAULT_EXERCISES } from "./defaultExercises.js";
import type { Exercise } from "$lib/shared/types/exercise.js";

const customExercise: Exercise = {
  id: "custom-1",
  name: "Cable Crunch",
  muscleGroup: "core",
  isCustom: true,
};

describe("exerciseStore", () => {
  it("contains all default exercises", () => {
    const store = createExerciseStore();
    expect(store.allExercises.length).toBe(DEFAULT_EXERCISES.length);
  });

  it("exercises returns all by default (no filter)", () => {
    const store = createExerciseStore();
    expect(store.exercises.length).toBe(DEFAULT_EXERCISES.length);
  });

  it("setSearchQuery filters by name", () => {
    const store = createExerciseStore();
    store.setSearchQuery("bench");
    const results = store.exercises;
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((e) => e.name.toLowerCase().includes("bench"))).toBe(
      true,
    );
  });

  it("setSearchQuery filters by muscle group", () => {
    const store = createExerciseStore();
    store.setSearchQuery("chest");
    const results = store.exercises;
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((e) => e.muscleGroup === "chest")).toBe(true);
  });

  it("clearing searchQuery restores all exercises", () => {
    const store = createExerciseStore();
    store.setSearchQuery("bench");
    store.setSearchQuery("");
    expect(store.exercises.length).toBe(DEFAULT_EXERCISES.length);
  });

  it("getById returns the correct exercise", () => {
    const store = createExerciseStore();
    const found = store.getById("bench-press");
    expect(found?.name).toBe("Bench Press");
  });

  it("getById returns null for unknown id", () => {
    const store = createExerciseStore();
    expect(store.getById("does-not-exist")).toBeNull();
  });

  it("addCustom includes the new exercise", async () => {
    const store = createExerciseStore();
    await store.addCustom(customExercise);
    expect(store.allExercises.some((e) => e.id === "custom-1")).toBe(true);
  });

  it("addCustom exercise appears in filtered results when matching query", async () => {
    const store = createExerciseStore();
    await store.addCustom(customExercise);
    store.setSearchQuery("cable");
    expect(store.exercises.some((e) => e.id === "custom-1")).toBe(true);
  });

  it("removeCustom removes the exercise and returns success", async () => {
    const store = createExerciseStore();
    await store.addCustom(customExercise);
    const result = await store.removeCustom("custom-1");
    expect(result.success).toBe(true);
    expect(store.allExercises.some((e) => e.id === "custom-1")).toBe(false);
  });

  it("removeCustom returns error and does not remove exercise when service throws", async () => {
    const { deleteCustomExercise } = await import("./exercise.service.js");
    vi.mocked(deleteCustomExercise).mockRejectedValueOnce(
      new Error("Cannot delete: this exercise is used in your workout history"),
    );
    const store = createExerciseStore();
    await store.addCustom(customExercise);
    const result = await store.removeCustom("custom-1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Cannot delete");
    expect(store.allExercises.some((e) => e.id === "custom-1")).toBe(true);
  });

  it("removeCustom uses fallback message when service throws a non-Error value", async () => {
    const { deleteCustomExercise } = await import("./exercise.service.js");
    vi.mocked(deleteCustomExercise).mockRejectedValueOnce("string rejection");
    const store = createExerciseStore();
    await store.addCustom(customExercise);
    const result = await store.removeCustom("custom-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to delete, exercise in use");
    expect(store.allExercises.some((e) => e.id === "custom-1")).toBe(true);
  });

  it("removeCustom calls service with the correct id", async () => {
    const { deleteCustomExercise } = await import("./exercise.service.js");
    const store = createExerciseStore();
    await store.addCustom(customExercise);
    await store.removeCustom("custom-1");
    expect(deleteCustomExercise).toHaveBeenCalledWith("custom-1");
  });

  it("getByMuscleGroup returns only that group", () => {
    const store = createExerciseStore();
    const chestExercises = store.getByMuscleGroup("chest");
    expect(chestExercises.length).toBeGreaterThan(0);
    expect(chestExercises.every((e) => e.muscleGroup === "chest")).toBe(true);
  });

  it("allExercises are sorted alphabetically by name", () => {
    const store = createExerciseStore();
    const names = store.allExercises.map((e) => e.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("custom exercises sort alphabetically with defaults after being added", async () => {
    const store = createExerciseStore();
    await store.addCustom(customExercise);
    const names = store.allExercises.map((e) => e.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("getByMuscleGroup returns exercises sorted alphabetically", async () => {
    const zFirst: Exercise = {
      id: "z-core",
      name: "Z Core Move",
      muscleGroup: "core",
      isCustom: true,
    };
    const aFirst: Exercise = {
      id: "a-core",
      name: "A Core Move",
      muscleGroup: "core",
      isCustom: true,
    };
    const store = createExerciseStore();
    await store.addCustom(zFirst);
    await store.addCustom(aFirst);
    const coreExercises = store.getByMuscleGroup("core");
    const names = coreExercises.map((e) => e.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
});
