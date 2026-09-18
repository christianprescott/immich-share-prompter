<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Container, HelperText, Stack, Text } from '@immich/ui';
	import { mdiSend } from '@mdi/js';

	const { form } = $props();

	let submitting = $state(false);
</script>

<Container size="small" center class="mt-8 mb-24 p-4 lg:p-8">
	<Stack gap={4}>
		<Text>Send a test email rendering the @immich/ui Button component.</Text>
		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<Button
				type="submit"
				leadingIcon={mdiSend}
				color="primary"
				shape="round"
				loading={submitting}
			>
				Send test email
			</Button>
		</form>
		{#if form?.error}
			<HelperText color="danger">{form.error}</HelperText>
		{:else if form?.success}
			<HelperText color="success">Sent!</HelperText>
		{/if}
	</Stack>
</Container>
