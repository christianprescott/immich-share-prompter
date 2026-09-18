<script>
	import { IMMICH_HOST } from '$app/env/public';
	import { Button, Container, Field, Input, Stack, Logo } from '@immich/ui';
	import { mdiOpenInNew } from '@mdi/js';
	const { params } = $props();
</script>

<Container size="medium" center class="mt-8 mb-24 p-4 lg:p-8">
	<Stack gap={4}>
		<div class="relative rounded-xl overflow-hidden">
			<img src="/assets/{params.uuid}" />
			<Button
				href={`${IMMICH_HOST}/photos?at=${params.uuid}`}
				trailingIcon={mdiOpenInNew}
				color="secondary"
				variant="outline"
				class="absolute top-2 inset-e-2"><Logo variant="icon" size="tiny" />View in timeline</Button
			>
		</div>
		<form method="POST" action="/share/{params.uuid}">
			<Field label="Your name">
				<Input name="name" value="Tom" />
			</Field>
			<Button type="submit">Submit</Button>
		</form>
	</Stack>
</Container>
