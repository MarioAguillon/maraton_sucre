require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { globalLimiter } = require('./middlewares/rateLimiter');
const registrationRoutes = require('./routes/registration.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Seguridad ──────────────────────────────────────────────
app.use(helmet());
app.use(globalLimiter);

// ─── CORS ───────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Body Parser ────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── Rutas ──────────────────────────────────────────────────
app.use('/api/inscripciones', registrationRoutes);

// ─── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🏃 API ¼ Maratón Bolívar - Sucre funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// ─── Manejo de rutas no encontradas ─────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// ─── Manejo global de errores ───────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
});

// ─── Iniciar servidor ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏃 ¼ Maratón Bolívar - Sucre API`);
  console.log(`📡 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`🌐 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:4200'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});

