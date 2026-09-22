import { getSuggestedAssets } from '$lib/server/assets';

export async function load() {
	const assets = getSuggestedAssets();
	// Catch unhandled errors to avoid crashing server.
	assets.catch(() => {});

	return {
		assets
	};
}
