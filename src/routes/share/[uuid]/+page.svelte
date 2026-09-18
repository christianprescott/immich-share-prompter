<script>
	import { IMMICH_HOST, SMTP_TO } from '$app/env/public';
	import {
		Button,
		Container,
		Field,
		Input,
		Stack,
		Logo,
		HStack,
		IconButton
	} from '@immich/ui';
	import { mdiOpenInNew, mdiSend } from '@mdi/js';
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
			<HStack>
				<Field label="Recipient" class="flex-1">
					<Input size="large" shape="round" name="name" value={SMTP_TO} />
				</Field>
				<IconButton
					type="submit"
					icon={mdiSend}
					size="large"
					shape="round"
					aria-label="Send email"
					class="self-end sm:hidden"
				/>
				<Button
					type="submit"
					leadingIcon={mdiSend}
					size="large"
					shape="round"
					class="self-end hidden sm:flex"
				>
					Send
				</Button>
			</HStack>
		</form>
	</Stack>
</Container>
