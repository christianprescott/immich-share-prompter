<script lang="ts">
	import '../app.css';

	import favicon from '$lib/assets/favicon.svg';
	import envelope from '$lib/assets/envelope.svg?raw';
	import { Button, Logo, ThemeSwitcher, TooltipProvider } from '@immich/ui';
	import { mdiOpenInNew } from '@mdi/js';
	import { siGithub } from 'simple-icons';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<TooltipProvider>
	<!-- @immich/ui AppShell was previously used here, but that component uses an
  unusual on mount approach that caused delayed rendering. -->
	<div class="flex h-dvh flex-col overflow-hidden">
		<header class="min-h-control-bar-container flex items-center gap-2 border-b">
			<div class="w-full">
				<nav class="flex justify-between p-2 lg:gap-2">
					<div class="flex place-items-center gap-2">
						<a href="/" class="flex gap-2 text-4xl group">
							<div class="relative size-12">
								<div class="absolute inset-0 size-full">
									{@html envelope}
								</div>
								<svg viewBox="0 0 24 24" class="absolute inset-0 size-full overflow-visible">
									<foreignObject
										width="24"
										height="24"
										class="overflow-visible"
										clip-path="url(#envelope-clip)"
									>
										<div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%">
											<Logo
												variant="icon"
												class="size-full transition-transform translate-y-0 group-hover:-translate-y-1.5"
											/>
										</div>
									</foreignObject>
								</svg>
							</div>
						</a>
					</div>
					<div class="flex place-items-center justify-end gap-2">
						<Button
							href="https://github.com/christianprescott/immich-share-prompter"
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
		</header>

		<div class="relative flex w-full grow overflow-y-auto">
			{@render children()}
		</div>
	</div>
</TooltipProvider>
