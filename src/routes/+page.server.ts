import { IMMICH_HOST, IMMICH_API_KEY } from '$env/static/private';

export async function load() {
	const response = await fetch(IMMICH_HOST + '/api/map/markers', {
		headers: { 'Content-Type': 'application/json', 'x-api-key': IMMICH_API_KEY }
	});
	return {
		cities: [...new Set((await response.json()).map((m) => m.city).filter((c) => !!c))],
		immichHost: IMMICH_HOST
	};
}
