import path from 'node:path';
import { defineConfig } from 'vite';

// Build the background worker as a standalone Node entrypoint. This produces a
// plain JS bundle in build-worker/, with no runtime dependency on Vite.
//
// TODO: once email templates are written as .svelte components, add
// @sveltejs/vite-plugin-svelte's `svelte()` plugin here (with
// `compilerOptions: { generate: 'server' }`) so this build can compile them
// for use with `render()` from 'svelte/server'.
export default defineConfig({
	resolve: {
		alias: {
			// Mirrors SvelteKit's default $lib alias so worker code can import
			// shared modules from src/lib the same way the web app does.
			$lib: path.resolve('src/lib')
		}
	},
	build: {
		ssr: 'src/worker/entry.ts',
		outDir: 'build-worker',
		emptyOutDir: true
	}
});
