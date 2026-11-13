const nodemailer = require('nodemailer');

/**
 * Servicio de correo transaccional (confirmación de inscripción).
 * Requiere EMAIL_USER y EMAIL_PASS en .env. Con Gmail, EMAIL_PASS debe ser una
 * "contraseña de aplicación" (requiere verificación en dos pasos), no la contraseña normal.
 */

const EVENT = {
  name: '¼ Maratón Bolívar - Sucre',
  date: 'Sábado 9 de enero de 2027',
  warmup: '6:30 a.m.',
  start: '6:45 a.m.',
  location: 'Bolívar — Sucre, Santander - Colombia',
  whatsappDisplay: '+57 310 219 8939',
  whatsappUrl: 'https://wa.me/573102198939',
  contactName: 'Armando Marín',
};

const COLORS = {
  bg: '#16042E',
  card: '#2B0A52',
  border: '#4A178A',
  accent: '#FF0B53',
  cyan: '#00D2FF',
  white: '#FFFFFF',
  dim: '#E2E8F0',
  subtle: '#A39BB5',
};

const CATEGORY_LABELS = {
  elite_18: 'Élite 18+',
  elite_45: 'Élite 45+',
  recreativa_18: 'Recreativa 18+',
  recreativa_45: 'Recreativa 45+',
  '6k_abierta': '6K Abierta',
};

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) return null;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
}

/** Escapa datos del usuario antes de interpolarlos en HTML. */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function raceInfo(tipoCarrera) {
  return tipoCarrera === '6k_la_pena'
    ? { distance: '6K', route: 'La Peña → Sucre' }
    : { distance: '10.5K', route: 'Parque Bolívar → Sucre' };
}

const RECOMMENDATIONS = [
  ['👟', 'Calzado deportivo con buen agarre para carretera destapada y terreno rústico.'],
  ['☀️', 'Usa protector solar y gorra para el sol santandereano.'],
  ['💧', 'Lleva tu propia hidratación (habrá puntos de hidratación en la vía).'],
  ['⏰', `Llega puntual a las ${EVENT.warmup} para el calentamiento y la entrega de número.`],
  ['💬', `WhatsApp de atención: <a href="${EVENT.whatsappUrl}" style="color:${COLORS.cyan};font-weight:700;text-decoration:none;">${EVENT.whatsappDisplay}</a> (${EVENT.contactName}).`],
];

