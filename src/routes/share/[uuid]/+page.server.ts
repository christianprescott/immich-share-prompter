import path from 'node:path';
import { Readable } from 'node:stream';
import nodemailer from 'nodemailer';
import { redirect } from '@sveltejs/kit';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO } from '$app/env/private';
import { ImmichClient } from '$lib/server/immich';

export const actions = {
	default: async ({ params, request }) => {
		const data = await request.formData();

		const client = new ImmichClient();
		const [asset, res] = await Promise.all([
			client.getAssetInfo({ id: params.uuid }),
			client.proxy(`/assets/${params.uuid}/thumbnail?size=preview`)
		]);
		const ext = path.extname(asset.originalFileName);

		const transport = nodemailer.createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS
			}
		});
		await transport.sendMail({
			from: SMTP_FROM,
			to: SMTP_TO,
			subject: 'Share',
			text: `A photo from ${data.get('name')} is attached.`,
			html: `A photo from ${data.get('name')} is attached.`,
			attachments: [
				{
					filename: `photo${ext}`,
					content: Readable.fromWeb(res.body)
				}
			]
		});
		redirect(303, '/');
	}
};
