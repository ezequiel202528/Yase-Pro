const SUPABASE_URL = "https://gzojpxgpgjapsegerscb.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s";



// Função para aguardar o Supabase estar disponível
function aguardarSupabase(retries = 20) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      if (window.supabase && window.supabase.createClient) {
        resolve(true);
      } else if (attempts >= retries) {
        console.error("❌ Supabase não carregou após", retries, "tentativas");
        reject(new Error("Supabase não disponível"));
      } else {
        setTimeout(check, 250);
      }
    };
    check();
  });
}

// Inicialização do cliente global - só executa após Supabase estar disponível
let _supabase = null;

async function inicializarSupabase() {
  try {
    await aguardarSupabase();
    window._supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    _supabase = window._supabase;

    // Inicializa o listener de tempo real após a criação do cliente para evitar erros
    inicializarRealtime();

    console.log("✅ Supabase inicializado com sucesso");
    return true;
  } catch (err) {
    console.error("❌ Falha ao inicializar Supabase:", err);
    return false;
  }
}

// Função para escutar mudanças no banco em tempo real de forma segura
function inicializarRealtime() {
  if (window._supabase) {
    window._supabase
      .channel("db-changes")
      // Monitora itens da OS
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "itens_os" },
        (payload) => {
          console.log("🔔 Mudança em itens_os detectada");
          const fn = window.carregarItens || window.loadItens;
          if (typeof fn === "function") fn();
        },
      )
      // Monitora novas Normas NBR
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "nbr" },
        () => {
          console.log("🔔 Nova NBR detectada");
          if (typeof window.carregarNBRs === "function") window.carregarNBRs();
        },
      )
      // Monitora novos Tipos de Carga
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tipos_carga" },
        () => {
          console.log("🔔 Novo Tipo de Carga detectado");
          if (typeof window.carregarTipos === "function")
            window.carregarTipos();
        },
      )
      // Monitora novas Capacidades
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "capacidades" },
        () => {
          console.log("🔔 Nova Capacidade detectada");
          if (typeof window.carregarCapacidades === "function")
            window.carregarCapacidades();
        },
      )
      .subscribe();

    console.log("✅ Realtime listener ativado para múltiplas tabelas");
  }
}

// Captura imediata da OS ativa para evitar atrasos na renderização
const urlParams = new URLSearchParams(window.location.search);

// Garantimos que a OS seja tratada como String ou Número conforme o banco espera
const osBruta =
  urlParams.get("os") || sessionStorage.getItem("currentOS") || "1";
window.currentOS = osBruta;

if (window.currentOS) sessionStorage.setItem("currentOS", window.currentOS);

const nomeOperadorLogado = localStorage.getItem("nome_operador") || "Sistema";
window.nomeOperadorLogado = nomeOperadorLogado;

window.selectedLevel = 1;
window.editandoID = null;

/**
 * Inicialização global ao carregar a página de Rastreabilidade.
 */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Iniciando carregamento de Rastreabilidade...");

  // Inicializa o Supabase primeiro
  const supabaseInicializado = await inicializarSupabase();
  console.log(
    "✅ Supabase inicializado:",
    supabaseInicializado ? "SIM" : "NÃO",
  );

  if (!supabaseInicializado) {
    console.error("🛑 Sistema interrompido: Supabase não inicializou.");
    return;
  }

  console.log("📋 OS Atual:", window.currentOS);

  const displayOS = document.getElementById("displayOS");
  const osBadgeNumber = document.getElementById("osBadgeNumber");

  if (displayOS) displayOS.innerText = window.currentOS;
  if (osBadgeNumber) osBadgeNumber.innerText = `OS: ${window.currentOS}`;

  const hoje = new Date().toISOString().split("T")[0];
  const campoData = document.getElementById("data_selagem");
  if (campoData) campoData.value = hoje;

  const forcarLimpeza = () => {
    const ids = ["X_input_id", "nr_cilindro", "inputBuscaModal"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = "";
        el.defaultValue = "";
      }
    });
    const preview = document.getElementById("nome_fabricante_preview");
    if (preview) preview.innerText = "";
  };

  forcarLimpeza();
  setTimeout(forcarLimpeza, 500);
  setTimeout(forcarLimpeza, 1500);

  console.log("📥 Carregando itens do Supabase...");

  // Tenta carregar imediatamente e novamente após um pequeno delay para garantir
  if (typeof window.carregarItens === "function") await window.carregarItens();
  setTimeout(() => {
    if (typeof window.carregarItens === "function") window.carregarItens();
  }, 1000);

  if (typeof window.sincronizarPainelSelos === "function")
    await window.sincronizarPainelSelos();
  if (typeof window.carregarTipos === "function") await window.carregarTipos();
  if (typeof window.carregarNBRs === "function") await window.carregarNBRs();
  if (typeof window.carregarCapacidades === "function")
    await window.carregarCapacidades();

  setTimeout(() => {
    if (typeof focarUltimoRegistro === "function") {
      focarUltimoRegistro();
    }
  }, 600);
});
/**
 * Realiza o logout do sistema limpando a sessão.
 */
function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

const tipoCargaElement = document.getElementById("tipo_carga");

/**
 * Atualiza o título do grupo de pesagem dinamicamente conforme o tipo de carga.
 */
if (tipoCargaElement) {
  tipoCargaElement.addEventListener("change", function () {
    const valor = this.value || "ABC";
    const titulo = document.getElementById("titulo_pesagem");
    if (titulo) titulo.innerText = "Pesagem " + valor;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const nomeOperador = localStorage.getItem("nome_operador");
  const nomeEmpresa = localStorage.getItem("nome_empresa");
  const displayElement = document.getElementById("nome-operador-logado");

  if (displayElement && nomeOperador) {
    displayElement.textContent = nomeOperador.toUpperCase();
    console.log(`Unidade: ${nomeEmpresa} | Operador: ${nomeOperador}`);
  }
});

window.logout = logout;
