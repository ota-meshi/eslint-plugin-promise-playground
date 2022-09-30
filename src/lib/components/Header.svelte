<script lang="ts">
	import github from '$lib/images/github.svg';

	let packages: Record<string, { homepage: string; name: string; version: string }> = {};
	if (typeof window !== 'undefined') {
		// @ts-expect-error -- define by vite
		packages = window.__DEPS_PKGS__ || {};
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
			<a href={pkg.homepage} target="_blank">{pkg.name}@{pkg.version}</a>
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

	.packages-info a {
		padding: 0 8px;
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
