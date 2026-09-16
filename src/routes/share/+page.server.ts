import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO } from '$app/env/private';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
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
			text: 'share',
			html: '<strong>share</strong> ' + data.get('name')
		});
	}
};
