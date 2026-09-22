import { IMMICH_HOST } from '$app/env/public';
import { IMMICH_API_KEY } from '$app/env/private';
import ImmichClient from '$lib/server/immich';

export async function load() {
	const assets = new ImmichClient(IMMICH_HOST, IMMICH_API_KEY).getSuggestedAssets();
	// Catch unhandled errors to avoid crashing server.
	assets.catch(() => {});

	return {
		assets
	};
}
