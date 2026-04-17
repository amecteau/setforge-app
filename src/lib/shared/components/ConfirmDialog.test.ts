import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog.svelte';

describe('ConfirmDialog', () => {
	it('renders as a dialog', () => {
		render(ConfirmDialog, { message: 'Delete this?', onConfirm: vi.fn(), onCancel: vi.fn() });
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	it('renders the message text', () => {
		render(ConfirmDialog, { message: 'Delete this?', onConfirm: vi.fn(), onCancel: vi.fn() });
		expect(screen.getByText('Delete this?')).toBeInTheDocument();
	});

	it('renders Cancel and default Confirm buttons', () => {
		render(ConfirmDialog, { message: 'Sure?', onConfirm: vi.fn(), onCancel: vi.fn() });
		expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
	});

	it('uses a custom confirmLabel', () => {
		render(ConfirmDialog, {
			message: 'Sure?',
			confirmLabel: 'Delete',
			onConfirm: vi.fn(),
			onCancel: vi.fn()
		});
		expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
	});

	it('calls onConfirm when the confirm button is clicked', async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		render(ConfirmDialog, {
			message: 'Sure?',
			confirmLabel: 'Delete',
			onConfirm,
			onCancel: vi.fn()
		});
		await user.click(screen.getByRole('button', { name: 'Delete' }));
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it('calls onCancel when the Cancel button is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(ConfirmDialog, { message: 'Sure?', onConfirm: vi.fn(), onCancel });
		await user.click(screen.getByRole('button', { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('calls onCancel when Escape is pressed', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(ConfirmDialog, { message: 'Sure?', onConfirm: vi.fn(), onCancel });
		await user.keyboard('{Escape}');
		expect(onCancel).toHaveBeenCalledOnce();
	});
});
