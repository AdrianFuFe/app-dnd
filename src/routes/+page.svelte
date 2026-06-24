<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<svelte:head>
	<title>App DnD</title>
</svelte:head>

<div class="min-h-screen bg-stone-100">
	<div class="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center">
		<section class="flex-1 space-y-6">
			<div class="space-y-3">
				<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">App DnD</p>
				<h1 class="max-w-3xl text-4xl font-semibold text-stone-900 sm:text-5xl">
					Private character management with a structured DnD content foundation
				</h1>
				<p class="max-w-2xl text-base leading-7 text-stone-600">
					Build a clean base for your personal characters, SRD-backed catalog data, and
					future campaign workflows without mixing public landing pages with the
					authenticated app experience.
				</p>
			</div>

			{#if data.session}
				<div class="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
					<p class="text-sm font-medium text-emerald-800">Active session detected</p>
					<p class="text-sm text-emerald-700">
						Signed in as {data.session.user.email ?? data.session.user.id}. Continue in
						your private application area.
					</p>
					<a
						class="inline-flex rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
						href={resolve('/app')}
					>
						Enter app shell
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
		</section>

		<section class="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
					<p class="text-sm font-medium text-stone-900">Public entry</p>
					<p class="mt-2 text-sm leading-6 text-stone-600">
						Landing, registration, and login stay outside the protected application.
					</p>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
					<p class="text-sm font-medium text-stone-900">Private app</p>
					<p class="mt-2 text-sm leading-6 text-stone-600">
						Authenticated users continue under <code>/app</code> for owned characters and
						content.
					</p>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:col-span-2">
					<p class="text-sm font-medium text-stone-900">Current MVP direction</p>
					<p class="mt-2 text-sm leading-6 text-stone-600">
						Start with stable auth, ownership-safe data, and the first character and
						content flows before deeper rules automation.
					</p>
				</div>
			</div>
		</section>
	</div>
</div>
