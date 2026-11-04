/**
 * Middleware Honeypot Anti-Bot.
 * 
 * El formulario incluye un campo oculto llamado "website" (CSS display:none).
 * Los bots suelen rellenar todos los campos, incluidos los ocultos.
 * Si el campo "website" tiene valor, se rechaza la solicitud silenciosamente.
 */
const honeypot = (req, res, next) => {
  if (req.body.website && req.body.website.trim() !== '') {
    console.warn(`🤖 Bot detectado desde IP: ${req.ip} — Campo honeypot rellenado.`);
    // Responder con 200 para no delatar la protección
    return res.status(200).json({
      success: true,
      message: 'Inscripción registrada exitosamente',
    });
  }

  // Limpiar el campo honeypot del body antes de continuar
  delete req.body.website;
  next();
};

module.exports = honeypot;