function buildConfirmationHtml({ codigo, nombreCompleto, distance, route, categoria }) {
  const c = COLORS;
  const font = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const label = `font-family:${font};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${c.subtle};padding-bottom:4px;`;
  const value = `font-family:${font};font-size:17px;font-weight:700;color:${c.white};`;

  const recRows = RECOMMENDATIONS.map(([icon, text]) => `
              <tr>
                <td width="34" valign="top" style="font-size:18px;line-height:24px;padding:6px 0;">${icon}</td>
                <td style="font-family:${font};font-size:14px;line-height:22px;color:${c.dim};padding:6px 0;">${text}</td>
              </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Confirmación de inscripción · ${EVENT.name}</title>
</head>
<body style="margin:0;padding:0;background:${c.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Tu dorsal digital: ${codigo} · ${distance} · ${EVENT.date}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.bg};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

          <!-- Encabezado -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="font-family:${font};font-size:12px;letter-spacing:4px;color:${c.accent};font-weight:800;">INSCRIPCIÓN CONFIRMADA</div>
              <div style="font-family:Impact,'Arial Narrow Bold',${font};font-size:30px;line-height:36px;color:${c.white};padding-top:8px;letter-spacing:1px;">${EVENT.name.toUpperCase()}</div>
              <div style="font-family:${font};font-size:14px;color:${c.subtle};padding-top:6px;">${EVENT.date} · Santander, Colombia</div>
            </td>
          </tr>

          <!-- Ticket / Dorsal -->
          <tr>
            <td style="background:${c.card};border:1px solid ${c.border};border-radius:20px;overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:6px;background:${c.accent};background-image:linear-gradient(90deg,${c.accent},${c.cyan});font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td align="center" style="padding:28px 24px 8px;">
                    <div style="${label}">Dorsal digital oficial</div>
                    <div style="font-family:'Courier New',monospace;font-size:34px;line-height:42px;font-weight:700;letter-spacing:3px;color:${c.white};background:${c.bg};border:2px dashed ${c.accent};border-radius:12px;padding:14px 18px;display:inline-block;margin-top:8px;">${codigo}</div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:18px 24px 4px;">
                    <div style="${label}">Atleta</div>
                    <div style="font-family:${font};font-size:22px;font-weight:800;color:${c.white};">${nombreCompleto}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px 4px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" valign="top" style="padding:10px 8px 10px 0;border-top:1px solid ${c.border};">
                          <div style="${label}">Distancia</div>
                          <div style="font-family:Impact,${font};font-size:30px;color:${c.accent};">${distance}</div>
                          <div style="font-family:${font};font-size:13px;color:${c.subtle};">${route}</div>
                        </td>
                        <td width="50%" valign="top" style="padding:10px 0 10px 8px;border-top:1px solid ${c.border};">
                          <div style="${label}">Categoría</div>
                          <div style="${value}">${categoria}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" valign="top" style="padding:10px 8px 10px 0;border-top:1px solid ${c.border};">
                          <div style="${label}">Calentamiento</div>
                          <div style="${value}">${EVENT.warmup}</div>
                        </td>
                        <td width="50%" valign="top" style="padding:10px 0 10px 8px;border-top:1px solid ${c.border};">
                          <div style="${label}">Salida</div>
                          <div style="${value}">${EVENT.start}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Perforación del ticket -->
                <tr>
                  <td style="padding:8px 0;">
                    <div style="border-top:2px dashed ${c.border};font-size:0;line-height:0;">&nbsp;</div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:6px 24px 24px;font-family:${font};font-size:13px;color:${c.subtle};">
                    Presenta este código el día de la carrera · ${EVENT.location}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Recomendaciones -->
          <tr>
            <td style="padding-top:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.card};border:1px solid ${c.border};border-radius:20px;">
                <tr>
                  <td style="padding:24px;">
                    <div style="font-family:${font};font-size:12px;letter-spacing:3px;font-weight:800;color:${c.cyan};padding-bottom:10px;">RECOMENDACIONES OFICIALES DE CARRERA</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${recRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA WhatsApp -->
          <tr>
            <td align="center" style="padding:28px 0 8px;">
              <a href="${EVENT.whatsappUrl}" style="display:inline-block;background:${c.accent};color:${c.white};font-family:${font};font-size:14px;font-weight:800;letter-spacing:1px;text-decoration:none;padding:14px 28px;border-radius:50px;">¿DUDAS? ESCRÍBENOS POR WHATSAPP</a>
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td align="center" style="padding:16px 12px 0;font-family:${font};font-size:12px;line-height:18px;color:${c.subtle};">
              ${EVENT.name} · ${EVENT.location}<br>
              Recibiste este correo porque te inscribiste en la carrera.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildConfirmationText({ codigo, nombreCompleto, distance, route, categoria }) {
  return [
    `INSCRIPCIÓN CONFIRMADA — ${EVENT.name}`,
    `${EVENT.date}`,
    '',
    `Código: ${codigo}`,
    `Atleta: ${nombreCompleto}`,
    `Distancia: ${distance} (${route})`,
    `Categoría: ${categoria}`,
    `Calentamiento: ${EVENT.warmup} · Salida: ${EVENT.start}`,
    '',
    'RECOMENDACIONES OFICIALES DE CARRERA',
    '- Calzado deportivo con buen agarre para carretera destapada y terreno rústico.',
    '- Usa protector solar y gorra para el sol santandereano.',
    '- Lleva tu propia hidratación (habrá puntos de hidratación en la vía).',
    `- Llega puntual a las ${EVENT.warmup} para el calentamiento y la entrega de número.`,
    `- WhatsApp de atención: ${EVENT.whatsappDisplay} (${EVENT.contactName}).`,
  ].join('\n');
}

/**
 * Envía el correo de confirmación con el dorsal digital.
 * @param {{ correo: string, nombre: string, apellidos: string, codigo_inscripcion: string,
 *           categoria: string, tipo_carrera: string }} inscripcion
 */
/**
 * Proveedor de envío. Brevo (API HTTPS) tiene prioridad si BREVO_API_KEY existe:
 * Render en plan gratuito bloquea los puertos SMTP, así que Gmail por SMTP no sale desde allí.
 */
function emailProvider() {
  if (process.env.BREVO_API_KEY) return 'brevo';
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) return 'gmail-smtp';
  return null;
}

/** Envía por la API HTTP de Brevo (https://developers.brevo.com/reference/sendtransacemail). */
async function sendWithBrevo({ to, subject, html, text }) {
  const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  if (!senderEmail) throw new Error('Falta EMAIL_FROM (correo remitente verificado en Brevo).');
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: EVENT.name, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Brevo respondió ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

async function deliver(message) {
  const provider = emailProvider();
  if (provider === 'brevo') return sendWithBrevo(message);
  if (provider === 'gmail-smtp') {
    return getTransporter().sendMail({ from: `"${EVENT.name}" <${process.env.EMAIL_USER}>`, ...message });
  }
  console.warn('⚠️  Correo no configurado (BREVO_API_KEY o EMAIL_USER/EMAIL_PASS): se omite el envío.');
  return null;
}

async function sendRegistrationConfirmation(inscripcion) {
  const { distance, route } = raceInfo(inscripcion.tipo_carrera);
  const data = {
    codigo: escapeHtml(inscripcion.codigo_inscripcion),
    nombreCompleto: escapeHtml(`${inscripcion.nombre} ${inscripcion.apellidos}`),
    distance,
    route,
    categoria: escapeHtml(CATEGORY_LABELS[inscripcion.categoria] || inscripcion.categoria),
  };

  return deliver({
    to: inscripcion.correo,
    subject: `✅ Inscripción confirmada · Dorsal ${inscripcion.codigo_inscripcion} · ${EVENT.name}`,
    html: buildConfirmationHtml(data),
    text: buildConfirmationText({
      ...data,
      nombreCompleto: `${inscripcion.nombre} ${inscripcion.apellidos}`,
      categoria: CATEGORY_LABELS[inscripcion.categoria] || inscripcion.categoria,
    }),
  });
}

/** Correo corto para comprobar desde el panel que el envío funciona en producción. */
async function sendTestEmail(to) {
  const provider = emailProvider();
  if (!provider) throw new Error('No hay proveedor de correo configurado en el servidor.');
  await deliver({
    to,
    subject: `Prueba de correo · ${EVENT.name}`,
    html: `<p>Este es un correo de prueba enviado desde el panel del organizador de la <strong>${EVENT.name}</strong>.</p><p>Si lo recibiste, los correos de confirmación están funcionando.</p>`,
    text: `Correo de prueba del panel del organizador de la ${EVENT.name}. Si lo recibiste, los correos de confirmación funcionan.`,
  });
  return provider;
}

module.exports = { sendRegistrationConfirmation, sendTestEmail, emailProvider, buildConfirmationHtml };
