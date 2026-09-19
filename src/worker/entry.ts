import { Cron } from 'croner';
import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO } = process.env;
const transport = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	auth: { user: SMTP_USER, pass: SMTP_PASS }
});

async function sendPrompt() {
	try {
		await transport.sendMail({
			from: SMTP_FROM,
			to: SMTP_TO,
			subject: 'Share a recent photo!',
			text: 'http://192.168.1.100:5173/'
		});
		console.log('[worker] reminder email sent');
	} catch (e) {
		console.error('[worker] failed to send reminder email', e);
	}
}

async function maybeSendPrompt() {
	// Until notifications are tracked in data store, use a random number to run
	// about once every two days.
	const roll = Math.random();
	if (roll < 1 / 48) {
		await sendPrompt();
	}
}

const job = new Cron('5 * * * *', { protect: true }, maybeSendPrompt);
console.log(`[worker] started, next run at ${job.nextRun()?.toISOString()}`);
