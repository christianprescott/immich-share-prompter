// Stub for SvelteKit's `$app/state` virtual module, aliased in
// vite.worker.config.ts. The worker renders emails outside of a SvelteKit
// request context, so this only needs to satisfy imports pulled in
// transitively by unused @immich/ui components (e.g. NavbarItem, which reads
// `page.url.pathname` but is never rendered by our email templates).
export const page = {
	url: new URL('http://localhost/')
};
