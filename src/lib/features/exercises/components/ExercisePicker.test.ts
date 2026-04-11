import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ExercisePicker from './ExercisePicker.svelte';
import type { Exercise } from '$lib/shared/types/exercise.js';

const exercises: Exercise[] = [
	{ id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', isCustom: false },
	{ id: 'squat', name: 'Squat', muscleGroup: 'legs', isCustom: false },
	{ id: 'pull-up', name: 'Pull-Up', muscleGroup: 'back', isCustom: false }
];

describe('ExercisePicker', () => {
	it('renders as a dialog', () => {
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn()
		});
		expect(screen.getByRole('dialog', { name: /select exercise/i })).toBeInTheDocument();
	});

	it('renders a search input', () => {
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn()
		});
		expect(screen.getByRole('searchbox', { name: /search exercises/i })).toBeInTheDocument();
	});

	it('renders all provided exercises', () => {
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn()
		});
		expect(screen.getByRole('button', { name: 'Bench Press' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Squat' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Pull-Up' })).toBeInTheDocument();
	});

	it('calls onSelect with the exercise when clicked', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect,
			onSearch: vi.fn(),
			onCancel: vi.fn()
		});
		await user.click(screen.getByRole('button', { name: 'Bench Press' }));
		expect(onSelect).toHaveBeenCalledWith(exercises[0]);
	});

	it('calls onSearch when text is typed in the search box', async () => {
		const user = userEvent.setup();
		const onSearch = vi.fn();
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch,
			onCancel: vi.fn()
		});
		await user.type(screen.getByRole('searchbox', { name: /search exercises/i }), 'bench');
		expect(onSearch).toHaveBeenCalled();
	});

	it('calls onCancel when the Cancel button is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel
		});
		await user.click(screen.getByRole('button', { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('groups exercises under muscle group headings', () => {
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn()
		});
		expect(screen.getByRole('heading', { name: /chest/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /legs/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /back/i })).toBeInTheDocument();
	});

	it('displays the current search query in the input', () => {
		render(ExercisePicker, {
			exercises,
			searchQuery: 'bench',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn()
		});
		expect(screen.getByRole('searchbox', { name: /search exercises/i })).toHaveValue('bench');
	});
});
