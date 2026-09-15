import { IMMICH_HOST } from '$app/env/public';
import { IMMICH_API_KEY } from '$app/env/private';

export async function load() {
	const response = await fetch(IMMICH_HOST + '/api/map/markers', {
		headers: { 'Content-Type': 'application/json', 'x-api-key': IMMICH_API_KEY }
	});
	return {
		cities: [...new Set((await response.json()).map((m) => m.city).filter((c) => !!c))]
	};
}
