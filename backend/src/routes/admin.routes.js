const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validator');
const { requireAdmin } = require('../middlewares/adminAuth');
const { login, listar, actualizar, eliminar } = require('../controllers/admin.controller');

const router = express.Router();

/** Anti fuerza bruta: 10 intentos de login por IP cada 15 minutos. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Demasiados intentos. Espera 15 minutos.' },
});

const LETTERS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const idRule = param('id').isUUID().withMessage('ID inválido');

const updateRules = [
  idRule,
  body('nombre').optional().trim().isLength({ min: 2, max: 100 }).matches(LETTERS).withMessage('Nombre inválido'),
  body('apellidos').optional().trim().isLength({ min: 2, max: 100 }).matches(LETTERS).withMessage('Apellidos inválidos'),
  body('cedula').optional({ values: 'null' }).trim()
    .custom((v) => v === '' || /^\d{5,12}$/.test(v)).withMessage('La cédula debe tener entre 5 y 12 dígitos'),
  body('fecha_nacimiento').optional().isISO8601().withMessage('Fecha inválida'),
  body('correo').optional().trim().isEmail().withMessage('Correo inválido').normalizeEmail().isLength({ max: 150 }),
  body('celular').optional().trim().matches(/^3\d{9}$/).withMessage('Celular inválido (10 dígitos, inicia con 3)'),
  body('ciudad_municipio').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Ciudad inválida'),
  body('genero').optional().isIn(['masculino', 'femenino']).withMessage('Género inválido'),
  body('categoria').optional()
    .isIn(['elite_18', 'elite_45', 'recreativa_18', 'recreativa_45', '6k_abierta']).withMessage('Categoría inválida'),
  body('estado').optional().isIn(['pendiente', 'confirmado', 'cancelado']).withMessage('Estado inválido'),
];

router.post(
  '/login',
  loginLimiter,
  body('usuario').isString().trim().notEmpty(),
  body('contrasena').isString().notEmpty(),
  validate,
  login,
);

router.use('/inscripciones', requireAdmin);
router.get('/inscripciones', listar);
router.put('/inscripciones/:id', updateRules, validate, actualizar);
router.delete('/inscripciones/:id', idRule, validate, eliminar);

module.exports = router;
