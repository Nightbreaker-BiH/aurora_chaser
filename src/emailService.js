import nodemailer from "nodemailer";

export function buildAuroraEmailContent({ subscriber, status, appMeta }) {
  const resolvedAppMeta = {
    name: appMeta?.name || "AuroraChaser",
    author: appMeta?.author || "Alan Catovic",
    mapSourceUrl: appMeta?.mapSourceUrl || "https://www.swpc.noaa.gov/products/aurora-30-minute-forecast"
  };
  const summary = status?.summary || {};
  const current = status?.current || {};
  const bestSiteName = summary.bestSite?.name || summary.bestSiteName || "n/a";
  const levelLabel = summary.levelLabel || summary.level || "n/a";
  const scoreLabel = Number.isFinite(Number(summary.score)) ? `${summary.score}/100` : "n/a";
  const bestWindowLabel = summary.bestWindowLabel || "n/a";
  const kpLabel = current.kpLabel || "n/a";
  const solarWindLabel = current.solarWindSpeedLabel || "n/a";
  const bzLabel = current.bzLabel || "n/a";
  const thresholdLabel = subscriber?.threshold || "n/a";

  const subject = `[${resolvedAppMeta.name}] ${levelLabel} za ${bestSiteName} veceras`;
  const text = [
    `${resolvedAppMeta.name}`,
    `Autor: ${resolvedAppMeta.author}`,
    "",
    `Procjena: ${levelLabel}`,
    `Skor: ${scoreLabel}`,
    `Najbolja lokacija: ${bestSiteName}`,
    `Preporuceni termin: ${bestWindowLabel}`,
    "",
    `Kp: ${kpLabel}`,
    `Solarni vjetar: ${solarWindLabel}`,
    `Bz: ${bzLabel}`,
    `NOAA mapa: ${resolvedAppMeta.mapSourceUrl}`,
    "",
    `Pretplata prag: ${thresholdLabel}`
  ].join("\n");

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;color:#101a2d">
      <h1 style="margin-bottom:0">${resolvedAppMeta.name}</h1>
      <p style="margin-top:6px;color:#5f6b84">Autor: ${resolvedAppMeta.author}</p>
      <p><strong>Procjena:</strong> ${levelLabel}</p>
      <p><strong>Skor:</strong> ${scoreLabel}</p>
      <p><strong>Najbolja lokacija:</strong> ${bestSiteName}</p>
      <p><strong>Preporuceni termin:</strong> ${bestWindowLabel}</p>
      <p><strong>Kp:</strong> ${kpLabel}<br />
      <strong>Solarni vjetar:</strong> ${solarWindLabel}<br />
      <strong>Bz:</strong> ${bzLabel}</p>
      <p><a href="${resolvedAppMeta.mapSourceUrl}">NOAA aurora mapa</a></p>
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
