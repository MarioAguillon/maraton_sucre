const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter para el endpoint de inscripción.
 * Máximo 5 solicitudes por IP cada 15 minutos.
 * Previene abuso, spam y ataques de fuerza bruta.
 */
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta dirección IP. Intenta de nuevo en 15 minutos.',
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

/**
 * Rate Limiter global para toda la API.
 * Máximo 100 solicitudes por IP por minuto.
 */
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo en un momento.',
  },
});

module.exports = { registrationLimiter, globalLimiter };

