const express = require('express');
const router = express.Router();

const { crearInscripcion, obtenerEstadisticas } = require('../controllers/registration.controller');
const { registrationRules, validate } = require('../middlewares/validator');
const { registrationLimiter } = require('../middlewares/rateLimiter');
const honeypot = require('../middlewares/honeypot');

/**
 * POST /api/inscripciones
 * Pipeline: Rate Limit → Honeypot → Validación → Controlador
 */
router.post(
  '/',
  registrationLimiter,
  honeypot,
  registrationRules,
  validate,
  crearInscripcion
);

/**
 * GET /api/inscripciones/stats
 * Estadísticas públicas de inscritos (sin rate limit estricto).
 */
router.get('/stats', obtenerEstadisticas);

module.exports = router;

