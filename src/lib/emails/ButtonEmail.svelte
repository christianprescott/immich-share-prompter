<script lang="ts">
	import { IMMICH_HOST } from '$app/env/public';
	import { Button, ImageCard } from '@immich/ui';
</script>

<ImageCard item={{title: '', src: "/assets/dac8f9ca-750a-4b2f-b4d5-0489ddbab355", href: "/share/dac8f9ca-750a-4b2f-b4d5-0489ddbab355"}} />
<Button color="primary" shape="round" href={IMMICH_HOST}>View in timeline</Button>
<Button color="secondary" shape="semi-round" href={IMMICH_HOST}>More suggestions</Button>
<Button color="secondary" variant="ghost" href={IMMICH_HOST}>More suggestions</Button>
