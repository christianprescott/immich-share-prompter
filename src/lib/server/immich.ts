import * as sdk from '@immich/sdk';
import { AssetTypeEnum } from '@immich/sdk';
import type { CarouselImageItem } from '@immich/ui';
import type { RequestOpts } from '@oazapfts/runtime';
import { mdiMap, mdiAccountOutline, mdiImageMultipleOutline } from '@mdi/js';

// Define immich SDK methods that will be wrapped by ImmichClient to have
// request opts injected.
const SDK_METHODS = [
	'getAllAlbums',
	'getAssetsByCity',
	'getAssetInfo',
	'searchAssets',
	'searchRandom'
] as const satisfies ReadonlyArray<keyof typeof sdk>;

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

	constructor(host: String, apiKey: String) {
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

	async getSuggestedAssets(): Promise<CarouselImageItem[]> {
		const createdDate = new Date();
		createdDate.setDate(createdDate.getDate() - 120);
		const assetsFromAlbum = this.getAllAlbums({})
			.then((albums) =>
				albums
					.filter(
						// Filter for recent and non-empty albums
						(album) =>
							album.assetCount > 0 && album.endDate && new Date(album.endDate) > createdDate
					)
					.sort(
						// Most recent first
						(a, b) =>
							new Date(b.endDate ?? b.createdAt).getTime() -
							new Date(a.endDate ?? a.createdAt).getTime()
					)
					.slice(0, 3)
			)
			.then((recentAlbums) =>
				this.searchRandom({
					randomSearchDto: {
						size: 3,
						filter: {
							type: { eq: AssetTypeEnum.Image },
							createdAt: { gt: createdDate.toISOString() },
							trashedAt: { eq: null },
							albumIds: { any: recentAlbums.map((a) => a.id) }
						}
					}
				})
			)
			.then((assets) =>
				assets.map(
					(a) =>
						({
							href: `/share/${a.id}`,
							src: `/assets/${a.id}`,
							leftIcons: [mdiImageMultipleOutline]
						}) as CarouselImageItem
				)
			);
		const assetsFromPlace = this.searchRandom({
			randomSearchDto: {
				size: 3,
				withExif: true,
				filter: {
					type: { eq: AssetTypeEnum.Image },
					createdAt: { gt: createdDate.toISOString() },
					trashedAt: { eq: null },
					city: { ne: null }
				}
			}
		}).then((assets) =>
			assets.map(
				(a) =>
					({
						title: a.exifInfo?.city,
						href: `/share/${a.id}`,
						src: `/assets/${a.id}`,
						leftIcons: [mdiMap]
					}) as CarouselImageItem
			)
		);
		const assetsWithPeopleNotInAlbum = this.searchRandom({
			randomSearchDto: {
				size: 3,
				withPeople: true,
				filter: {
					type: { eq: AssetTypeEnum.Image },
					createdAt: { gt: createdDate.toISOString() },
					trashedAt: { eq: null },
					hasAlbums: { eq: false },
					hasPeople: { eq: true }
				}
			}
		}).then((assets) =>
			assets.map(
				(a) =>
					({
						href: `/share/${a.id}`,
						src: `/assets/${a.id}`,
						leftIcons: [mdiAccountOutline]
					}) as CarouselImageItem
			)
		);
		return Promise.all([assetsFromAlbum, assetsFromPlace, assetsWithPeopleNotInAlbum]).then(
			(allAssets) => allAssets.reduce((acc, assets) => acc.concat(assets))
		);
	}
}

export default ImmichClient;
