// bancoVincula.js
// Configuração centralizada do Supabase

export const supabaseUrl = "https://gzojpxgpgjapsegerscb.supabase.co";
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s";

// Usamos o objeto global window.supabase que é carregado via CDN no HTML
export const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseAnonKey
);