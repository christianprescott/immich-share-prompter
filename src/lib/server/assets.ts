import ImmichClient from '$lib/server/immich';
import { mdiMap, mdiAccountOutline, mdiImageMultipleOutline } from '@mdi/js';
import { AssetTypeEnum } from '@immich/sdk';
import type { CarouselImageItem } from '@immich/ui';

export async function getSuggestedAssets() {
	const client = new ImmichClient();
	const createdDate = new Date();
	createdDate.setDate(createdDate.getDate() - 120);
	const assetsFromAlbum = client
		.getAllAlbums({})
		.then((albums) =>
			albums
				.filter(
					// Filter for recent and non-empty albums
					(album) => album.assetCount > 0 && album.endDate && new Date(album.endDate) > createdDate
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
			client.searchRandom({
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
	const assetsFromPlace = client
		.searchRandom({
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
		})
		.then((assets) =>
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
	const assetsWithPeopleNotInAlbum = client
		.searchRandom({
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
		})
		.then((assets) =>
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
