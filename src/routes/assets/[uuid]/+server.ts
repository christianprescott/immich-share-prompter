import { defaults } from '$lib/server/immich';
import type { RequestHandler } from '@sveltejs/kit';

// Requests for Immich assets must be authenticated. Proxy requests so <img>
// elements can use a regular GET request for their src
export const GET: RequestHandler = async ({ params, fetch }) => {
	const asset = await fetch(`${defaults.baseUrl}/assets/${params.uuid}/thumbnail?size=preview`, {
		headers: defaults.headers
	});
	return new Response(asset.body, {
		headers: { 'Content-Type': asset.headers.get('Content-Type') }
	});
};
