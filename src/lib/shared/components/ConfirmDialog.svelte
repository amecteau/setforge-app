<script lang="ts">
	import { focusTrap } from '$lib/shared/utils/focusTrap.js';

	let {
		message,
		confirmLabel = 'Confirm',
		onConfirm,
		onCancel
	}: {
		message: string;
		confirmLabel?: string;
		onConfirm: () => void;
		onCancel: () => void;
	} = $props();
</script>

<div
	role="dialog"
	aria-label={message}
	aria-modal="true"
	use:focusTrap={{ onEscape: onCancel }}
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
>
	<div class="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 text-center">
		<p class="mb-6 text-zinc-300">{message}</p>
		<div class="flex gap-3">
			<button
				onclick={onCancel}
				class="flex-1 rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300 active:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
			>
				Cancel
			</button>
			<button
				onclick={onConfirm}
				class="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white active:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
			>
				{confirmLabel}
			</button>
		</div>
	</div>
</div>
