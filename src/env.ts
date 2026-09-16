import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	IMMICH_API_KEY: {},
	IMMICH_HOST: { public: true },
	SMTP_HOST: {},
	SMTP_PORT: {},
	SMTP_USER: {},
	SMTP_PASS: {},
	SMTP_FROM: {},
	SMTP_TO: {}
});
