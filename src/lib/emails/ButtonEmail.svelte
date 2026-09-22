<script lang="ts">
	import { IMMICH_HOST } from '$app/env/public';
	import { Button, ImageCard } from '@immich/ui';

	const assetId = 'dac8f9ca-750a-4b2f-b4d5-0489ddbab355';
</script>

<table role="presentation" width="100%">
	<tbody>
		<tr>
			<td align="center">
				<table role="presentation" align="center">
					<tbody>
						<tr>
							<td style="padding-bottom: 8px;">
								<ImageCard
									item={{
										href: `/share/${assetId}`,
										src: `/assets/${assetId}`,
										title: '',
										alt: ''
									}}
								/>
							</td>
						</tr>
						<tr>
							<td style="padding-bottom: 8px; text-align: center;">
								<Button color="primary" shape="semi-round" href={`/share/${assetId}`} fullWidth
									>Share</Button
								>
							</td>
						</tr>
						<tr>
							<td style="padding-bottom: 8px; text-align: center;">
								<Button color="secondary" variant="ghost" shape="semi-round" href={'/'} fullWidth
									>More suggestions</Button
								>
							</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>
