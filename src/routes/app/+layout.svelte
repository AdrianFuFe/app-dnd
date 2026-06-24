<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		data,
		children
	}: {
		data: App.PageData;
		children: import('svelte').Snippet;
	} = $props();
</script>

<div class="min-h-screen bg-stone-50">
	<header class="border-b border-stone-200 bg-white">
		<div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
			<div class="space-y-1">
				<a
					class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500"
					href={resolve('/app')}>App DnD</a
				>
				<p class="text-sm text-stone-600">
					Signed in as {data.session?.user.email ?? data.session?.user.id}
				</p>
			</div>

			<nav class="flex items-center gap-3">
				<a
					class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400"
					href={resolve('/app')}
				>
					App home
				</a>

				<form method="POST" action={resolve('/auth/logout')}>
					<button
						class="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
						type="submit"
					>
						Logout
					</button>
				</form>
			</nav>
		</div>
	</header>

	{@render children()}
</div>
