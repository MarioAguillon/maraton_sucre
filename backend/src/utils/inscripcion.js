/** Utilidades compartidas entre el registro público y el panel admin. */

const EVENT_DATE = new Date('2027-01-09');

/** Edad que tendrá el atleta el día del evento (9 Ene 2027). */
function edadAlEvento(fechaNacimiento) {
  const birth = new Date(fechaNacimiento);
  let age = EVENT_DATE.getFullYear() - birth.getFullYear();
  const m = EVENT_DATE.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && EVENT_DATE.getDate() < birth.getDate())) age--;
  return age;
}

/** Código de inscripción único. Formato: MBS-XXXX-XXXX (Maratón Bolívar Sucre). */
function generarCodigoInscripcion() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return `MBS-${block()}-${block()}`;
}

/** Campos derivados de la categoría. */
function datosCarrera(categoria) {
  const es6k = categoria === '6k_abierta';
  return {
    tipo_carrera: es6k ? '6k_la_pena' : 'cuarto_maraton',
    valor_inscripcion: es6k ? 0 : 30000,
  };
}

module.exports = { edadAlEvento, generarCodigoInscripcion, datosCarrera };
