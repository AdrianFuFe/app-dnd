<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>App DnD | Overview</title>
</svelte:head>

<div class="space-y-8">
	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
			Authenticated app
		</p>
		<h1 class="mt-3 text-3xl font-semibold text-stone-900">Your private workspace is ready.</h1>
		<p class="mt-3 max-w-3xl text-base leading-7 text-stone-600">
			You are now inside the protected application shell. This area is reserved for personal
			character management, owned content, and future campaign-oriented workflows.
		</p>
	</section>

	<section class="grid gap-4 lg:grid-cols-2">
		<a
			class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300"
			href={resolve('/app/characters')}
		>
			<p class="text-sm font-medium text-stone-500">Characters</p>
			<h2 class="mt-2 text-2xl font-semibold text-stone-900">
				Prepare the first creation flow
			</h2>
			<p class="mt-3 text-sm leading-6 text-stone-600">
				This section will hold user-owned character lists, creation, and editing.
			</p>
		</a>

		<a
			class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300"
			href={resolve('/app/content')}
		>
			<p class="text-sm font-medium text-stone-500">Content</p>
			<h2 class="mt-2 text-2xl font-semibold text-stone-900">
				Organize SRD and private data
			</h2>
			<p class="mt-3 text-sm leading-6 text-stone-600">
				This section is reserved for reusable catalog content, private entries, and future
				homebrew workflows.
			</p>
		</a>
	</section>

	<section class="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-6">
		<h2 class="text-lg font-semibold text-stone-900">What this block establishes</h2>
		<p class="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
			Public entry stays at the site root and authentication routes, while signed-in users
			land in a dedicated shell under <code>/app</code>. That separation keeps upcoming
			product work aligned with the architecture plan.
		</p>
	</section>
</div>
