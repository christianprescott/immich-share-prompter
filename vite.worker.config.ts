import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Build the background worker as a standalone Node entrypoint. This produces a
// plain JS bundle in build-worker/, with no runtime dependency on Vite.
export default defineConfig({
	plugins: [tailwindcss(), svelte()],
	resolve: {
		alias: {
			// Mock SvelteKit paths
			$lib: path.resolve('src/lib'),
			// Stub SvelteKit paths imported by @immich/ui components. The worker
			// doesn't currently use these components.
			'$app/environment': path.resolve('src/worker/stubs/app-environment.ts'),
			'$app/navigation': path.resolve('src/worker/stubs/app-navigation.ts'),
			'$app/state': path.resolve('src/worker/stubs/app-state.ts')
		}
	},
	build: {
		ssr: 'src/worker/entry.ts',
		outDir: 'build-worker',
		emptyOutDir: true
	}
});
