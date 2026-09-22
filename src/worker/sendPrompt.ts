import nodemailer from 'nodemailer';
import { getSuggestedAssets } from '$lib/server/assets';
import { renderEmail } from '$lib/server/render-email';
import PromptEmail from '$lib/emails/PromptEmail.svelte';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO } = process.env;
const transport = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	auth: { user: SMTP_USER, pass: SMTP_PASS }
});

export default async function sendPrompt() {
	try {
		const assets = await getSuggestedAssets();

		const html = await renderEmail(PromptEmail, { asset: assets[0] });
		await transport.sendMail({
			from: SMTP_FROM,
			to: SMTP_TO,
			subject: 'Share a recent photo!',
			text: `${IMMICH_HOST}`,
			html
		});
		console.log('[worker] reminder email sent');
	} catch (e) {
		console.error('[worker] failed to send reminder email', e);
	}
}
