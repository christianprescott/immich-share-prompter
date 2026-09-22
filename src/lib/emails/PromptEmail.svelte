<script lang="ts">
	import { Button, ImageCard } from '@immich/ui';

	const { asset } = $props();
</script>

<table role="presentation" width="100%">
	<tbody>
		<tr>
			<td align="center">
				<table role="presentation" align="center">
					<tbody>
						<tr>
							<td style="padding-bottom: 8px; text-align: center;">
								<ImageCard
									item={{
										href: asset.href,
										src: asset.src,
										title: '',
										alt: ''
									}}
								/>
							</td>
						</tr>
						<tr>
							<td style="padding-bottom: 8px; text-align: center;">
								<Button color="primary" shape="semi-round" href={asset.href} fullWidth>Share</Button
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
