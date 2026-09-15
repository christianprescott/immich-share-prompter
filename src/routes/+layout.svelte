<script lang="ts">
	import '../app.css';

	import favicon from '$lib/assets/favicon.svg';
	import {
		AppShell,
		AppShellHeader,
		Button,
		Constants,
		Logo,
		ThemeSwitcher,
		TooltipProvider
	} from '@immich/ui';
	import { mdiOpenInNew } from '@mdi/js';
	import { siGithub } from 'simple-icons';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<TooltipProvider>
	<AppShell>
		<AppShellHeader>
			<div class="w-full">
				<nav class="flex justify-between p-2 lg:gap-2">
					<div class="flex place-items-center gap-2">
						<a href="/" class="flex gap-2 text-4xl">
							<Logo variant="inline" />
						</a>
					</div>
					<div class="flex place-items-center justify-end gap-2">
						<Button
							leadingIcon={siGithub.path}
							trailingIcon={mdiOpenInNew}
							color="secondary"
							variant="ghost"
						>
							GitHub
						</Button>
						<ThemeSwitcher />
					</div>
				</nav>
			</div>
		</AppShellHeader>

		{@render children()}
	</AppShell>
</TooltipProvider>
