// /**
//  * GERENCIAMENTO DE AÇÕES DA TABELA
//  * Focado exclusivamente em Editar e Excluir
//  */

// // Variável global para controlar se estamos editando um item existente
// window.editandoID = null;

// /**
//  * PREPARAR EDIÇÃO: Busca dados no Supabase e preenche o formulário
//  */
// async function prepararEdicao(id) {
//     try {
//         const { data, error } = await _supabase
//             .from("itens_os")
//             .select("*")
//             .eq("id", id)
//             .single();

//         if (error) throw error;

//         // 1. Define o ID global para transformar o registro em UPDATE
//         window.editandoID = id;

//         // 2. Mapeamento de campos (IDs conforme seu Rastreio_Full.html)
//         const campos = {
//             "cod_barras": data.cod_barras,
//             "X_input_id": data.fabricante_id,
//             "nr_cilindro": data.nr_cilindro,
//             "ano_fab": data.ano_fab,
//             "ult_reteste": data.ult_reteste,
//             "tipo_carga": data.tipo_carga,
//             "capacidade": data.capacidade,
//             "nbr_select": data.nbr,
//             "lote_nitrogenio": data.lote_nitrogenio,
//             "ampola_vinculada": data.ampola_vinculada,
//             "data_selagem": data.data_selagem,
//             "selo_anterior": data.selo_anterior,
//             "N-Patrimonio": data.num_patrimonio,
//             "deposito_galpao": data.deposito_galpao,
//             "local_extintor": data.local_especifico,
//             "obs_ensaio": data.obs_ensaio,
//             // Ensaios Técnicos
//             "p_vazio_valvula": data.p_vazio_valvula,
//             "p_cheio_valvula": data.p_cheio_valvula,
//             "p_atual": data.p_atual,
//             "tara_cilindro": data.tara_cilindro,
//             "p_cil_vazio_kg": data.p_cil_vazio_kg,
//             "vol_litros": data.vol_litros,
//             "dvm_et": data.dvm_et,
//             "dvp_ep": data.dvp_ep
//         };

//         // Preenche os inputs automaticamente
//         Object.entries(campos).forEach(([id, valor]) => {
//             const el = document.getElementById(id);
//             if (el) el.value = valor || "";
//         });

//         // 3. Atualiza Nível (NV1/NV2/NV3)
//         if (data.nivel_manutencao && typeof setLevel === "function") {
//             setLevel(parseInt(data.nivel_manutencao));
//         }

//         // 4. Muda o visual do botão Registrar
//         const btnReg = document.querySelector('button[onclick="registrarItem()"]');
//         if (btnReg) {
//             btnReg.innerHTML = '<i class="fa-solid fa-save"></i> SALVAR ALTERAÇÕES';
//             btnReg.classList.replace("bg-indigo-600", "bg-emerald-500");
//         }

//         // 5. Feedback visual: sobe para o formulário
//         window.scrollTo({ top: 0, behavior: 'smooth' });

//         // Recalcula displays de validade se a função existir
//         if (typeof calcularDatasAutomaticas === "function") {
//             calcularDatasAutomaticas();
//         }

//     } catch (err) {
//         console.error("Erro ao carregar edição:", err);
//         alert("Erro ao buscar dados para edição.");
//     }
// }

// /**
//  * DELETAR ITEM: Remove o registro após confirmação
//  */
// // Função para deletar item
// window.deletarItem = async function(id) {
//     // Busca o modal de confirmação no HTML
//     const modal = document.getElementById("confirmacaoGeral");
//     const btnConfirmar = document.getElementById("btnConfirmarAcaoGeral");

//     if (!modal) {
//         // Se não achar o modal customizado, usa o do navegador para não travar o usuário
//         if (confirm("Tem certeza que deseja excluir este item permanentemente?")) {
//             await executarExclusao(id);
//         }
//         return;
//     }

//     // Abre o modal
//     modal.classList.remove("hidden");
//     modal.classList.add("flex");

//     // Configura o botão de confirmação
//     btnConfirmar.onclick = async () => {
//         await executarExclusao(id);
//         fecharConfirmacaoGeral();
//     };
// };

// // Função interna que realmente fala com o Banco de Dados
// async function executarExclusao(id) {
//     try {
//         const { error } = await _supabase
//             .from("itens_os")
//             .delete()
//             .eq("id", id);

//         if (error) {
//             console.error("Erro Supabase:", error);
//             alert("Erro ao excluir: Verifique as permissões do banco.");
//             return;
//         }

//         // Sucesso: Atualiza a tabela
//         if (typeof carregarItens === "function") {
//             await carregarItens();
//         }
//     } catch (err) {
//         console.error("Erro crítico na exclusão:", err);
//         alert("Ocorreu um erro inesperado ao tentar excluir.");
//     }
// }

// // Função para fechar o modal
// window.fecharConfirmacaoGeral = function() {
//     const modal = document.getElementById("confirmacaoGeral");
//     if (modal) {
//         modal.classList.add("hidden");
//         modal.classList.remove("flex");
//     }
// };

// function fecharConfirmacao() {
//     const modal = document.getElementById("confirmacaoGeral");
//     if (modal) {
//         modal.classList.add("hidden");
//         modal.classList.remove("flex");
//     }
// }

/**
 * GERENCIAMENTO DE AÇÕES DA TABELA - YA SE PRO
 * Edição, Exclusão e Sincronização em Tempo Real
 */

