<script lang="ts">
	import { IMMICH_HOST } from '$app/env/public';
	import { Button } from '@immich/ui';
</script>

<Button color="primary" shape="round" href={IMMICH_HOST}>View in timeline</Button>
<Button color="secondary" shape="semi-round" href={IMMICH_HOST}>More suggestions</Button>
<Button color="secondary" variant="ghost" href={IMMICH_HOST}>More suggestions</Button>
