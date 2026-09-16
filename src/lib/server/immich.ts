import { IMMICH_HOST } from '$app/env/public';
import { IMMICH_API_KEY } from '$app/env/private';
import { defaults } from '@immich/sdk';

defaults.baseUrl = IMMICH_HOST + '/api';
defaults.headers = { 'x-api-key': IMMICH_API_KEY };

export * from '@immich/sdk';
