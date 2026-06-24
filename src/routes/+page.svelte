<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<svelte:head>
	<title>App DnD</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12">
	<div class="space-y-6">
		<div class="space-y-3">
			<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">App DnD</p>
			<h1 class="text-4xl font-semibold text-stone-900">
				Manage characters and reusable DnD content
			</h1>
			<p class="max-w-2xl text-base text-stone-600">
				A SvelteKit foundation for private characters, SRD-backed catalog content, and
				future campaigns.
			</p>
		</div>

		{#if data.session}
			<div class="space-y-3">
				<p class="text-sm text-emerald-700">
					You are signed in as {data.session.user.email ?? data.session.user.id}.
				</p>
				<a
					class="inline-flex rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
					href={resolve('/app')}
				>
					Go to app
				</a>
			</div>
		{:else}
			<div class="flex flex-wrap gap-3">
				<a
					class="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
					href={resolve('/auth/register')}
				>
					Create account
				</a>
				<a
					class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400"
					href={resolve('/auth/login')}
				>
					Login
				</a>
			</div>
		{/if}
	</div>
</div>
