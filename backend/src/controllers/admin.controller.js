const supabaseAdmin = require('../config/supabase-admin');
const { issueToken, checkCredentials } = require('../middlewares/adminAuth');

const EDITABLE_FIELDS = [
  'nombre', 'apellidos', 'cedula', 'fecha_nacimiento', 'correo', 'celular',
  'ciudad_municipio', 'genero', 'categoria', 'estado',
];

function edadAlEvento(fechaNacimiento) {
  const birth = new Date(fechaNacimiento);
  const event = new Date('2027-01-09');
  let age = event.getFullYear() - birth.getFullYear();
  const m = event.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && event.getDate() < birth.getDate())) age--;
  return age;
}

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

/** PUT /api/admin/inscripciones/:id */
const actualizar = async (req, res) => {
  const changes = {};
  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) changes[field] = req.body[field];
  }
  if (changes.cedula === '') changes.cedula = null;

  // Campos derivados
  if (changes.fecha_nacimiento) changes.edad_al_evento = edadAlEvento(changes.fecha_nacimiento);
  if (changes.categoria) {
    const es6k = changes.categoria === '6k_abierta';
    changes.tipo_carrera = es6k ? '6k_la_pena' : 'cuarto_maraton';
    changes.valor_inscripcion = es6k ? 0 : 30000;
  }

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

module.exports = { login, listar, actualizar, eliminar };
