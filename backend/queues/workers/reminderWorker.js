const { Worker } = require('bullmq');
const { sendReminderEmail } = require('../../emailService');

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : { host: 'localhost', port: 6379 };

const reminderWorker = new Worker(
  'reminderQueue',
  async (job) => {
    const { email, company, role, deadline } = job.data;

    console.log(`Processing reminder for ${company} - ${role}`);

    await sendReminderEmail(email, company, role, deadline);

    console.log(`Email sent for ${company}`);
  },
  { connection }
);

reminderWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

reminderWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

module.exports = reminderWorker;