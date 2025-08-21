// src/plugins/supabase.js

import { createClient } from '@supabase/supabase-js'

// Ambil environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Buat instance client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Buat plugin untuk di-install di Vue
export default {
  install: (app) => {
    // Menyediakan instance supabase ke seluruh aplikasi dengan nama 'supabase'
    app.provide('supabase', supabase)
  },
}
