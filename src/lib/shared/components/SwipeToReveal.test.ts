import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SwipeToReveal from './SwipeToReveal.svelte';

describe('SwipeToReveal', () => {
	it('renders the action button', () => {
		render(SwipeToReveal, { actionLabel: 'Delete', onAction: vi.fn() });
		expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
	});

	it('calls onAction when the action button is clicked', async () => {
		const user = userEvent.setup();
		const onAction = vi.fn();
		render(SwipeToReveal, { actionLabel: 'Delete', onAction });
		await user.click(screen.getByRole('button', { name: 'Delete' }));
		expect(onAction).toHaveBeenCalledOnce();
	});

	it('renders with a custom action label', () => {
		render(SwipeToReveal, { actionLabel: 'Remove', onAction: vi.fn() });
		expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
	});

	it('action button can be activated via keyboard', async () => {
		const user = userEvent.setup();
		const onAction = vi.fn();
		render(SwipeToReveal, { actionLabel: 'Delete', onAction });
		const btn = screen.getByRole('button', { name: 'Delete' });
		btn.focus();
		await user.keyboard('{Enter}');
		expect(onAction).toHaveBeenCalledOnce();
	});
});
