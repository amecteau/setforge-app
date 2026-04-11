import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SetList from './SetList.svelte';
import type { WorkoutSet } from '$lib/shared/types/workout.js';
import type { Exercise } from '$lib/shared/types/exercise.js';

const exercises: Exercise[] = [
	{ id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', isCustom: false }
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

	it('calls onUndo with the set index when Undo is clicked', async () => {
		const user = userEvent.setup();
		const onUndo = vi.fn();
		render(SetList, { sets, exercises, onUndo });
		await user.click(screen.getByRole('button', { name: /undo set 1/i }));
		expect(onUndo).toHaveBeenCalledWith(0);
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
});
