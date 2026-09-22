import { Cron } from 'croner';
import sendPrompt from './sendPrompt.ts';

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
