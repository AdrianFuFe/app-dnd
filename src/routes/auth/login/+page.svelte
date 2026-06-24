<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		form
	}: {
		form?: {
			email?: string;
			error?: string;
		};
	} = $props();
</script>

<svelte:head>
	<title>Login | App DnD</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
	<div class="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
		<h1 class="text-2xl font-semibold text-stone-900">Login</h1>
		<p class="mt-2 text-sm text-stone-600">Access your characters and private content.</p>

		<form method="POST" class="mt-6 space-y-4">
			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Email</span>
				<input
					class="block w-full rounded-lg border-stone-300"
					type="email"
					name="email"
					required
					value={form?.email ?? ''}
				/>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Password</span>
				<input
					class="block w-full rounded-lg border-stone-300"
					type="password"
					name="password"
					required
					minlength="8"
				/>
			</label>

			{#if form?.error}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.error}</p>
			{/if}

			<button
				class="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
				type="submit"
			>
				Login
			</button>
		</form>

		<p class="mt-4 text-sm text-stone-600">
			Need an account?
			<a class="font-medium text-stone-900 underline" href={resolve('/auth/register')}
				>Register</a
			>
		</p>
	</div>
</div>
