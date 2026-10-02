// Garante acesso ao cliente Supabase global
function obterSupabase() {
  return window._supabase || null;
}

let idParaInutilizar = null;

function abrirModalInutilizar(id) {
  idParaInutilizar = id;
  document.getElementById("modalInutilizar").classList.remove("hidden");
  document.getElementById("modalInutilizar").classList.add("flex");
}

function fecharModalInutilizar() {
  document.getElementById("modalInutilizar").classList.add("hidden");
  idParaInutilizar = null;
}

async function confirmarInutilizacao() {
  const _supabase = obterSupabase();
  if (!_supabase) {
    alert("Sistema não conectado. Aguarde um momento e tente novamente.");
    return;
  }

  const motivo = document.getElementById("motivoReprovacao").value;

  if (!motivo) {
    alert("Por favor, selecione um motivo.");
    return;
  }

  try {
    // Update no Supabase com o status correto
    const { data, error } = await _supabase
      .from("itens_os")
      .update({
        status: "Inutilizado",
        motivo_inutilizacao: motivo,
      })
      .eq("id", idParaInutilizar)
      .select();

    if (error) {
      console.error("Erro técnico do Supabase:", error);
      alert("Erro do Banco: " + error.message);
      return;
    }

    alert("✅ Extintor inutilizado com sucesso!");
    fecharModalInutilizar();

    // Recarrega a tabela para aplicar a cor vermelha via renderizarTabela.js
    if (typeof carregarItens === "function") {
      carregarItens();
    }
  } catch (err) {
    console.error("Erro inesperado:", err);
    alert("Erro de conexão ou permissão.");
  }
}

window.abrirModalInutilizar = abrirModalInutilizar;
window.fecharModalInutilizar = fecharModalInutilizar;
window.confirmarInutilizacao = confirmarInutilizacao;
