import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import RepCounter from './RepCounter.svelte';

describe('RepCounter', () => {
	it('renders the current rep count', () => {
		render(RepCounter, { repCount: 7, onIncrement: vi.fn(), onDecrement: vi.fn() });
		expect(screen.getByRole('button', { name: /tap to count/i })).toBeInTheDocument();
		// The count appears in the button and in the status region
		expect(screen.getByRole('status')).toHaveTextContent('7');
	});

	it('calls onIncrement when the tap area is clicked', async () => {
		const user = userEvent.setup();
		const onIncrement = vi.fn();
		render(RepCounter, { repCount: 0, onIncrement, onDecrement: vi.fn() });
		await user.click(screen.getByRole('button', { name: /tap to count/i }));
		expect(onIncrement).toHaveBeenCalledOnce();
	});

	it('calls onIncrement when the + button is clicked', async () => {
		const user = userEvent.setup();
		const onIncrement = vi.fn();
		render(RepCounter, { repCount: 0, onIncrement, onDecrement: vi.fn() });
		await user.click(screen.getByRole('button', { name: /increment/i }));
		expect(onIncrement).toHaveBeenCalledOnce();
	});

	it('calls onDecrement when the − button is clicked', async () => {
		const user = userEvent.setup();
		const onDecrement = vi.fn();
		render(RepCounter, { repCount: 5, onIncrement: vi.fn(), onDecrement });
		await user.click(screen.getByRole('button', { name: /decrement/i }));
		expect(onDecrement).toHaveBeenCalledOnce();
	});

	it('has an aria-live status region for screen readers', () => {
		render(RepCounter, { repCount: 3, onIncrement: vi.fn(), onDecrement: vi.fn() });
		const status = screen.getByRole('status');
		expect(status).toHaveAttribute('aria-live', 'polite');
		expect(status).toHaveTextContent('3');
	});

	it('renders rep count 0', () => {
		render(RepCounter, { repCount: 0, onIncrement: vi.fn(), onDecrement: vi.fn() });
		expect(screen.getByRole('status')).toHaveTextContent('0');
	});
});
