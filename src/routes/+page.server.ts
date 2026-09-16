import { ImmichClient } from '$lib/server/immich';

export async function load() {
	const client = new ImmichClient();
	const markers = await client.getMapMarkers({});
	return {
		cities: [...new Set(markers.map((m) => m.city).filter((c) => !!c))]
	};
}
