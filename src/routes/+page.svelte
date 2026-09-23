<script lang="ts">
	import { IMMICH_HOST } from '$app/env/public';
	import ShimmerCarousel from '$lib/components/ShimmerCarousel.svelte';
	import {
		Container,
		Heading,
		Link,
		Stack,
		Text,
		ImageCarousel,
		ImageCard,
		Button,
		Logo,
		Alert
	} from '@immich/ui';
	import { mdiOpenInNew } from '@mdi/js';

	const { data } = $props();
</script>

<Container size="medium" center class="mt-8 mb-24 p-4 lg:p-8">
	<Stack gap={4}>
		<Stack gap={0}>
			<Text>Share something else?</Text>
			{#await data.assets}
				<ShimmerCarousel />
			{:then assets}
				<ImageCarousel items={assets} />
			{:catch}
				<Alert color="warning" title="Couldn't fetch recent photos">
					Make sure your Immich host ({IMMICH_HOST}) is correct and your API key is valid.
				</Alert>
			{/await}
			<Button
				href={IMMICH_HOST}
				trailingIcon={mdiOpenInNew}
				color="secondary"
				variant="outline"
				class="self-end"><Logo variant="icon" size="tiny" />More photos</Button
			>
		</Stack>
	</Stack>
</Container>
