<script lang="ts">
	/* global __DEPS_PKGS__, __PKG_VERSIONS__ -- define by vite */
	import github from '$lib/images/github.svg';
	import { setupPlugin } from '../eslint/scripts/linter';

	let pluginVersion = 'dev';

	let packages: Record<string, { homepage: string; name: string; version: string }> = {};
	let packageVersions: Record<string, string[]> = {};
	// @ts-expect-error -- define by vite
	if (typeof __DEPS_PKGS__ !== 'undefined') {
		// @ts-expect-error -- define by vite
		packages = (__DEPS_PKGS__ || {}) as unknown;
	}
	// @ts-expect-error -- define by vite
	if (typeof __PKG_VERSIONS__ !== 'undefined') {
		// @ts-expect-error -- define by vite
		packageVersions = (__PKG_VERSIONS__ || {}) as unknown;
	}

	$: versions = [
		'dev',
		...(packageVersions['eslint-plugin-promise'] || ['6', '5', '4', '3', '2', '1'])
	];

	$: {
		if (pluginVersion === 'dev') {
			setupPlugin();
		} else {
			const url = `https://cdn.skypack.dev/eslint-plugin-promise@${pluginVersion}`;
			void import(/* @vite-ignore */ url).then((module) => {
				setupPlugin(module);
			});
		}
	}
</script>

<header>
	<div class="title">
		<p>
			<a href="https://github.com/eslint-community/eslint-plugin-promise">
				eslint-plugin-promise
			</a>
			Online Playground
		</p>
	</div>
	<div class="packages-info">
		{#each Object.keys(packages) as nm}
			{@const pkg = packages[nm]}
			{#if nm === 'eslint-plugin-promise'}
				<div class="package-item">
					<a href={pkg.homepage} target="_blank">{pkg.name}</a>@<select bind:value={pluginVersion}>
						{#each versions as v}
							<option value={v}>
								{v}
							</option>
						{/each}
					</select>
				</div>
			{:else}
				<a class="package-item" href={pkg.homepage} target="_blank">{pkg.name}@{pkg.version}</a>
			{/if}
		{/each}
	</div>

	<div class="corner">
		<a href="https://github.com/ota-meshi/eslint-plugin-promise-playground">
			<img src={github} alt="GitHub" />
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 12px;
	}

	.title {
		display: flex;
		height: 3em;
		align-items: center;
		padding: 0 0.5rem;
		letter-spacing: 0.1em;
		text-decoration: none;
	}
	.title a {
		color: var(--color-title-1);
		font-weight: 700;
		font-size: 1rem;
	}
	.title p {
		color: var(--color-title-2);
		font-weight: 700;
		font-size: 1rem;
	}
	.packages-info {
		padding-left: 16px;
		margin-left: auto;
		display: flex;
		flex-wrap: wrap;
		font-size: 70%;
		justify-content: flex-end;
	}

	.packages-info .package-item {
		padding: 0 8px;
		display: flex;
		align-items: center;
	}
	.packages-info a {
		color: #2c3e50;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	a:hover {
		color: var(--color-theme-1);
		transition: color 0.2s linear;
	}
</style>
