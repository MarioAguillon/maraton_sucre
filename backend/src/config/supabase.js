const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl.includes('tu-proyecto') || supabaseKey.includes('tu-anon-key')) {
  console.warn('⚠️  [Supabase] Recuerda configurar tus credenciales reales en backend/.env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
