import { getMapMarkers } from '$lib/server/immich';

export async function load() {
	const markers = await getMapMarkers({});
	return {
		cities: [...new Set(markers.map((m) => m.city).filter((c) => !!c))]
	};
}
