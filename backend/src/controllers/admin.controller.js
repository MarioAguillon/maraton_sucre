const supabaseAdmin = require('../config/supabase-admin');
const { issueToken, checkCredentials } = require('../middlewares/adminAuth');
const { sendRegistrationConfirmation, sendTestEmail } = require('../services/email.service');
const { edadAlEvento, generarCodigoInscripcion, datosCarrera } = require('../utils/inscripcion');

const EDITABLE_FIELDS = [
  'nombre', 'apellidos', 'cedula', 'fecha_nacimiento', 'correo', 'celular',
  'ciudad_municipio', 'genero', 'categoria', 'estado',
];

/** POST /api/admin/login */
const login = (req, res) => {
  const { usuario, contrasena } = req.body || {};
  if (!checkCredentials(usuario, contrasena)) {
    return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
  }
  const session = issueToken(usuario);
  return res.json({ success: true, data: { ...session, usuario } });
};

/** GET /api/admin/inscripciones */
const listar = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('inscripciones')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ [Admin] Error listando:', error);
    return res.status(500).json({ success: false, message: 'No se pudieron cargar las inscripciones.' });
  }
  return res.json({ success: true, data });
};

/**
 * POST /api/admin/inscripciones
 * Inscripción manual desde el panel (p. ej. atletas que se inscriben en persona).
 * Envía el correo de confirmación salvo que `enviar_correo` sea false.
 */
const crear = async (req, res) => {
  const inscripcion = {};
  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) inscripcion[field] = req.body[field];
  }
  if (!inscripcion.cedula) inscripcion.cedula = null;
  const es6k = inscripcion.categoria === '6k_abierta';
  Object.assign(inscripcion, datosCarrera(inscripcion.categoria), {
    edad_al_evento: edadAlEvento(inscripcion.fecha_nacimiento),
    estado: inscripcion.estado || (es6k ? 'confirmado' : 'pendiente'),
  });

  // Reintenta si el código aleatorio coincide con uno existente (muy improbable).
  let data;
  let error;
  for (let intento = 0; intento < 3; intento++) {
    ({ data, error } = await supabaseAdmin
      .from('inscripciones')
      .insert([{ ...inscripcion, codigo_inscripcion: generarCodigoInscripcion() }])
      .select()
      .single());
    const codigoRepetido = error?.code === '23505' && String(error.message).includes('codigo_inscripcion');
    if (!codigoRepetido) break;
  }

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'El correo o la cédula ya pertenecen a otro atleta.' });
    }
    console.error('❌ [Admin] Error creando:', error);
    return res.status(500).json({ success: false, message: 'No se pudo crear el registro.' });
  }

  if (req.body.enviar_correo !== false) {
    sendRegistrationConfirmation(data).catch((mailError) => {
      console.error(`❌ [Admin] Error enviando correo a ${data.correo}:`, mailError.message);
    });
  }

  return res.status(201).json({ success: true, data });
};

/**
 * POST /api/admin/correo-prueba
 * Envía un correo de prueba y espera el resultado, para diagnosticar el envío en producción.
 */
const correoPrueba = async (req, res) => {
  try {
    const provider = await sendTestEmail(req.body.correo);
    return res.json({ success: true, message: `Correo de prueba enviado a ${req.body.correo} (vía ${provider}).` });
  } catch (err) {
    console.error('❌ [Admin] Falló el correo de prueba:', err.message);
    return res.status(502).json({ success: false, message: `No se pudo enviar: ${err.message}` });
  }
};

/** PUT /api/admin/inscripciones/:id */
const actualizar = async (req, res) => {
  const changes = {};
  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) changes[field] = req.body[field];
  }
  if (changes.cedula === '') changes.cedula = null;

  // Campos derivados
  if (changes.fecha_nacimiento) changes.edad_al_evento = edadAlEvento(changes.fecha_nacimiento);
  if (changes.categoria) Object.assign(changes, datosCarrera(changes.categoria));

  if (Object.keys(changes).length === 0) {
    return res.status(400).json({ success: false, message: 'No hay campos para actualizar.' });
  }

  const { data, error } = await supabaseAdmin
    .from('inscripciones')
    .update(changes)
    .eq('id', req.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'El correo o la cédula ya pertenecen a otro atleta.' });
    }
    console.error('❌ [Admin] Error actualizando:', error);
    return res.status(500).json({ success: false, message: 'No se pudo actualizar el registro.' });
  }
  if (!data) return res.status(404).json({ success: false, message: 'Registro no encontrado.' });

  return res.json({ success: true, data });
};

/** DELETE /api/admin/inscripciones/:id */
const eliminar = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('inscripciones')
    .delete()
    .eq('id', req.params.id)
    .select('id');

  if (error) {
    console.error('❌ [Admin] Error eliminando:', error);
    return res.status(500).json({ success: false, message: 'No se pudo eliminar el registro.' });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ success: false, message: 'Registro no encontrado.' });
  }
  return res.json({ success: true, data: { id: req.params.id } });
};

module.exports = { login, listar, crear, actualizar, eliminar, correoPrueba };
