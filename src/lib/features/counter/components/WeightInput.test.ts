import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import WeightInput from './WeightInput.svelte';

describe('WeightInput', () => {
	it('renders the weight field and stepper buttons', () => {
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust: vi.fn()
		});
		expect(screen.getByRole('textbox', { name: /weight/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /-5/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /\+5/i })).toBeInTheDocument();
	});

	it('displays the current weight value', () => {
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust: vi.fn()
		});
		expect(screen.getByRole('textbox', { name: /weight/i })).toHaveValue('135');
	});

	it('shows empty field when weight is null', () => {
		render(WeightInput, {
			weight: null,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust: vi.fn()
		});
		expect(screen.getByRole('textbox', { name: /weight/i })).toHaveValue('');
	});

	it('calls onAdjust with -5 when minus stepper is clicked (lb)', async () => {
		const user = userEvent.setup();
		const onAdjust = vi.fn();
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust
		});
		await user.click(screen.getByRole('button', { name: /-5/i }));
		expect(onAdjust).toHaveBeenCalledWith(-5);
	});

	it('calls onAdjust with +5 when plus stepper is clicked (lb)', async () => {
		const user = userEvent.setup();
		const onAdjust = vi.fn();
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust
		});
		await user.click(screen.getByRole('button', { name: /\+5/i }));
		expect(onAdjust).toHaveBeenCalledWith(5);
	});

	it('uses 2.5 step for kg unit', () => {
		render(WeightInput, {
			weight: 60,
			unit: 'kg',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust: vi.fn()
		});
		expect(screen.getByRole('button', { name: /-2.5/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /\+2.5/i })).toBeInTheDocument();
	});

	it('calls onUnitChange when unit toggle is clicked', async () => {
		const user = userEvent.setup();
		const onUnitChange = vi.fn();
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange,
			onAdjust: vi.fn()
		});
		await user.click(screen.getByRole('button', { name: /unit/i }));
		expect(onUnitChange).toHaveBeenCalledWith('kg');
	});

	it('toggles from kg to lb', async () => {
		const user = userEvent.setup();
		const onUnitChange = vi.fn();
		render(WeightInput, {
			weight: 60,
			unit: 'kg',
			onWeightChange: vi.fn(),
			onUnitChange,
			onAdjust: vi.fn()
		});
		await user.click(screen.getByRole('button', { name: /unit/i }));
		expect(onUnitChange).toHaveBeenCalledWith('lb');
	});
});
