import nodemailer from "nodemailer";
import { buildAuroraEmailContent } from "./emailContent.js";

export { buildAuroraEmailContent } from "./emailContent.js";

export function createTransporter(smtp) {
  if (!smtp.host || !smtp.user || !smtp.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    }
  });
}

export async function sendAuroraEmail({ transporter, smtpFrom, to, subscriber, status, appMeta }) {
  const { subject, text, html } = buildAuroraEmailContent({ subscriber, status, appMeta });

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    text,
    html
  });
}
