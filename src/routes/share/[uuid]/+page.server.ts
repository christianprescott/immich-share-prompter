import path from 'node:path';
import { Readable } from 'node:stream';
import nodemailer from 'nodemailer';
import type { NodemailerError } from 'nodemailer';
import { fail, redirect } from '@sveltejs/kit';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO } from '$app/env/private';
import ImmichClient from '$lib/server/immich';

export const actions = {
	default: async ({ params, request }) => {
		const data = await request.formData();

		const client = new ImmichClient();
		const [asset, res] = await Promise.all([
			client.getAssetInfo({ id: params.uuid }),
			client.proxy(`/assets/${params.uuid}/thumbnail?size=preview`)
		]);
		const ext = path.extname(asset.originalFileName);

		const toEmail = data.get('to')?.toString();
		const transport = nodemailer.createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS
			}
		});
		try {
			await transport.sendMail({
				from: SMTP_FROM,
				to: toEmail,
				attachments: [
					{
						filename: `photo${ext}`,
						content: Readable.fromWeb(res.body)
					}
				]
			});
		} catch (e) {
			console.error(e);
			// https://nodemailer.com/errors
			switch ((e as NodemailerError).code) {
				case 'ECONNECTION':
				case 'ETIMEDOUT':
				case 'EDNS':
				case 'ETLS':
				case 'EAUTH':
				case 'ENOAUTH':
					return fail(422, {
						to: toEmail,
						error: `Email connection error. Make sure your SMTP host is correct and your API key is valid.`
					});
				case 'EENVELOPE':
				case 'EMESSAGE':
				case 'EFILEACCESS':
				case 'EURLACCESS':
				case 'EFETCH':
					return fail(422, {
						to: toEmail,
						error: `Failed to form email message.`
					});
				default:
					return fail(422, {
						to: toEmail,
						error: 'Send failed.'
					});
			}
		}

		redirect(303, '/');
	}
};
