/**
 * Sincronização do Contador de Selos em Tempo Real
 */
const getSupa = () => window._supabase || null;

// Função para obter o cliente Supabase de forma segura
function obterSupabase() {
  const supabase = getSupa();
  if (!supabase) {
    console.warn("⏳ Supabase ainda não disponível em sincronizarPainelSelos");
    return null;
  }
  return supabase;
}

/**
 * Consulta o banco de dados para encontrar o lote de selos aberto e o próximo número disponível.
 * Atualiza o painel visual de selos na interface.
 */
async function sincronizarPainelSelos() {
  const _supabase = obterSupabase();
  if (!_supabase) {
    // Tenta novamente em 500ms
    setTimeout(sincronizarPainelSelos, 500);
    return;
  }

  const elLote = document.getElementById("lote_documento");
  const elSeloProx = document.getElementById("proximo_selo_num");
  const elQtd = document.getElementById("qtd_restante_texto");
  const barra = document.getElementById("barra_progresso_selo");

  try {
    // 1. Procura o lote aberto
    const { data: lote, error: erroLote } = await _supabase
      .from("rem_essas")
      .select("*")
      .eq("status_lote", "ABERTO")
      .maybeSingle();

    if (erroLote || !lote) {
      if (elLote) elLote.innerText = "NENHUM LOTE ATIVO";
      return;
    }

    const { data: itens, error: erroItens } = await _supabase
      .from("itens_os")
      .select("selo_inmetro")
      .eq("prefixo_selo", lote.prefixo);

    if (erroItens) throw erroItens;

    const selosUsados = new Set(
      itens.map((i) => parseInt(i.selo_inmetro)).filter((n) => !isNaN(n)),
    );
    const seloInicial = parseInt(lote.selo_inicio);
    const qtdTotal = parseInt(lote.qtd_selos);

    let proximo = seloInicial;
    while (selosUsados.has(proximo)) {
      proximo++;
    }

    const restante = qtdTotal - selosUsados.size;
    if (elLote)
      elLote.innerHTML = `LOTE: <span class="text-amber-500 font-black">${lote.prefixo}</span>`;
    if (elSeloProx) elSeloProx.innerText = proximo;
    if (elQtd) elQtd.innerText = restante;
    if (barra) {
      const porcentagem = (restante / qtdTotal) * 100;
      barra.style.width = `${porcentagem}%`;
    }
    window.proximoSeloCalculado = proximo;
    window.prefixoAtualSelo = lote.prefixo;
    if (typeof aplicarBloqueioSistema === "function")
      aplicarBloqueioSistema(restante);
  } catch (err) {
    console.error("Erro na sincronização:", err);
  }
}

function exibirDadosVazios() {
  const elLote = document.getElementById("lote_documento");
  const elQtd = document.getElementById("qtd_restante_texto");
  if (elLote) elLote.innerText = "NENHUM LOTE ATIVO";
  if (elQtd) elQtd.innerText = "0";
}

document.addEventListener("DOMContentLoaded", sincronizarPainelSelos);

/**
 * Bloqueia ou libera as funcionalidades do sistema caso não haja selos disponíveis.
 */
function aplicarBloqueioSistema(quantidade) {
  const isBloqueado = quantidade <= 0;
  const barra = document.getElementById("barra_progresso_selo");
  const totalLote = 100;
  const porcentagem = Math.min((quantidade / totalLote) * 100, 100);

  if (barra) {
    barra.style.width = `${porcentagem}%`;
    if (porcentagem < 10) {
      barra.classList.replace("bg-amber-500", "bg-red-500");
      barra.classList.replace("bg-indigo-600", "bg-red-500");
    } else {
      barra.classList.replace("bg-red-500", "bg-amber-500");
    }
  }

  // Seleciona o botão de registro (baseado no seu HTML)
  const btnRegistrar = document.querySelector(
    'button[onclick="registrarItem()"]',
  );
  const inputs = document.querySelectorAll("main input, main select");
  const badgeSelo = document.getElementById("qtd_restante_texto");

  if (isBloqueado) {
    if (btnRegistrar) {
      btnRegistrar.disabled = true;
      btnRegistrar.innerHTML =
        '<i class="fa-solid fa-lock mr-2"></i> SEM SELOS DISPONÍVEIS';
      btnRegistrar.className =
        "px-6 py-2 bg-slate-700 text-slate-400 rounded-lg text-[10px] font-black uppercase cursor-not-allowed transition-all opacity-80";
    }

    inputs.forEach((el) => {
      el.disabled = true;
      el.classList.add("opacity-50", "cursor-not-allowed");
    });

    if (badgeSelo) {
      badgeSelo.parentElement.classList.replace(
        "bg-amber-500/10",
        "bg-red-500/10",
      );
      badgeSelo.classList.replace("text-amber-500", "text-red-600");
    }
  } else {
    if (btnRegistrar) {
      btnRegistrar.disabled = false;
      btnRegistrar.innerHTML =
        '<i class="fa-solid fa-plus-circle mr-2"></i> REGISTRAR';
      btnRegistrar.className =
        "px-6 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95";
    }

    inputs.forEach((el) => {
      el.disabled = false;
      el.classList.remove("opacity-50", "cursor-not-allowed");
    });

    if (badgeSelo) {
      badgeSelo.parentElement.classList.remove("bg-red-500/10");
      badgeSelo.classList.remove("text-red-600");
      badgeSelo.classList.add("text-amber-500");
    }
  }
}

// Inicializa
document.addEventListener("DOMContentLoaded", sincronizarPainelSelos);

/**
 * Verifica a disponibilidade de selos em tempo real diretamente no banco.
 */
async function verificarDisponibilidadeSeloRealtime() {
  try {
    const { data: lote, error: erroLote } = await _supabase
      .from("rem_essas")
      .select("qtd_selos, prefixo, selo_inicio")
      .eq("status_lote", "ABERTO")
      .maybeSingle();

    if (erroLote || !lote)
      return { podeGravar: false, motivo: "Lote não encontrado." };

    const { data: itens, error: erroItens } = await _supabase
      .from("itens_os")
      .select("selo_inmetro")
      .eq("prefixo_selo", lote.prefixo);

    if (erroItens) throw erroItens;

    const selosUsados = itens
      .map((i) => parseInt(i.selo_inmetro))
      .filter((n) => !isNaN(n));

    const seloInicial = parseInt(lote.selo_inicio);
    const seloFinal = seloInicial + parseInt(lote.qtd_selos) - 1;
    let seloCerto = seloInicial;

    while (selosUsados.includes(seloCerto)) {
      seloCerto++;
    }

    return {
      podeGravar: seloCerto <= seloFinal,
      proximoSelo: seloCerto,
      prefixo: lote.prefixo,
      disponiveis: parseInt(lote.qtd_selos) - selosUsados.length,
      motivo: seloCerto > seloFinal ? "Lote esgotado!" : "",
    };
  } catch (err) {
    console.error("Erro técnico:", err);
    return { podeGravar: false, motivo: "Erro na sequência." };
  }
}

window.sincronizarPainelSelos = sincronizarPainelSelos;
window.exibirDadosVazios = exibirDadosVazios;
window.aplicarBloqueioSistema = aplicarBloqueioSistema;
window.verificarDisponibilidadeSeloRealtime =
  verificarDisponibilidadeSeloRealtime;
