const { body, validationResult } = require('express-validator');

/**
 * Reglas de validación para el formulario de inscripción.
 * Cada campo es obligatorio y se sanitiza contra inyecciones.
 */
const registrationRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/).withMessage('El nombre solo puede contener letras')
    .escape(),

  body('apellidos')
    .trim()
    .notEmpty().withMessage('Los apellidos son obligatorios')
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/).withMessage('Los apellidos solo pueden contener letras')
    .escape(),

  body('fecha_nacimiento')
    .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
    .isISO8601().withMessage('Formato de fecha inválido')
    .custom((value) => {
      const birthDate = new Date(value);
      const eventDate = new Date('2027-01-09');
      const age = eventDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = eventDate.getMonth() - birthDate.getMonth();
      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())
        ? age - 1
        : age;
      if (adjustedAge < 18) {
        throw new Error('Debes tener al menos 18 años al día del evento (9 de Enero 2027)');
      }
      return true;
    }),

  body('correo')
    .trim()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Formato de correo electrónico inválido')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('El correo no puede exceder 150 caracteres'),

  body('celular')
    .trim()
    .notEmpty().withMessage('El número de celular es obligatorio')
    .matches(/^3\d{9}$/).withMessage('El celular debe ser un número colombiano válido (10 dígitos, inicia con 3)'),

  body('ciudad_municipio')
    .trim()
    .notEmpty().withMessage('La ciudad o municipio es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('La ciudad debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-\.]+$/).withMessage('La ciudad contiene caracteres no permitidos')
    .escape(),

  body('genero')
    .trim()
    .notEmpty().withMessage('El género es obligatorio')
    .isIn(['masculino', 'femenino']).withMessage('Género debe ser masculino o femenino'),

  body('categoria')
    .trim()
    .notEmpty().withMessage('La categoría es obligatoria')
    .isIn([
      'elite_18',
      'elite_45',
      'recreativa_18',
      'recreativa_45',
      '6k_abierta'
    ]).withMessage('Categoría inválida'),
];

/**
 * Middleware que evalúa los resultados de la validación.
 * Si hay errores, responde con 422 y la lista de errores.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map((err) => ({
        campo: err.path,
        mensaje: err.msg,
      })),
    });
  }
  next();
};

module.exports = { registrationRules, validate };

