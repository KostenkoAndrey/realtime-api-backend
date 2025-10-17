import { Resend } from 'resend';
import { getEnvVar } from '../utils/getEnvVar.js';

const resend = new Resend(getEnvVar('RESEND_API_KEY'));

export const resendEmail = async ({ from, to, subject, html }) => {
  const data = await resend.emails.send({ from, to, subject, html });
  return data;
};
