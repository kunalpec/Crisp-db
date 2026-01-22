import ApiError from '../utils/ApiError.util.js';
import { sendEmail } from './sendEmail.util.js';

// High-level reusable email API
export const sendEmailApi = async ({ from, to, subject, html }) => {
  if (!from || !to || !subject || !html) {
    throw new ApiError(
      400,
      'from, to, subject and html are required'
    );
  }

  await sendEmail({
    from,
    to,
    subject,
    html,
  });

  return true;
};
