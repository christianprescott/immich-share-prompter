<script>
	import { enhance } from '$app/forms';
	import { IMMICH_HOST, SMTP_TO } from '$app/env/public';
	import {
		Button,
		Container,
		Field,
		Input,
		Stack,
		Logo,
		HStack,
		IconButton,
		HelperText,
		Card,
		CardBody
	} from '@immich/ui';
	import { mdiOpenInNew, mdiSend } from '@mdi/js';
	const { params, form } = $props();

	let submitting = $state(false);
</script>

<Container size="medium" center class="mb-24 p-4 lg:p-8">
	<Card color="primary">
		<CardBody>
			<Stack gap={4}>
				<div class="relative rounded-lg overflow-hidden">
					<img src="/assets/{params.uuid}" />
					<Button
						href={`${IMMICH_HOST}/photos?at=${params.uuid}`}
						trailingIcon={mdiOpenInNew}
						size="small"
						color="secondary"
						variant="outline"
						class="absolute top-2 inset-e-2"
						><Logo variant="icon" size="tiny" />View in timeline</Button
					>
				</div>
				<form
					method="POST"
					action="/share/{params.uuid}"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update();
							submitting = false;
						};
					}}
				>
					<HStack>
						<Field class="flex-1" invalid={!!form?.error}>
							<Input
								size="large"
								shape="round"
								name="to"
								required
								placeholder="Recipient"
								value={form?.to ?? SMTP_TO}
							/>
							{#if form?.error}
								<HelperText color="danger">{form.error}</HelperText>
							{/if}
						</Field>
						<IconButton
							type="submit"
							icon={mdiSend}
							size="large"
							shape="round"
							aria-label="Send email"
							class="self-start sm:hidden"
							loading={submitting}
						/>
						<Button
							type="submit"
							leadingIcon={mdiSend}
							size="large"
							shape="round"
							class="self-start hidden sm:flex"
							loading={submitting}
						>
							Send
						</Button>
					</HStack>
				</form>
			</Stack>
		</CardBody>
	</Card>
</Container>
