<script>
	import github from '$lib/images/github.svg';
</script>

<header>
	<div class="eslint-plugin-promise">
		<p>
			<a href="https://github.com/eslint-community/eslint-plugin-promise">
				eslint-plugin-promise
			</a>
			Online Playground
		</p>
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
	}

	.eslint-plugin-promise {
		display: flex;
		height: 3em;
		align-items: center;
		padding: 0 0.5rem;
		letter-spacing: 0.1em;
		text-decoration: none;
	}
	.eslint-plugin-promise p {
		color: #00000054;
		font-weight: 700;
		font-size: 0.8rem;
	}
	.eslint-plugin-promise a {
		color: var(--color-text);
		transition: color 0.2s linear;
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
	}
</style>
