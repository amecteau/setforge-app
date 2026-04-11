import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import FontScaleControl from './FontScaleControl.svelte';

describe('FontScaleControl', () => {
	it('renders decrease and increase buttons', () => {
		render(FontScaleControl, {
			fontScale: 'medium',
			onDecrease: vi.fn(),
			onIncrease: vi.fn()
		});
		expect(screen.getByRole('button', { name: /decrease font size/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /increase font size/i })).toBeInTheDocument();
	});

	it('disables the decrease button at small scale', () => {
		render(FontScaleControl, {
			fontScale: 'small',
			onDecrease: vi.fn(),
			onIncrease: vi.fn()
		});
		expect(screen.getByRole('button', { name: /decrease font size/i })).toBeDisabled();
	});

	it('disables the increase button at extraLarge scale', () => {
		render(FontScaleControl, {
			fontScale: 'extraLarge',
			onDecrease: vi.fn(),
			onIncrease: vi.fn()
		});
		expect(screen.getByRole('button', { name: /increase font size/i })).toBeDisabled();
	});

	it('both buttons are enabled at a middle scale', () => {
		render(FontScaleControl, {
			fontScale: 'medium',
			onDecrease: vi.fn(),
			onIncrease: vi.fn()
		});
		expect(screen.getByRole('button', { name: /decrease font size/i })).not.toBeDisabled();
		expect(screen.getByRole('button', { name: /increase font size/i })).not.toBeDisabled();
	});

	it('calls onDecrease when decrease button is clicked', async () => {
		const user = userEvent.setup();
		const onDecrease = vi.fn();
		render(FontScaleControl, {
			fontScale: 'large',
			onDecrease,
			onIncrease: vi.fn()
		});
		await user.click(screen.getByRole('button', { name: /decrease font size/i }));
		expect(onDecrease).toHaveBeenCalledOnce();
	});

	it('calls onIncrease when increase button is clicked', async () => {
		const user = userEvent.setup();
		const onIncrease = vi.fn();
		render(FontScaleControl, {
			fontScale: 'medium',
			onDecrease: vi.fn(),
			onIncrease
		});
		await user.click(screen.getByRole('button', { name: /increase font size/i }));
		expect(onIncrease).toHaveBeenCalledOnce();
	});
});
