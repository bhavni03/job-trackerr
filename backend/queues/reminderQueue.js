const { Queue } = require('bullmq');

const connection = {
  host: 'localhost',
  port: 6379,
};

const reminderQueue = new Queue('reminderQueue', { connection });

module.exports = reminderQueue;