import { findCategory } from '../config/event.config';
import { Athlete } from './admin.models';

const HEADERS = [
  'Código', 'Nombres', 'Apellidos', 'Cédula', 'Género', 'Edad',
  'Categoría', 'Celular', 'Correo', 'Ciudad', 'Fecha Registro',
];

/** Columnas que deben ir como texto (evita notación científica y pérdida de ceros). */
const TEXT_COLUMNS = [3, 7];

/**
 * Genera y descarga un .xlsx nativo (Office Open XML) con SheetJS.
 * La librería se carga bajo demanda para no pesar en el bundle inicial.
 */
export async function exportAthletesToXlsx(athletes: readonly Athlete[], fileName: string): Promise<void> {
  const XLSX = await import('xlsx');

  const rows = athletes.map((a) => [
    a.codigo_inscripcion,
    a.nombre,
    a.apellidos,
    a.cedula ?? '',
    a.genero === 'femenino' ? 'Femenino' : 'Masculino',
    a.edad_al_evento,
    findCategory(a.categoria)?.label ?? a.categoria,
    a.celular,
    a.correo,
    a.ciudad_municipio,
    new Date(a.created_at),
  ]);

  const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows], { cellDates: true, dateNF: 'dd/mm/yyyy hh:mm' });

  for (let r = 1; r <= rows.length; r++) {
    for (const c of TEXT_COLUMNS) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell) {
        cell.t = 's';
        cell.v = String(cell.v);
      }
    }
  }

  sheet['!cols'] = [14, 18, 20, 14, 11, 7, 28, 13, 32, 18, 18].map((wch) => ({ wch }));
  sheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: HEADERS.length - 1 } }),
  };

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Inscritos');
  book.Props = { Title: 'Inscritos ¼ Maratón Bolívar - Sucre', Author: 'Organización Maratón Bolívar - Sucre' };

  XLSX.writeFile(book, fileName, { bookType: 'xlsx', compression: true });
}
