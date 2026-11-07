const crypto = require('crypto');

/**
 * Tokens de sesión firmados con HMAC-SHA256 (formato payload.firma en base64url).
 * Sin estado en servidor; caducan a las TOKEN_TTL_MS.
 */
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

// Si no hay secreto en .env, se genera uno por proceso (las sesiones caducan al reiniciar).
const SECRET = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.ADMIN_TOKEN_SECRET) {
  console.warn('⚠️  [Admin] ADMIN_TOKEN_SECRET no configurado: se usa uno temporal.');
}

const sign = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function issueToken(username) {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ sub: username, exp })).toString('base64url');
  return { token: `${payload}.${sign(payload)}`, expiresAt: new Date(exp).toISOString() };
}

function verifyToken(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

/** Compara credenciales contra ADMIN_USER / ADMIN_PASS en tiempo constante. */
function checkCredentials(username, password) {
  const { ADMIN_USER, ADMIN_PASS } = process.env;
  if (!ADMIN_USER || !ADMIN_PASS) {
    console.error('❌ [Admin] ADMIN_USER / ADMIN_PASS no configurados en .env');
    return false;
  }
  // Evaluar ambos siempre para no filtrar cuál falló por tiempo de respuesta.
  const userOk = safeEqual(username, ADMIN_USER);
  const passOk = safeEqual(password, ADMIN_PASS);
  return userOk && passOk;
}

/** Middleware: exige `Authorization: Bearer <token>` válido. */
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Sesión inválida o expirada.' });
  }
  req.admin = session;
  next();
}

module.exports = { issueToken, verifyToken, checkCredentials, requireAdmin };
