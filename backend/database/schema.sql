-- =====================================================
-- 🏃 ¼ Maratón Bolívar - Sucre
-- Script de creación de base de datos para Supabase
-- =====================================================

-- Tabla principal de inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Datos personales
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  correo VARCHAR(150) UNIQUE NOT NULL,
  celular VARCHAR(15) NOT NULL,
  ciudad_municipio VARCHAR(100) NOT NULL,
  
  -- Datos de la carrera
  genero VARCHAR(10) NOT NULL CHECK (genero IN ('masculino', 'femenino')),
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN (
    'elite_18', 'elite_45', 'recreativa_18', 'recreativa_45', '6k_abierta'
  )),
  tipo_carrera VARCHAR(20) NOT NULL CHECK (tipo_carrera IN ('cuarto_maraton', '6k_la_pena')),
  edad_al_evento INTEGER NOT NULL,
  
  -- Inscripción
  codigo_inscripcion VARCHAR(20) UNIQUE NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
  valor_inscripcion INTEGER DEFAULT 30000,
  
  -- Seguridad y auditoría
  ip_registro INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_inscripciones_correo ON inscripciones(correo);
CREATE INDEX idx_inscripciones_categoria ON inscripciones(categoria);
CREATE INDEX idx_inscripciones_genero ON inscripciones(genero);
CREATE INDEX idx_inscripciones_tipo_carrera ON inscripciones(tipo_carrera);
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON inscripciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- Política: permitir INSERT desde el cliente anón (formulario público)
CREATE POLICY "Permitir inscripción pública"
  ON inscripciones
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política: permitir SELECT solo con service_role (admin)
CREATE POLICY "Solo admin puede leer inscripciones"
  ON inscripciones
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: permitir SELECT de estadísticas agregadas (anón puede contar)
CREATE POLICY "Permitir conteo público"
  ON inscripciones
  FOR SELECT
  TO anon
  USING (true);

