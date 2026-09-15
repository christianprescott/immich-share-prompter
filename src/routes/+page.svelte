<script lang="ts">
	import { Container, Heading, Link, Stack, Text } from '@immich/ui';

	const { data } = $props();
</script>

<Container size="medium" center class="mt-8 mb-24 p-4 lg:p-8">
	<Stack gap={4}>
		<Heading size="giant" tag="h1">Immich Share Prompter</Heading>

		<Text>
			Visit <Link href={data.immichHost}>your Immich instance</Link>
		</Text>
		<Text>
			Maybe you want to share a photo from {data.cities.join(', ')}
		</Text>
	</Stack>
</Container>
