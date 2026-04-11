import type { FontScale } from '$lib/shared/types/settings.js';
import type { WeightUnit } from '$lib/shared/types/workout.js';
import { FONT_SCALE_VALUES } from '$lib/shared/types/settings.js';

const SCALES: FontScale[] = ['small', 'medium', 'large', 'extraLarge'];

export function createSettingsStore() {
	let fontScale = $state<FontScale>('medium');
	let weightUnit = $state<WeightUnit>('lb');
	let lastExerciseId = $state<string | null>(null);

	return {
		get fontScale() {
			return fontScale;
		},
		get weightUnit() {
			return weightUnit;
		},
		get lastExerciseId() {
			return lastExerciseId;
		},

		setFontScale(scale: FontScale) {
			fontScale = scale;
			if (typeof document !== 'undefined') {
				document.documentElement.style.fontSize = `${FONT_SCALE_VALUES[scale]}px`;
			}
		},

		increase() {
			const idx = SCALES.indexOf(fontScale);
			if (idx < SCALES.length - 1) this.setFontScale(SCALES[idx + 1]);
		},

		decrease() {
			const idx = SCALES.indexOf(fontScale);
			if (idx > 0) this.setFontScale(SCALES[idx - 1]);
		},

		setWeightUnit(unit: WeightUnit) {
			weightUnit = unit;
		},

		setLastExerciseId(id: string | null) {
			lastExerciseId = id;
		}
	};
}

export const settingsStore = createSettingsStore();
