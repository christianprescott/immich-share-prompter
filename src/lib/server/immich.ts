import { IMMICH_HOST } from '$app/env/public';
import { IMMICH_API_KEY } from '$app/env/private';
import * as sdk from '@immich/sdk';
import type { RequestOpts } from '@oazapfts/runtime';

// Define immich SDK methods that will be wrapped by ImmichClient to have
// request opts injected.
const SDK_METHODS = ['getMapMarkers'] as const satisfies ReadonlyArray<keyof typeof sdk>;

type OmitOpts<T> = T extends (...args: [...infer P, RequestOpts?]) => infer R
	? (...args: P) => R
	: never;

type SdkMethods = {
	[K in (typeof SDK_METHODS)[number]]: OmitOpts<(typeof sdk)[K]>;
};

// Merge SdkMethods into ImmichClient type without a cast at call sites
export interface ImmichClient extends SdkMethods {}

export class ImmichClient {
	readonly baseUrl: string;
	readonly headers: Record<string, string>;

	constructor(host = IMMICH_HOST, apiKey = IMMICH_API_KEY) {
		this.baseUrl = host + '/api';
		this.headers = { 'x-api-key': apiKey };

		for (const name of SDK_METHODS) {
			this[name] = (...args: unknown[]) => sdk[name](...(args as [never]), this.opts());
		}
	}

	opts(): RequestOpts {
		return { baseUrl: this.baseUrl, headers: this.headers };
	}

	// Some API requests don't respond with JSON and aren't suitable for the sdk
	// client's JSON parsing. Stream the response, forwarding only a subset of
	// headers.
	async proxy(path: string, init?: RequestInit): Promise<Response> {
		const res = await fetch(`${this.baseUrl}${path}`, {
			...init,
			headers: { ...this.headers, ...init?.headers }
		});
		return new Response(res.body, {
			status: res.status,
			headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream' }
		});
	}
}
