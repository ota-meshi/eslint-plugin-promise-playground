<script>
	import logo from '$lib/images/logo.png';
</script>

<footer>
	<a href="https://github.com/eslint-community">
		<img class="logo" src={logo} alt="ESLint Community" />
	</a>
	<div class="builder">
		This site was built with <a href="https://kit.svelte.dev">SvelteKit</a>.
	</div>
</footer>

<style>
	footer {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 4px 12px;
	}

	.logo {
		height: 50px;
	}

	.builder {
		font-size: 0.8rem;
		padding-left: 8px;
	}
</style>
