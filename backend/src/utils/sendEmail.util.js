import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app password
  },
});

// Low-level email sender
export const sendEmail = async ({ from, to, subject, html }) => {
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
};
