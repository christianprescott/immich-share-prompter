import { IMMICH_HOST } from '$app/env/public';
import { IMMICH_API_KEY } from '$app/env/private';
import ImmichClient from '$lib/server/immich';
import { AssetMediaSize } from '@immich/sdk';
import type { RequestHandler } from '@sveltejs/kit';

// Requests for Immich assets must be authenticated. Proxy requests so <img>
// elements can use a regular GET request for their src
export const GET: RequestHandler = async ({ params, url, fetch }) => {
	const client = new ImmichClient(IMMICH_HOST, IMMICH_API_KEY);
	const requestedSize = url.searchParams.get('size');
	const size = Object.values(AssetMediaSize).includes(requestedSize as AssetMediaSize)
		? (requestedSize as AssetMediaSize)
		: AssetMediaSize.Thumbnail;
	return client.proxy(`/assets/${params.uuid}/thumbnail?size=${size}`);
};
