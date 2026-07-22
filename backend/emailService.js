const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendReminderEmail(to, company, role, deadline) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `Reminder: ${company} deadline coming up`,
    text: `Your application for ${role} at ${company} has a deadline on ${deadline}. Don't miss it!`,
  });
}

module.exports = { sendReminderEmail };