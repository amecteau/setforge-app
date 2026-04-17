const FOCUSABLE =
	'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusTrap(
	node: HTMLElement,
	options?: { onEscape?: () => void }
): { destroy(): void } {
	const previousFocus = document.activeElement as HTMLElement | null;

	const focusable = (): HTMLElement[] => [...node.querySelectorAll<HTMLElement>(FOCUSABLE)];

	const els = focusable();
	if (els.length > 0) els[0].focus();

	function onKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			options?.onEscape?.();
			return;
		}
		if (e.key !== 'Tab') return;
		const items = focusable();
		if (items.length === 0) return;
		if (e.shiftKey) {
			if (document.activeElement === items[0]) {
				e.preventDefault();
				items[items.length - 1].focus();
			}
		} else if (document.activeElement === items[items.length - 1]) {
			e.preventDefault();
			items[0].focus();
		}
	}

	node.addEventListener('keydown', onKeydown);
	return {
		destroy(): void {
			node.removeEventListener('keydown', onKeydown);
			previousFocus?.focus();
		}
	};
}
