// Stub for SvelteKit's `$app/environment` virtual module, aliased in
// vite.worker.config.ts. The worker renders emails outside of a SvelteKit
// request context, so `browser` is always false here.
export const browser = false;
export const building = false;
export const dev = false;
export const version = '';
