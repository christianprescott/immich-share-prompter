<script lang="ts">
	import { IMMICH_HOST } from '$app/env/public';
	import {
		Container,
		Heading,
		Link,
		Stack,
		Text,
		ImageCarousel,
		Button,
		Logo,
		LoadingSpinner,
		Alert
	} from '@immich/ui';
	import { mdiOpenInNew } from '@mdi/js';

	const { data } = $props();
</script>

<Container size="medium" center class="mt-8 mb-24 p-4 lg:p-8">
	<Stack gap={4}>
		<Heading size="giant" tag="h1">Immich Share Prompter</Heading>

		<Text>
			Visit <Link href={IMMICH_HOST}>your Immich instance</Link>
		</Text>
		<Text color="primary">Share something else?</Text>
		{#await data.assets}
			<LoadingSpinner size="giant" />
		{:then assets}
			<ImageCarousel items={assets} />
		{:catch}
			<Alert color="warning" title="Couldn't fetch recent photos">
				Make sure your Immich host ({IMMICH_HOST}) is correct and your API key is valid.
			</Alert>
		{/await}
	</Stack>
</Container>
