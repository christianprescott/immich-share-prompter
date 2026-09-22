// Stub for SvelteKit's `$app/navigation` virtual module, aliased in
// vite.worker.config.ts. The worker renders emails outside of a SvelteKit
// request context, so these are unused no-ops satisfying imports pulled in
// transitively by @immich/ui components.
export function afterNavigate() {}

export function goto(): Promise<void> {
	throw new Error('goto() is not supported in the worker');
}
