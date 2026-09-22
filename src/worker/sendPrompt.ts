import nodemailer from 'nodemailer';
import ImmichClient from '$lib/server/immich';
import { renderEmail } from '$lib/server/render-email';
import PromptEmail from '$lib/emails/PromptEmail.svelte';

const {
	APP_HOST,
	IMMICH_HOST,
	IMMICH_API_KEY,
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
	SMTP_FROM,
	SMTP_TO
} = process.env;
const transport = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	auth: { user: SMTP_USER, pass: SMTP_PASS }
});

export default async function sendPrompt() {
	try {
		const assets = await new ImmichClient(IMMICH_HOST, IMMICH_API_KEY).getSuggestedAssets();

		const html = await renderEmail(APP_HOST, PromptEmail, { asset: assets[0] });
		await transport.sendMail({
			from: SMTP_FROM,
			to: SMTP_TO,
			subject: 'Share a photo!',
			text: `Ready to share a recent photo? ${APP_HOST + assets[0]?.href}\n\nMore suggestions ${APP_HOST}`,
			html
		});
		console.log('[worker] reminder email sent');
	} catch (e) {
		console.error('[worker] failed to send reminder email', e);
	}
}
