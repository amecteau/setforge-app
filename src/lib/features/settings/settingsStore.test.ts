import { describe, it, expect, afterEach } from 'vitest';
import { createSettingsStore } from './settingsStore.svelte.js';
import { FONT_SCALE_VALUES } from '$lib/shared/types/settings.js';

afterEach(() => {
	// Reset root font size so tests don't bleed into each other
	document.documentElement.style.fontSize = '';
});

describe('settingsStore', () => {
	it('defaults to medium scale, lb unit, no last exercise', () => {
		const store = createSettingsStore();
		expect(store.fontScale).toBe('medium');
		expect(store.weightUnit).toBe('lb');
		expect(store.lastExerciseId).toBeNull();
	});

	it('setFontScale updates fontScale', () => {
		const store = createSettingsStore();
		store.setFontScale('large');
		expect(store.fontScale).toBe('large');
	});

	it('setFontScale applies the correct px value to document root', () => {
		const store = createSettingsStore();
		store.setFontScale('large');
		expect(document.documentElement.style.fontSize).toBe(`${FONT_SCALE_VALUES.large}px`);
	});

	it('applies correct px for all scale levels', () => {
		const store = createSettingsStore();

		store.setFontScale('small');
		expect(document.documentElement.style.fontSize).toBe('14px');

		store.setFontScale('medium');
		expect(document.documentElement.style.fontSize).toBe('18px');

		store.setFontScale('large');
		expect(document.documentElement.style.fontSize).toBe('24px');

		store.setFontScale('extraLarge');
		expect(document.documentElement.style.fontSize).toBe('32px');
	});

	it('increase() advances to the next scale', () => {
		const store = createSettingsStore();
		store.setFontScale('medium');
		store.increase();
		expect(store.fontScale).toBe('large');
	});

	it('increase() does nothing at extraLarge', () => {
		const store = createSettingsStore();
		store.setFontScale('extraLarge');
		store.increase();
		expect(store.fontScale).toBe('extraLarge');
	});

	it('decrease() goes back to the previous scale', () => {
		const store = createSettingsStore();
		store.setFontScale('large');
		store.decrease();
		expect(store.fontScale).toBe('medium');
	});

	it('decrease() does nothing at small', () => {
		const store = createSettingsStore();
		store.setFontScale('small');
		store.decrease();
		expect(store.fontScale).toBe('small');
	});

	it('setWeightUnit updates unit', () => {
		const store = createSettingsStore();
		store.setWeightUnit('kg');
		expect(store.weightUnit).toBe('kg');
	});

	it('setLastExerciseId updates lastExerciseId', () => {
		const store = createSettingsStore();
		store.setLastExerciseId('bench-press');
		expect(store.lastExerciseId).toBe('bench-press');
		store.setLastExerciseId(null);
		expect(store.lastExerciseId).toBeNull();
	});
});
