// Configuração do Supabase (Mantendo suas credenciais)
const SUPABASE_URL = "https://gzojpxgpgjapsegerscb.supabase.co";
const SUPABASE_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s";
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentOS = "";
let selectedLevel = 1;
let editandoID = null;
// Inicialização ao carregar a página
window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentOS = urlParams.get("os") || sessionStorage.getItem("currentOS");

  if (!currentOS) {
    alert("Nenhuma Ordem de Serviço selecionada.");
    window.location.href = "GestaoOS.html";
    return;
  }

  // Atualiza os elementos visuais da OS
  const displayOS = document.getElementById("displayOS");
  const osBadgeNumber = document.getElementById("osBadgeNumber");

  if (displayOS) displayOS.innerText = currentOS;
  if (osBadgeNumber) osBadgeNumber.innerText = `OS: ${currentOS}`;

  loadItens();
  // Dentro de window.onload = async () => { ...
  const hoje = new Date().toISOString().split("T")[0];
  const campoData = document.getElementById("data_selagem");
  if (campoData) campoData.value = hoje;
};




// Busca os itens no banco de dados filtrando pela OS atual
async function loadItens() {
  try {
    const { data, error } = await _supabase
      .from("itens_os")
      .select("*")
      .eq("os_number", currentOS)
      .order("created_at", { ascending: false });

    if (error) throw error;
    renderItens(data);
  } catch (error) {
    console.error("Erro ao carregar itens:", error);
  }
}


// Função de Logout
function logout() {
  sessionStorage.clear();
  window.location.href = "EntrarSistema.html";
}


// Para que o "Pesagem ABC" 
// mude automaticamente quando você trocar o tipo de extintor, 
// adicione isso ao seu arquivo de scripts:

// Exemplo de como mudar o nome conforme a carga
document.getElementById('tipo_carga').addEventListener('change', function() {
    const valor = this.value || 'ABC';
    document.getElementById('titulo_pesagem').innerText = 'Pesagem ' + valor;
});