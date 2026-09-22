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
		CardBody,
		Text
	} from '@immich/ui';
	import { mdiOpenInNew, mdiSend, mdiShareVariant } from '@mdi/js';
	import HorizontalRule from '$lib/components/HorizontalRule.svelte';
	const { params, form } = $props();

	let submitting = $state(false);

	// Call the function lazily and at most once, reusing the promise result to
	// avoid extra image fetch.
	let fetchAssetFilePromise;
	function fetchAssetFile() {
		fetchAssetFilePromise ??= (async () => {
			const response = await fetch(`/assets/${params.uuid}?size=preview`);
			const blob = await response.blob();
			const extension = blob.type.split('/')[1] ?? 'jpg';
			return new File([blob], `${params.uuid}.${extension}`, { type: blob.type });
		})();
		return fetchAssetFilePromise;
	}

	// `share({ files })` Works in mobile Chrome, but not Firefox nor desktop.
	// Still worth doing but most browsers must right-click-on-image for now.
	async function canShareFiles() {
		if (!navigator.canShare) return false;
		const file = await fetchAssetFile();
		return navigator.canShare({ files: [file] });
	}

	let sharing = $state(false);
	async function shareImage() {
		sharing = true;
		try {
			const file = await fetchAssetFile();
			await navigator.share({ files: [file] });
		} catch {
		} finally {
			sharing = false;
		}
	}
</script>

<Container size="medium" center class="mb-24 p-4 lg:p-8">
	<Card color="primary">
		<CardBody>
			<Stack gap={4}>
				<div class="relative rounded-lg overflow-hidden">
					<img src="/assets/{params.uuid}?size=preview" />
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
				{#await canShareFiles() then canShare}
					{#if canShare}
						<Text color="muted" fontWeight="light" size="tiny">
							<HorizontalRule>OR</HorizontalRule>
						</Text>

						<Button
							size="large"
							shape="round"
							variant="outline"
							fullWidth
							leadingIcon={mdiShareVariant}
							onclick={shareImage}
							disabled={sharing}>Share</Button
						>
					{/if}
				{/await}
			</Stack>
		</CardBody>
	</Card>
</Container>
