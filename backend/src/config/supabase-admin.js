const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * Cliente con service_role para el panel de administración.
 * Es necesario para UPDATE/DELETE: la clave anon está limitada por RLS.
 * NUNCA exponer esta clave en el frontend.
 */
const url = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.warn('⚠️  [Supabase] Falta SUPABASE_SERVICE_ROLE_KEY: el panel admin no podrá editar ni eliminar.');
}

const supabaseAdmin = createClient(url, serviceKey || process.env.SUPABASE_ANON_KEY || 'placeholder-key', {
  auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = supabaseAdmin;
