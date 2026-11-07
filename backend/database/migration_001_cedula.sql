-- Migración 001: columna cédula para búsqueda y exportación en el panel admin.
-- Ejecutar en el SQL Editor de Supabase.
ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS cedula VARCHAR(12);
CREATE UNIQUE INDEX IF NOT EXISTS idx_inscripciones_cedula ON inscripciones(cedula) WHERE cedula IS NOT NULL;
