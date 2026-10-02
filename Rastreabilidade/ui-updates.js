// ui-updates.js - FUNÇÃO COMPLETA

// Inicia e escuta mudanças
window.addEventListener("load", () => {
  // Espera o Supabase estar disponível
  const iniciarSincronizacao = () => {
    if (window._supabase) {
      sincronizarPainelSelos();

      window._supabase
        .channel("mudanca_selos")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "itens_os" },
          () => {
            setTimeout(sincronizarPainelSelos, 500);
          },
        )
        .subscribe();
    } else {
      setTimeout(iniciarSincronizacao, 500);
    }
  };
  iniciarSincronizacao();
});

const listaCompGlobal = [
  "pistola",
  "valvula",
  "bucha",
  "sifao",
  "punho_pino",
  "quebra_jato",
  "manometro",
  "mangueira",
  "cord_plastico",
  "saia_plastica",
  "conj_apague",
  "difusor",
  "pera_ved",
  "mola_rosca",
  "conj_miolo",
  "conj_haste",
  "anel_oring",
  "sifao_aluminio",
  "conj_seguranca",
  "haste_valvula",
  "gancho_sup",
  "trava_corrente",
];

// Função para abrir o modal de componentes
async function abrirModalComponentes() {
  const modal = document.getElementById("modalComponentes");
  if (modal) {
    const idTarget = window.editandoID || window.idSelecionadoComponentes;

    // Primeiro, limpa todos os checkboxes para garantir que o modal comece "limpo"
    listaCompGlobal.forEach((item) => {
      const el = document.getElementById(`comp_${item}`);
      if (el) el.checked = false;
    });

    if (idTarget) {
      // Se houver um extintor selecionado (pelo clique na tabela ou busca), busca os dados dele
      try {
        const { data, error } = await window._supabase
          .from("itens_os")
          .select("*")
          .eq("id", idTarget)
          .single();

        if (!error && data) {
          listaCompGlobal.forEach((item) => {
            const el = document.getElementById(`comp_${item}`);
            if (el) el.checked = data[`comp_${item}`] || false;
          });
        }
      } catch (err) {
        console.error("Erro ao carregar componentes:", err);
      }
    }

    if (typeof window.atualizarBadgeComponentes === "function") {
      window.atualizarBadgeComponentes();
    }

    // Remove 'hidden' para tornar visível e adiciona 'flex' para centralizar
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  } else {
    console.error("Erro: O modal 'modalComponentes' não foi encontrado.");
  }
}

// Função para salvar componentes individualmente no banco através do botão do modal
async function salvarComponentesNoModal() {
  const idTarget = window.editandoID || window.idSelecionadoComponentes;

  // Se for um novo registro (sem ID ainda), apenas fecha o modal.
  // As seleções serão salvas quando o usuário clicar em "Registrar Extintor".
  if (!idTarget) {
    fecharModalComponentes();
    return;
  }

  try {
    const updateData = {};
    listaCompGlobal.forEach((item) => {
      const el = document.getElementById(`comp_${item}`);
      updateData[`comp_${item}`] = el ? el.checked : false;
    });

    const { error } = await window._supabase
      .from("itens_os")
      .update(updateData)
      .eq("id", idTarget);

    if (error) {
      console.error("Erro Supabase:", error);
      throw error;
    }

    // Força a atualização da tabela para mostrar o badge/mudanças
    if (typeof window.carregarItens === "function") {
      await window.carregarItens();
    }

    console.log("✅ Componentes atualizados para o item:", idTarget);
    fecharModalComponentes();
  } catch (err) {
    console.error("Erro ao salvar componentes:", err);
    if (typeof window.exibirAlertaErro === "function") {
      window.exibirAlertaErro("Falha ao salvar componentes no banco de dados.");
    } else {
      alert("Erro ao salvar seleções: " + (err.message || "Erro técnico"));
    }
  }
}

// Função para fechar o modal
function fecharModalComponentes() {
  const modal = document.getElementById("modalComponentes");
  if (modal) {
    // Adiciona 'hidden' para esconder e remove 'flex'
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Funções de busca rápida (Placeholders para evitar erro de 'not defined')
function X_ABRIR_TIPO() {
  if (typeof window.abrirModalTipo === "function") {
    window.abrirModalTipo();
  }
}

function openCapacidadeModal() {
  if (typeof window.abrirModalCapacidade === "function") {
    window.abrirModalCapacidade();
  }
}

function X_ABRIR_NBR() {
  if (typeof window.abrirModalNBR === "function") {
    window.abrirModalNBR();
  }
}

window.abrirModalComponentes = abrirModalComponentes;
window.salvarComponentesNoModal = salvarComponentesNoModal;
window.fecharModalComponentes = fecharModalComponentes;
window.X_ABRIR_TIPO = X_ABRIR_TIPO;
window.openCapacidadeModal = openCapacidadeModal;
window.X_ABRIR_NBR = X_ABRIR_NBR;
