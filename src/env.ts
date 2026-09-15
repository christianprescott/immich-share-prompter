import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	IMMICH_API_KEY: {},
	IMMICH_HOST: { public: true }
});
