import nodemailer from "nodemailer";

export function buildAuroraEmailContent({ subscriber, status, appMeta }) {
  const subject = `[${appMeta.name}] ${status.summary.levelLabel} za ${status.summary.bestSite.name} veceras`;
  const text = [
    `${appMeta.name}`,
    `Autor: ${appMeta.author}`,
    "",
    `Procjena: ${status.summary.levelLabel}`,
    `Skor: ${status.summary.score}/100`,
    `Najbolja lokacija: ${status.summary.bestSite.name}`,
    `Preporuceni termin: ${status.summary.bestWindowLabel}`,
    "",
    `Kp: ${status.current.kpLabel}`,
    `Solarni vjetar: ${status.current.solarWindSpeedLabel}`,
    `Bz: ${status.current.bzLabel}`,
    `NOAA mapa: ${appMeta.mapSourceUrl}`,
    "",
    `Pretplata prag: ${subscriber.threshold}`
  ].join("\n");

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;color:#101a2d">
      <h1 style="margin-bottom:0">${appMeta.name}</h1>
      <p style="margin-top:6px;color:#5f6b84">Autor: ${appMeta.author}</p>
      <p><strong>Procjena:</strong> ${status.summary.levelLabel}</p>
      <p><strong>Skor:</strong> ${status.summary.score}/100</p>
      <p><strong>Najbolja lokacija:</strong> ${status.summary.bestSite.name}</p>
      <p><strong>Preporuceni termin:</strong> ${status.summary.bestWindowLabel}</p>
      <p><strong>Kp:</strong> ${status.current.kpLabel}<br />
      <strong>Solarni vjetar:</strong> ${status.current.solarWindSpeedLabel}<br />
      <strong>Bz:</strong> ${status.current.bzLabel}</p>
      <p><a href="${appMeta.mapSourceUrl}">NOAA aurora mapa</a></p>
    </div>
  `;

  return { subject, text, html };
}

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
