const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Calcula la categoría por edad basándose en la fecha del evento (9 Ene 2027).
 */
function calcularEdadAlEvento(fechaNacimiento) {
  const birthDate = new Date(fechaNacimiento);
  const eventDate = new Date('2027-01-09');
  let age = eventDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = eventDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Genera un código de inscripción único.
 * Formato: MBS-XXXX-XXXX (Maratón Bolívar Sucre)
 */
function generarCodigoInscripcion() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MBS-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * POST /api/inscripciones
 * Registra un nuevo participante en la maratón.
 */
const crearInscripcion = async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      fecha_nacimiento,
      correo,
      celular,
      ciudad_municipio,
      genero,
      categoria,
    } = req.body;

    // Verificar si el correo ya está registrado
    const { data: existente } = await supabase
      .from('inscripciones')
      .select('id, correo')
      .eq('correo', correo)
      .single();

    if (existente) {
      return res.status(409).json({
        success: false,
        message: 'Este correo electrónico ya se encuentra registrado.',
      });
    }

    const edad = calcularEdadAlEvento(fecha_nacimiento);
    const codigoInscripcion = generarCodigoInscripcion();

    // Determinar tipo de carrera
    const esCarrera6k = categoria === '6k_abierta';

    const inscripcion = {
      nombre,
      apellidos,
      fecha_nacimiento,
      correo,
      celular,
      ciudad_municipio,
      genero,
      categoria,
      edad_al_evento: edad,
      tipo_carrera: esCarrera6k ? '6k_la_pena' : 'cuarto_maraton',
      codigo_inscripcion: codigoInscripcion,
      estado: esCarrera6k ? 'confirmado' : 'pendiente',
      valor_inscripcion: esCarrera6k ? 0 : 30000,
      ip_registro: req.ip || req.headers['x-forwarded-for'] || null,
    };

    const { data, error } = await supabase
      .from('inscripciones')
      .insert([inscripcion])
      .select()
      .single();

    if (error) {
      console.error('❌ Error Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar la inscripción. Intenta de nuevo.',
      });
    }

    return res.status(201).json({
      success: true,
      message: esCarrera6k
        ? '¡Inscripción exitosa en la carrera 6K La Peña - Sucre!'
        : '¡Inscripción exitosa en la ¼ Maratón Bolívar - Sucre!',
      data: {
        codigo: data.codigo_inscripcion,
        nombre: `${data.nombre} ${data.apellidos}`,
        categoria: data.categoria,
        genero: data.genero,
        tipo_carrera: data.tipo_carrera,
        valor: data.valor_inscripcion,
        estado: data.estado,
      },
    });
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

/**
 * GET /api/inscripciones/stats
 * Devuelve estadísticas públicas de inscritos.
 */
const obtenerEstadisticas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inscripciones')
      .select('categoria, genero, tipo_carrera');

    if (error) {
      throw error;
    }

    const total = data.length;
    const porCategoria = {};
    const porGenero = { masculino: 0, femenino: 0 };
    const porCarrera = { cuarto_maraton: 0, '6k_la_pena': 0 };

    data.forEach((row) => {
      porCategoria[row.categoria] = (porCategoria[row.categoria] || 0) + 1;
      porGenero[row.genero] = (porGenero[row.genero] || 0) + 1;
      porCarrera[row.tipo_carrera] = (porCarrera[row.tipo_carrera] || 0) + 1;
    });

    return res.json({
      success: true,
      data: { total, porCategoria, porGenero, porCarrera },
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas.',
    });
  }
};

module.exports = { crearInscripcion, obtenerEstadisticas };

