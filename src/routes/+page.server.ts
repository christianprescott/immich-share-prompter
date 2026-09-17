import ImmichClient from '$lib/server/immich';

export async function load() {
	const client = new ImmichClient();
	const assetsFromPlace = client
		.searchRandom({
			randomSearchDto: {
				size: 3,
				withExif: true,
				filter: {
					type: { eq: AssetTypeEnum.Image },
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
						rightIcons: [mdiMap]
					}) as CarouselImageItem
			)
		);
	const markers = await client.getMapMarkers({});
	return {
		assets: assetsFromPlace,
		cities: [...new Set(markers.map((m) => m.city).filter((c) => !!c))]
	};
}
