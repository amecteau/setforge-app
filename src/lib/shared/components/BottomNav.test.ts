import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import BottomNav from './BottomNav.svelte';

describe('BottomNav', () => {
	it('renders Counter, History, and Exercises tabs', () => {
		render(BottomNav, { currentPath: '/' });
		expect(screen.getByRole('link', { name: /counter/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /history/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /exercises/i })).toBeInTheDocument();
	});

	it('marks Counter tab as current on /', () => {
		render(BottomNav, { currentPath: '/' });
		expect(screen.getByRole('link', { name: /counter/i })).toHaveAttribute(
			'aria-current',
			'page'
		);
		expect(screen.getByRole('link', { name: /history/i })).not.toHaveAttribute('aria-current');
		expect(screen.getByRole('link', { name: /exercises/i })).not.toHaveAttribute('aria-current');
	});

	it('marks History tab as current on /history', () => {
		render(BottomNav, { currentPath: '/history' });
		expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute(
			'aria-current',
			'page'
		);
		expect(screen.getByRole('link', { name: /counter/i })).not.toHaveAttribute('aria-current');
	});

	it('marks Exercises tab as current on /exercises', () => {
		render(BottomNav, { currentPath: '/exercises' });
		expect(screen.getByRole('link', { name: /exercises/i })).toHaveAttribute(
			'aria-current',
			'page'
		);
	});

	it('has a navigation landmark', () => {
		render(BottomNav, { currentPath: '/' });
		expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
	});
});
