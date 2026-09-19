<script lang="ts">
	const { children } = $props();
</script>

<div class="separator">{@render children()}</div>

<style>
	.separator {
		display: flex;
		align-items: center;
		text-align: center;
	}
	.separator::before,
	.separator::after {
		content: '';
		flex: 1;
		border-bottom: 1px solid currentColor;
		margin: auto;
	}
	.separator:not(:empty)::before {
		margin-right: 0.5em;
	}
	.separator:not(:empty)::after {
		margin-left: 0.5em;
	}
</style>
