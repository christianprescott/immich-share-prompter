import nodemailer from 'nodemailer';
import type { NodemailerError } from 'nodemailer';
import { fail } from '@sveltejs/kit';
import { mdiOpenInNew } from '@mdi/js';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } from '$app/env/private';
import { IMMICH_HOST, SMTP_TO } from '$app/env/public';
import PromptEmail from '$lib/emails/PromptEmail.svelte';
import { renderEmail } from '$lib/server/render-email';
import { getSuggestedAssets } from '$lib/server/assets';

export const actions = {
	default: async () => {
		const transport = nodemailer.createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS
			}
		});

		try {
			const assets = await getSuggestedAssets();

			const html = await renderEmail(PromptEmail, { asset: assets[0] });
			await transport.sendMail({
				from: SMTP_FROM,
				to: SMTP_TO,
				subject: 'Test email',
				text: `Testing the @immich/ui Button email. View your Immich instance: ${IMMICH_HOST}`,
				html
			});
		} catch (e) {
			console.error(e);
			// https://nodemailer.com/errors
			return fail(422, { error: (e as NodemailerError).message ?? 'Send failed.' });
		}

		return { success: true };
	}
};