// Função para obter o cliente Supabase de forma segura
function obterSupabase() {
  return window._supabase || null;
}

// Variável global para controlar se estamos editando um item existente
window.editandoID = null;

/**
 * PREPARAR EDIÇÃO: Busca dados no Supabase e preenche o formulário
 */
async function prepararEdicao(id) {
  const _supabase = obterSupabase();
  if (!_supabase) {
    alert("Sistema não conectado. Aguarde um momento e tente novamente.");
    return;
  }

  try {
    const { data, error } = await _supabase
      .from("itens_os")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    window.editandoID = id;

    const campos = {
      cod_barras: data.cod_barras,
      X_input_id: data.fabricante_id,
      nr_cilindro: data.nr_cilindro,
      ano_fab: data.ano_fab,
      ult_reteste: data.ult_reteste,
      tipo_carga: data.tipo_carga,
      capacidade: data.capacidade,
      nbr_select: data.nbr,
      lote_nitrogenio: data.lote_nitrogenio,
      ampola_vinculada: data.ampola_vinculada,
      selo_anterior: data.selo_anterior,
      "N-Patrimonio": data.num_patrimonio,
      deposito_galpao: data.deposito_galpao,
      local_extintor: data.local_extintor || data.local_especifico,
      obs_ensaio: data.obs_ensaio,
      p_vazio_valvula: data.p_vazio_valvula,
      p_cheio_valvula: data.p_cheio_valvula,
      p_atual: data.p_atual,
      tara_cilindro: data.tara_cilindro,
      p_cil_vazio_kg: data.p_cil_vazio_kg,
      vol_litros: data.vol_litros,
      dvm_et: data.dvm_et,
      dvp_ep: data.dvp_ep,
    };

    // Lista de componentes para restaurar o estado dos checkboxes no modal
    const listaComp = [
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

    listaComp.forEach((item) => {
      const el = document.getElementById(`comp_${item}`);
      if (el) {
        el.checked = data[`comp_${item}`] || false;
      }
    });

    if (data.fabricante_id) {
      window.buscarNomeFabricante(data.fabricante_id);
    }

    Object.entries(campos).forEach(([id, valor]) => {
      const el = document.getElementById(id);
      if (el) el.value = valor || "";
    });

    if (data.nivel_manutencao && typeof setLevel === "function") {
      setLevel(parseInt(data.nivel_manutencao));
    }

    const btnReg = document.querySelector('button[onclick="registrarItem()"]');
    if (btnReg) {
      btnReg.innerHTML =
        '<i class="fa-solid fa-save mr-2"></i> SALVAR ALTERAÇÕES';
      btnReg.classList.remove("bg-indigo-600");
      btnReg.classList.add("bg-emerald-500", "scale-105");
    }

    // 5. Scroll suave para o topo para o técnico editar
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (typeof calcularDatasAutomaticas === "function") {
      calcularDatasAutomaticas();
    }

    // Atualiza o badge de componentes após restaurar os checkboxes
    if (typeof window.atualizarBadgeComponentes === "function") {
      window.atualizarBadgeComponentes();
    }

    console.log("Modo de edição ativado para o ID:", id);
  } catch (err) {
    console.error("Erro ao carregar edição:", err);
    alert("Erro ao buscar dados para edição.");
  }
}

/**
 * Abre o modal de confirmação para exclusão de um item.
 */
window.deletarItem = async function (id) {
  const modal = document.getElementById("confirmacaoGeral");
  const btnConfirmar = document.getElementById("btnConfirmarAcaoGeral");

  if (!modal) {
    if (confirm("Tem certeza que deseja excluir este item permanentemente?")) {
      await executarExclusao(id);
    }
    return;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  btnConfirmar.onclick = async () => {
    await executarExclusao(id);
    fecharConfirmacaoGeral();
  };
};

/**
 * Executa a exclusão definitiva de um item no Supabase e atualiza a interface.
 */
async function executarExclusao(id) {
  const _supabase = obterSupabase();
  if (!_supabase) {
    alert("Sistema não conectado. Aguarde um momento e tente novamente.");
    return;
  }

  try {
    const { error } = await _supabase.from("itens_os").delete().eq("id", id);
    if (error) throw error;

    // 1. Recarrega a tabela visualmente
    if (typeof carregarItens === "function") await carregarItens();

    setTimeout(async () => {
      await sincronizarPainelSelos();
    }, 100);
  } catch (err) {
    console.error("Erro ao excluir:", err);
    alert("Erro na exclusão.");
  }
}

window.fecharConfirmacaoGeral = function () {
  const modal = document.getElementById("confirmacaoGeral");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
};

function fecharConfirmacao() {
  fecharConfirmacaoGeral();
}

/**
 * Reseta o botão de registro para o estado original (Novo Registro).
 */
function resetarBotaoRegistro() {
  window.editandoID = null;
  const btnReg = document.querySelector('button[onclick="registrarItem()"]');
  if (btnReg) {
    btnReg.innerHTML =
      '<i class="fa-solid fa-plus mr-2"></i> REGISTRAR EXTINTOR';
    btnReg.classList.remove("bg-emerald-500", "scale-105");
    btnReg.classList.add("bg-indigo-600");
  }
  if (typeof window.limparCamposAposRegistro === "function") {
    window.limparCamposAposRegistro();
  }
}

window.prepararEdicao = prepararEdicao;
window.resetarBotaoRegistro = resetarBotaoRegistro;
window.fecharConfirmacao = fecharConfirmacao;
