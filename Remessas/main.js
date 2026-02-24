/**
 * main.js - NÚCLEO DE CONEXÃO
 * Este arquivo deve ser o primeiro a carregar no HTML.
 */
const SUPABASE_URL = "https://gzojpxgpgjapsegerscb.supabase.co";
const SUPABASE_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s";

// Variável global de conexão
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Controle de edição
let editandoLoteId = null;

console.log("YaSe PRO: Conexão Principal Carregada.");