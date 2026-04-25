import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SetList from './SetList.svelte';
import type { WorkoutSet } from '$lib/shared/types/workout.js';
import type { Exercise } from '$lib/shared/types/exercise.js';

const exercises: Exercise[] = [
	{ id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', isCustom: false },
	{ id: 'squat', name: 'Squat', muscleGroup: 'legs', isCustom: false }
];

const sets: WorkoutSet[] = [
	{
		id: 's1',
		exerciseId: 'bench-press',
		reps: 10,
		weight: 135,
		unit: 'lb',
		timestamp: '2026-04-10T10:00:00Z',
		notes: ''
	},
	{
		id: 's2',
		exerciseId: 'bench-press',
		reps: 8,
		weight: 145,
		unit: 'lb',
		timestamp: '2026-04-10T10:05:00Z',
		notes: ''
	}
];

const mixedSets: WorkoutSet[] = [
	{
		id: 'm1',
		exerciseId: 'bench-press',
		reps: 10,
		weight: 135,
		unit: 'lb',
		timestamp: '2026-04-10T10:00:00Z',
		notes: ''
	},
	{
		id: 'm2',
		exerciseId: 'squat',
		reps: 5,
		weight: 225,
		unit: 'lb',
		timestamp: '2026-04-10T10:05:00Z',
		notes: ''
	},
	{
		id: 'm3',
		exerciseId: 'bench-press',
		reps: 8,
		weight: 145,
		unit: 'lb',
		timestamp: '2026-04-10T10:10:00Z',
		notes: ''
	}
];

describe('SetList', () => {
	it('renders nothing when sets list is empty', () => {
		const { container } = render(SetList, {
			sets: [],
			exercises,
			onUndo: vi.fn()
		});
		expect(container.querySelector('section')).toBeNull();
	});

	it('renders each set with reps and weight', () => {
		render(SetList, { sets, exercises, onUndo: vi.fn() });
		expect(screen.getByText(/10 reps @ 135 lb/)).toBeInTheDocument();
		expect(screen.getByText(/8 reps @ 145 lb/)).toBeInTheDocument();
	});

	it('renders an Undo button for each set', () => {
		render(SetList, { sets, exercises, onUndo: vi.fn() });
		const undoButtons = screen.getAllByRole('button', { name: /undo set/i });
		expect(undoButtons).toHaveLength(2);
	});

	it('calls onUndo with the set id when Undo is clicked', async () => {
		const user = userEvent.setup();
		const onUndo = vi.fn().mockResolvedValue(undefined);
		render(SetList, { sets, exercises, onUndo });
		await user.click(screen.getByRole('button', { name: /undo set 1/i }));
		expect(onUndo).toHaveBeenCalledWith('s1');
	});

	it('shows bodyweight when weight is null', () => {
		const bodyweightSet: WorkoutSet[] = [
			{
				id: 's3',
				exerciseId: 'bench-press',
				reps: 12,
				weight: null,
				unit: 'lb',
				timestamp: '2026-04-10T10:10:00Z',
				notes: ''
			}
		];
		render(SetList, { sets: bodyweightSet, exercises, onUndo: vi.fn() });
		expect(screen.getByText(/bodyweight/i)).toBeInTheDocument();
	});

	it('has a section with accessible label', () => {
		render(SetList, { sets, exercises, onUndo: vi.fn() });
		expect(screen.getByRole('region', { name: /previous sets/i })).toBeInTheDocument();
	});

	it('shows exercise name as a group heading', () => {
		render(SetList, { sets, exercises, onUndo: vi.fn() });
		expect(screen.getByRole('heading', { name: 'Bench Press' })).toBeInTheDocument();
	});

	it('groups sets by exercise with per-exercise set numbering', () => {
		render(SetList, { sets: mixedSets, exercises, onUndo: vi.fn() });
		expect(screen.getByRole('heading', { name: 'Bench Press' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Squat' })).toBeInTheDocument();
	});

	it('numbers sets within each exercise group independently', () => {
		render(SetList, { sets: mixedSets, exercises, onUndo: vi.fn() });
		const undoButtons = screen.getAllByRole('button', { name: /undo set/i });
		// bench press has 2 sets, squat has 1 — both groups start at Set 1
		expect(undoButtons).toHaveLength(3);
	});

	it('calls onUndo with the set id for grouped sets', async () => {
		const user = userEvent.setup();
		const onUndo = vi.fn().mockResolvedValue(undefined);
		render(SetList, { sets: mixedSets, exercises, onUndo });
		const squat = screen.getByRole('heading', { name: 'Squat' });
		const squatSection = squat.closest('div')!;
		const undoBtn = squatSection.querySelector('button')!;
		await user.click(undoBtn);
		expect(onUndo).toHaveBeenCalledWith('m2');
	});

	it('second bench press block shows Set 2 after returning to exercise', () => {
		render(SetList, { sets: mixedSets, exercises, onUndo: vi.fn() });
		// Bench press appears once grouped with both its sets (Set 1 and Set 2)
		const benchHeading = screen.getByRole('heading', { name: 'Bench Press' });
		const benchSection = benchHeading.closest('div')!;
		expect(benchSection.textContent).toContain('Set 1');
		expect(benchSection.textContent).toContain('Set 2');
	});

	it('renders "Unknown Exercise" when exercise id has no match in exercises prop', () => {
		const orphanSet: WorkoutSet[] = [
			{
				id: 'orphan',
				exerciseId: 'deleted-exercise-id',
				reps: 5,
				weight: 100,
				unit: 'lb',
				timestamp: '2026-04-10T10:00:00Z',
				notes: ''
			}
		];
		render(SetList, { sets: orphanSet, exercises, onUndo: vi.fn() });
		expect(screen.getByRole('heading', { name: 'Unknown Exercise' })).toBeInTheDocument();
	});
});
