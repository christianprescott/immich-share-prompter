<script>
	import { Button, Container, Field, Input, Stack } from '@immich/ui';
	const { params } = $props();
</script>

<Container size="medium" center class="mt-8 mb-24 p-4 lg:p-8">
	<Stack gap={4}>
		{params.uuid}
		<img src="/assets/{params.uuid}" />
		<form method="POST" action="/share/{params.uuid}">
			<Field label="Your name">
				<Input name="name" value="Tom" />
			</Field>
			<Button type="submit">Submit</Button>
		</form>
	</Stack>
</Container>
