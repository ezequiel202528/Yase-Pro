/**
 * Gerenciamento de Renderização da Tabela de Itens e Registro de Novos Dados.
 */
let selectedRowIndex = -1;



async function carregarItens() {
  try {
    if (!window._supabase) {
      let tentativas = 0;
      while (!window._supabase && tentativas < 20) {
        await new Promise((r) => setTimeout(r, 250));
        tentativas++;
      }
    }
    const _supabase = window._supabase;
    const osAtiva = window.currentOS || sessionStorage.getItem("currentOS");
    if (!osAtiva) return;

    // Join explícito usando a coluna técnica fabricante_id para buscar o nome na tabela fabricantes
    const query = _supabase
      .from("itens_os")
      .select("*, fabricantes:fabricante_id ( nome )")
      .eq("os_number", osAtiva)
      .order("created_at", { ascending: true });

    // EXECUÇÃO DA QUERY
    let { data, error } = await query;

    // Se o Join falhar (por relacionamento ausente), tenta a busca simples e faz merge manual dos fabricantes
    if (error) {
      console.warn(
        "⚠️ Falha na busca com relacionamento, usando busca simples:",
        error.message,
      );
      const simples = await _supabase
        .from("itens_os")
        .select("*")
        .eq("os_number", osAtiva)
        .order("created_at", { ascending: true });

      if (simples.error) throw simples.error;
      data = simples.data;

      const fabricanteIds = Array.from(
        new Set(
          data
            .map((item) => item.fabricante_id)
            .filter((id) => id !== null && id !== undefined && id !== ""),
        ),
      );

      if (fabricanteIds.length > 0) {
        const { data: fabricantes, error: fabricantesError } = await _supabase
          .from("fabricantes")
          .select("id, nome")
          .in("id", fabricanteIds);

        if (fabricantesError) {
          console.warn(
            "⚠️ Falha ao buscar nomes de fabricantes no fallback:",
            fabricantesError.message,
          );
        } else {
          const fabricantesMap = Object.fromEntries(
            fabricantes.map((f) => [String(f.id), f.nome]),
          );
          data = data.map((item) => ({
            ...item,
            fabricantes: {
              nome: fabricantesMap[String(item.fabricante_id)] || null,
            },
          }));
        }
      }
    }

    const contadorEl = document.getElementById("itemCounter");
    if (contadorEl) contadorEl.innerText = data ? data.length : 0;

    // Envia os dados para a função de desenho
    renderItens(data || []);
    configurarCliquesTabela();
    destacarUltimaLinha();
  } catch (err) {
    console.error("Erro ao carregar tabela:", err);
  }
}

/**
 * Formata datas no padrão brasileiro para exibição na tabela.
 */
function fixData(v) {
  if (!v || v === "-" || v === "null") return "-";
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString("pt-BR");
  } catch (e) {
    return v;
  }
}

/**
 * Move o foco da visualização para o último item registrado na tabela.
 */
function focarUltimoRegistro() {
  const tabelaBody = document.getElementById("itensList");
  if (!tabelaBody) return;

  const linhas = tabelaBody.querySelectorAll("tr");

  if (linhas.length > 0) {
    const ultimaLinha = linhas[linhas.length - 1];

    ultimaLinha.scrollIntoView({ behavior: "smooth", block: "center" });

    tabelaBody.querySelectorAll("td").forEach((td) => {
      td.classList.remove("bg-blue-600/20", "border-y", "border-blue-500/50");
    });

    ultimaLinha.querySelectorAll("td").forEach((td) => {
      td.classList.add("bg-blue-600/20", "border-y", "border-blue-500/50");
    });

    ultimaLinha.classList.add("border-l-4", "border-blue-500");
  }
}

/**
 * Monitora a digitação de um novo cilindro para limpar seleções anteriores.
 * Isso garante que ao ir para o "37", o modal de componentes abra vazio.
 */
document.getElementById("nr_cilindro")?.addEventListener("input", () => {
  if (!window.editandoID && window.idSelecionadoComponentes) {
    window.idSelecionadoComponentes = null;
    document
      .querySelectorAll(".row-highlight-active")
      .forEach((el) => el.classList.remove("row-highlight-active"));
  }
});



function renderItens(itens) {
  const list = document.getElementById("itensList");
  if (!list) return;

  if (!itens || itens.length === 0) {
    list.innerHTML = `<tr><td colspan="40" class="p-10 text-center text-slate-500 italic">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  const formatarDataLocal = (dataStr) => {
    if (!dataStr || dataStr === "" || dataStr === "-" || dataStr === "null")
      return "-";
    if (dataStr.length === 10) {
      const [ano, mes, dia] = dataStr.split("-");
      return `${dia}/${mes}/${ano}`;
    }
    const d = new Date(dataStr);
    if (isNaN(d.getTime())) return dataStr;
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  list.innerHTML = itens
    .map((item, index) => {
      const s = (
        item.status_servico ||
        item.status ||
        "APROVADO"
      ).toUpperCase();
      const corDaLinha =
        s === "INUTILIZADO" ? "text-red-500 font-bold" : "text-slate-300";

      let classesStatus =
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      if (s === "REPROVADO" || s === "REP" || s === "INUTILIZADO") {
        classesStatus = "bg-red-500/10 text-red-400 border-red-500/20";
      } else if (s === "NOVO") {
        classesStatus = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      }

      // LÓGICA DO NOME DO FABRICANTE
      let nomeExibicao = item.fabricante_id || "-";
      if (item.fabricantes) {
        const fabricanteData = Array.isArray(item.fabricantes)
          ? item.fabricantes[0]
          : item.fabricantes;
        if (fabricanteData && fabricanteData.nome) {
          nomeExibicao = String(fabricanteData.nome).toUpperCase();
        }
      }

      return `
      <tr data-index="${index}" data-id="${item.id}" class="group text-[11px] border-b border-slate-800 hover:bg-slate-800/40 transition-colors whitespace-nowrap ${corDaLinha}">
        <td class="p-3 sticky left-0 z-[40] bg-[#0f172a] border-r border-slate-700 font-bold group-hover:bg-[#1e293b] transition-colors">${index + 1}</td>
        <td class="p-3 font-black text-amber-500 bg-amber-500/5">${item.prefixo_selo ? item.prefixo_selo + "-" : ""}${item.selo_inmetro ?? "-"}</td>
        <td class="p-3 font-bold text-slate-200">${item.nr_cilindro || "S/N"}</td>
        <td class="p-3 font-bold text-slate-300 uppercase">${item.nbr || "-"}</td>
        <td class="p-3 font-bold text-slate-300">${nomeExibicao}</td>
        <td class="p-3">${item.ano_fab || "-"}</td>
        <td class="p-3">${item.ult_reteste || "-"}</td>
        <td class="px-4 py-3 text-xs font-bold text-orange-500">${item.prox_reteste || "-"}</td>
        <td class="p-3 text-amber-500 font-bold">${item.prox_recarga || "-"}</td>
        <td class="p-3 font-bold text-indigo-400">${item.tipo_carga || "-"} / ${item.capacidade || "-"}</td>
        <td class="p-3">${item.usuario_lancamento || "-"}</td>
        <td class="p-3 text-center">${item.nivel_manutencao || "2"}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded border font-bold text-[9px] ${classesStatus}">${s}</span></td>
        <td class="p-3 bg-orange-500/5 border-l border-slate-800">${item.p_vazio_valvula || "-"}</td>
        <td class="p-3 bg-orange-500/5">${item.p_cheio_valvula || "-"}</td>
        <td class="p-3 bg-orange-500/5 font-bold text-orange-300">${item.p_atual || "-"}</td>
        <td class="p-3 bg-orange-500/5">${item.porcent_dif || "0"}%</td>
        <td class="p-3 bg-emerald-500/5 border-l border-slate-800">${item.tara_cilindro || "-"}</td>
        <td class="p-3 bg-emerald-500/5">${item.p_cil_vazio_kg || "-"}</td>
        <td class="p-3 bg-emerald-500/5 text-emerald-400">${item.perda_massa_porcent || "0"}%</td>
        <td class="p-3 bg-blue-500/5 border-l border-slate-800">${item.vol_litros || "-"}</td>
        <td class="p-3 bg-blue-500/5">${item.dvh || "-"}</td>
        <td class="p-3 bg-blue-500/5">${item.dvp || "-"}</td>
        <td class="p-3 bg-blue-500/5">${item.ee || "-"}</td>
        <td class="p-3 bg-red-500/5 border-l border-slate-800">${item.dvm_et || "-"}</td>
        <td class="p-3 bg-red-500/5">${item.dvp_ep || "-"}</td>
        <td class="p-3 bg-red-500/5">${item.ee_calculado || "-"}</td>
        <td class="p-3 bg-red-500/5 font-bold text-red-400">${item.ep_porcent_final || "0"}%</td>
        <td class="p-3 text-slate-400 text-[10px]">${formatarDataLocal(item.created_at)}</td>
        <td class="p-3 text-[10px]">${item.cod_barras || "-"}</td>
        <td class="p-4">${item.lote_nitrogenio || "-"}</td>
        <td class="p-3">${item.ampola_vinculada || "-"}</td>
        <td class="p-3">${item.deposito_galpao || "-"}</td>
        <td class="p-3 font-bold text-indigo-400 bg-indigo-500/5 text-center border-x border-slate-800/20">${item.num_patrimonio || "-"}</td>
        <td class="p-3">${item.local_especifico || item.local_extintor || "-"}</td>
        <td class="p-3 text-[9px] text-slate-500 italic">${item.updated_at ? formatarDataLocal(item.updated_at) : "Sem alterações"}</td>
        <td class="p-3 text-[9px] font-bold text-amber-600/80">${item.usuario_alteracao || "-"}</td>
        <td class="p-3 sticky right-0 z-20 bg-[#0f172a] border-l border-slate-700 text-right pr-4 shadow-[-5px_0_10px_rgba(0,0,0,0.3)] group-hover:bg-[#1e293b] transition-colors">
            <div class="flex gap-2 justify-end">
              <button onclick="prepararEdicao('${item.id}')" class="text-amber-500 hover:text-amber-400"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="deletarItem('${item.id}')" class="text-red-400 hover:text-red-300"><i class="fa-solid fa-trash"></i></button>
              <button onclick="abrirModalInutilizar('${item.id}')" class="text-gray-400 hover:text-gray-300">
                <i class="fa-solid fa-ban text-[10px]"></i>
              </button>
            </div>
        </td>
      </tr>`;
    })
    .join("");
}

/**
 * Destaca visualmente uma linha da tabela pelo seu índice.
 */
function destacarLinha(index) {
  const rows = document.querySelectorAll("#itensList tr");
  if (rows.length === 0) return;

  if (index < 0) index = 0;
  if (index >= rows.length) index = rows.length - 1;

  rows.forEach((row) => {
    row.classList.remove(
      "row-highlight-active",
      "linha-recente",
      "border-l-4",
      "border-blue-500",
    );
    row
      .querySelectorAll("td")
      .forEach((td) =>
        td.classList.remove("bg-blue-600/20", "border-y", "border-blue-500/50"),
      );
  });

  const activeRow = rows[index];
  activeRow.classList.add(
    "row-highlight-active",
    "border-l-4",
    "border-blue-500",
  );
  activeRow
    .querySelectorAll("td")
    .forEach((td) =>
      td.classList.add("bg-blue-600/20", "border-y", "border-blue-500/50"),
    );

  selectedRowIndex = index;
  activeRow.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * Configura o comportamento de clique nas linhas da tabela para ativação de destaque.
 */
function configurarCliquesTabela() {
  const tableBody = document.getElementById("itensList");
  if (!tableBody) return;
  tableBody.onclick = (e) => {
    const row = e.target.closest("tr");
    if (
      row &&
      row.dataset.index !== undefined &&
      !e.target.closest("button") &&
      !e.target.closest("i")
    ) {
      destacarLinha(parseInt(row.dataset.index));
      window.idSelecionadoComponentes = row.dataset.id;
    } else if (!row) {
      window.idSelecionadoComponentes = null;
    }
  };
}

/**
 * Destaca automaticamente a última linha da tabela.
 */
function destacarUltimaLinha() {
  const rows = document.querySelectorAll("#itensList tr");
  if (rows.length > 0) {
    destacarLinha(rows.length - 1);
  }
}

/**
 * Atalhos de teclado para navegação na tabela via setas para cima/baixo.
 */
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    destacarLinha(selectedRowIndex + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    destacarLinha(selectedRowIndex - 1);
  }
});




async function registrarItem() {
  console.log("🚀 Iniciando processo de registro...");

  // 1. Validação de Campos Obrigatórios
  const camposObrigatorios = [
    { id: "X_input_id", label: "Fabricante" },
    { id: "nr_cilindro", label: "Número do Cilindro" },
    { id: "ano_fab", label: "Ano de Fabricação" },
    { id: "ult_reteste", label: "Último Reteste" },
    { id: "tipo_carga", label: "Tipo de Carga" },
    { id: "capacidade", label: "Capacidade" },
    { id: "nbr_select", label: "Norma NBR" },
  ];

  for (const campo of camposObrigatorios) {
    const el = document.getElementById(campo.id);
    if (!el || !el.value.trim()) {
      if (typeof window.exibirAlertaErro === "function") {
        window.exibirAlertaErro(`O campo "${campo.label}" é obrigatório.`);
      } else {
        alert(`⚠️ O campo "${campo.label}" não foi preenchido.`);
      }

      if (el) {
        el.focus();
        el.classList.add("input-error-shake");
        setTimeout(() => el.classList.remove("input-error-shake"), 2000);
      }
      return;
    }
  }

  if (window.fabricanteValido === false) {
    if (typeof exibirAlertaErro === "function") {
      exibirAlertaErro("ID do Fabricante não encontrado no banco de dados.");
    }
    const inputFab = document.getElementById("X_input_id");
    if (inputFab) {
      inputFab.focus();
      inputFab.classList.add("input-error-shake");
      setTimeout(() => inputFab.classList.remove("input-error-shake"), 2000);
    }
    return;
  }

  if (typeof validarAnoReteste === "function" && !validarAnoReteste()) return;

  let empresaIdLogada = localStorage.getItem("empresa_id");
  if (!empresaIdLogada) {
    console.warn("⚠️ empresa_id não encontrado no localStorage. Usando fallback '1'.");
    empresaIdLogada = "1";
  }

  const nomeOperadorLogado = localStorage.getItem("nome_operador");
  const osAtiva = window.currentOS || sessionStorage.getItem("currentOS");

  if (!osAtiva) {
    if (typeof window.exibirAlertaErro === "function") {
      window.exibirAlertaErro("Número da OS não identificado. Recarregue a página.");
    } else {
      alert("⚠️ Erro: Número da OS não identificado.");
    }
    return;
  }

  try {
    const _supabase = window._supabase;
    if (!_supabase) throw new Error("Cliente Supabase não inicializado.");

    // ==========================================
    // 🔒 CADEADO E CONTAGEM PRECISA POR MODELO
    // ==========================================
    const switchElement = document.getElementById("switchModoBalcao");
    const modoBalcaoAtivo = switchElement ? switchElement.checked : (localStorage.getItem("modo_balcao_ativo") === "true");
    const activeCargaId = localStorage.getItem("active_carga_id");

    if (modoBalcaoAtivo) {
        console.log("🛒 Modo Balcão ativado: Lançamento avulso (não afeta nenhuma carga).");
    } else if (activeCargaId && !window.editandoID) {
        const tipoSel = (document.getElementById("tipo_carga")?.value || "").toUpperCase().trim();
        const capSel = (document.getElementById("capacidade")?.value || "").toUpperCase().trim();
        
        const normalizarTexto = (str) => (str || "").toUpperCase().replace(/[^A-Z0-9]/g, '');
        const tentativaNormalizada = `${normalizarTexto(tipoSel)}${normalizarTexto(capSel)}`;

        const { data: cargaAtiva } = await _supabase
            .from('cargas_demandas')
            .select('*')
            .eq('id', activeCargaId)
            .maybeSingle();

        if (cargaAtiva && cargaAtiva.itens) {
            let itemPermitido = false;
            let temSaldo = false;

            const { data: jaLancados } = await _supabase
                .from('itens_os')
                .select('tipo_carga, capacidade')
                .eq('empresa_id', empresaIdLogada)
                .eq('carga_id', activeCargaId);

            for (const itemDemanda of cargaAtiva.itens) {
                const demandaNormalizada = normalizarTexto(itemDemanda.tipo);

                if (demandaNormalizada.includes(tentativaNormalizada) || tentativaNormalizada.includes(demandaNormalizada)) {
                    itemPermitido = true;

                    const feitosDeste = (jaLancados || []).filter(l => {
                        const tReg = normalizarTexto(l.tipo_carga);
                        const cReg = normalizarTexto(l.capacidade);
                        return `${tReg}${cReg}` === tentativaNormalizada;
                    }).length;

                    if (feitosDeste < (itemDemanda.qtd || 0)) {
                        temSaldo = true;
                    }
                    break;
                }
            }

            if (!itemPermitido) {
                if (typeof window.exibirAlertaErro === "function") {
                    window.exibirAlertaErro(`⚠️ BLOQUEADO: O item "${tipoSel} ${capSel}" não faz parte da demanda desta carga! (Ative o Modo Balcão se for avulso)`);
                } else {
                    alert(`⚠️ BLOQUEADO: Este item não faz parte da demanda desta carga.`);
                }
                return;
            }

            if (!temSaldo) {
                if (typeof window.exibirAlertaErro === "function") {
                    window.exibirAlertaErro(`⚠️ BLOQUEADO: A cota para o modelo "${tipoSel} ${capSel}" já foi totalmente atingida nesta carga!`);
                } else {
                    alert(`⚠️ BLOQUEADO: Cota esgotada para este modelo.`);
                }
                return;
            }
        }
    }
    // ==========================================

    if (typeof window.sincronizarPainelSelos === "function") {
      await window.sincronizarPainelSelos();
    }

    const limpar = (id, tipo = "text") => {
      const el = document.getElementById(id);
      if (!el) return null;
      const val = el.value.trim();
      if (val === "") return null;
      return tipo === "num" ? parseFloat(val.replace(",", ".")) : val;
    };

    const textoReteste = document.getElementById("display_prox_reteste")?.innerText;
    const textoRecarga = document.getElementById("display_prox_recarga")?.innerText;
    const activeNf = localStorage.getItem("active_nf");

    const dados = {
      os_number: osAtiva,
      empresa_id: empresaIdLogada,
      carga_id: modoBalcaoAtivo ? null : (activeCargaId || null),
      nota_fiscal: modoBalcaoAtivo ? null : (activeNf || null),           
      usuario_lancamento: window.editandoID ? undefined : nomeOperadorLogado || "Sistema",
      usuario_alteracao: nomeOperadorLogado || "Sistema",
      updated_at: new Date().toISOString(),
      nr_cilindro: limpar("nr_cilindro"),
      num_patrimonio: limpar("N-Patrimonio") || limpar("pallet"),
      fabricante_id: limpar("X_input_id", "num"),
      nbr: limpar("nbr_select"),
      tipo_carga: limpar("tipo_carga"),
      capacidade: limpar("capacidade"),
      ano_fab: limpar("ano_fab", "num"),
      ult_reteste: limpar("ult_reteste", "num"),
      prox_reteste: textoReteste && textoReteste !== "----" ? parseInt(textoReteste) : null,
      prox_recarga: typeof converterDataBRparaISO === "function" ? converterDataBRparaISO(textoRecarga) : null,
      p_vazio_valvula: limpar("p_vazio_valvula", "num"),
      p_cheio_valvula: limpar("p_cheio_valvula", "num"),
      p_atual: limpar("p_atual", "num"),
      tara_cilindro: limpar("tara_cilindro", "num"),
      p_cil_vazio_kg: limpar("p_cil_vazio_kg", "num"),
      vol_litros: limpar("vol_litros", "num"),
      dvm_et: limpar("dvm_et", "num"),
      dvp_ep: limpar("dvp_ep", "num"),
      nivel_manutencao: window.selectedLevel || 2,
      status_servico: document.getElementById("resultado_valor")?.value || "APROVADO",
      lote_nitrogenio: limpar("lote_nitrogenio"),
      ampola_vinculada: limpar("ampola_vinculada"),
      deposito_galpao: limpar("deposito_galpao"),
      local_extintor: limpar("local_extintor"),
    };

    if (!window.editandoID) {
      if (!window.proximoSeloCalculado) {
        if (typeof window.exibirAlertaErro === "function") {
          window.exibirAlertaErro("Lote de selos não carregado ou esgotado.");
        } else {
          alert("⚠️ Não há selos disponíveis.");
        }
        return;
      }

      dados.selo_inmetro = window.proximoSeloCalculado;
      dados.prefixo_selo = window.prefixoAtualSelo;

      const seloStr = String(window.proximoSeloCalculado).padStart(6, "0");
      dados.cod_barras = "21" + seloStr;
    }

    const listaComp = [
      "pistola", "valvula", "bucha", "sifao", "punho_pino", "quebra_jato",
      "manometro", "mangueira", "cord_plastico", "saia_plastica", "conj_apague",
      "difusor", "pera_ved", "mola_rosca", "conj_miolo", "conj_haste",
      "anel_oring", "sifao_aluminio", "conj_seguranca", "haste_valvula",
      "gancho_sup", "trava_corrente",
    ];

    listaComp.forEach((item) => {
      const el = document.getElementById(`comp_${item}`);
      dados[`comp_${item}`] = el ? el.checked : false;
    });

    console.log("📝 Dados preparados para envio:", dados);

    let resultado;
    if (window.editandoID) {
      resultado = await _supabase
        .from("itens_os")
        .update(dados)
        .eq("id", window.editandoID);
    } else {
      resultado = await _supabase.from("itens_os").insert([dados]);
    }

    if (resultado.error) throw resultado.error;

    // ⚡ VERIFICA E CONCLUI A CARGA AUTOMATICAMENTE AO BATER 100%
    if (activeCargaId && !modoBalcaoAtivo && !window.editandoID) {
        const { data: cargaAtual } = await _supabase.from('cargas_demandas').select('*').eq('id', activeCargaId).maybeSingle();
        if (cargaAtual && cargaAtual.status !== 'concluido' && cargaAtual.status !== 'concluído') {
            const { data: todosLancados } = await _supabase
                .from('itens_os')
                .select('tipo_carga, capacidade')
                .eq('empresa_id', empresaIdLogada)
                .eq('carga_id', activeCargaId);

            let totalMeta = 0;
            let totalRealizado = 0;

            (cargaAtual.itens || []).forEach(itemDemanda => {
                const demandaNorma = (itemDemanda.tipo || "").toUpperCase().replace(/[^A-Z0-9]/g, '');
                const realizados = (todosLancados || []).filter(l => {
                    const reg = `${(l.tipo_carga || "")}${(l.capacidade || "")}`.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    return reg === demandaNorma;
                }).length;

                totalMeta += (itemDemanda.qtd || 0);
                totalRealizado += realizados;
            });

            if (totalMeta > 0 && totalRealizado >= totalMeta) {
                await _supabase.from('cargas_demandas').update({
                    status: 'concluido',
                    data_conclusao_oficina: new Date().toISOString()
                }).eq('id', activeCargaId);

                console.log("🎉 Meta de 100% atingida! Carga marcada como concluída no banco.");
            }
        }
    }

    const switchAvulsaAtivo = document.getElementById("switchEtiqueta")?.checked;

    if (switchAvulsaAtivo) {
        const itemSalvo = resultado.data ? resultado.data[0] : dados;
        if (typeof prepararModalEtiqueta === "function" && itemSalvo) {
            prepararModalEtiqueta(itemSalvo);
            console.log("🏷️ Impressão avulsa acionada para o item.");
        }
    } else {
        console.log("📦 Modo lote ativo: Item registrado.");
    }

    // if (modoBalcaoAtivo) {
    //     if (switchElement) switchElement.checked = false;
    //     localStorage.removeItem('modo_balcao_ativo');
    //     console.log("🛒 Balcão registrado com sucesso. Retornando para a demanda ativa.");
    // }

    if (typeof window.atualizarEspelhoProducao === "function") {
        window.atualizarEspelhoProducao();
    }

    if (typeof renderizarCardDemandaAtivaAside === "function") {
        renderizarCardDemandaAtivaAside();
    }

    await carregarItens();
    focarUltimoRegistro();
    limparCamposAposRegistro();

    if (typeof window.sincronizarPainelSelos === "function") {
      await window.sincronizarPainelSelos();
    }

    if (typeof window.resetarBotaoRegistro === "function") {
      window.resetarBotaoRegistro();
    }
  } catch (err) {
    console.error("Erro no salvamento:", err);
    if (typeof window.exibirAlertaErro === "function") {
      window.exibirAlertaErro("Erro ao salvar: " + (err.message || "Erro desconhecido."));
    } else {
      alert("Erro ao salvar: " + (err.message || "Erro desconhecido."));
    }
  }
}





// 1. Captura a carga e a NF vinda do Controle de Cargas
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cargaIdUrl = urlParams.get('cargaId');
    const nfUrl = urlParams.get('nf');

    if (cargaIdUrl) {
        localStorage.setItem('active_carga_id', cargaIdUrl);
        localStorage.setItem('active_nf', nfUrl || '');
    }

    // Carrega o card ativo no menu lateral assim que a página abre
    renderizarCardDemandaAtivaAside();
});






async function renderizarCardDemandaAtivaAside() {
    const activeCargaId = localStorage.getItem('active_carga_id');
    const container = document.getElementById('containerPedidoAtivo');
    const modoBalcaoAtivo = localStorage.getItem('modo_balcao_ativo') === 'true';
    
    if (!container) return;

    // Se o Modo Balcão estiver ligado, mostra o aviso amigável, mas NÃO apaga o ID da carga do navegador!
    if (modoBalcaoAtivo) {
        container.innerHTML = `
            <div class="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-center shadow-inner">
                <span class="text-[9px] text-amber-400 uppercase font-black tracking-widest block">🛒 MODO BALCÃO ATIVO</span>
                <span class="text-[10px] text-slate-300 font-medium block mt-1">Lançamento avulso (A demanda principal está pausada).</span>
            </div>
        `;
        return;
    }

    if (!activeCargaId) {
        container.innerHTML = `
            <div class="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                <span class="text-[9px] text-slate-500 uppercase font-bold">Nenhuma carga vinculada.</span>
            </div>
        `;
        return;
    }

    // Se o balcão estiver desligado, renderiza normalmente a demanda com o saldo restante!
    try {
        const _supabase = window._supabase;
        if (!_supabase) return;

        const { data: carga, error } = await _supabase.from('cargas_demandas').select('*').eq('id', activeCargaId).maybeSingle();
        if (error || !carga) throw error;

        const { data: itensLancados, error: errItens } = await _supabase
            .from('itens_os')
            .select('tipo_carga, capacidade, carga_id')
            .eq('empresa_id', localStorage.getItem('empresa_id') || '1')
            .eq('carga_id', activeCargaId);

        if (errItens) throw errItens;

        let htmlItensUnificados = '';
        let totalGeralMeta = 0;
        let totalGeralRealizado = 0;

        (carga.itens || []).forEach(itemDemanda => {
            const demandaTipoNorma = (itemDemanda.tipo || "").toUpperCase().replace(/[^A-Z0-9]/g, '');

            const realizadosDesteTipo = (itensLancados || []).filter(lancado => {
                const tipoReg = (lancado.tipo_carga || "").toUpperCase();
                const capReg = (lancado.capacidade || "").toUpperCase();
                const chaveLancada = `${tipoReg}${capReg}`.replace(/[^A-Z0-9]/g, '');
                return chaveLancada === demandaTipoNorma;
            }).length;

            const metaDesteTipo = itemDemanda.qtd || 0;
            totalGeralMeta += metaDesteTipo;
            totalGeralRealizado += realizadosDesteTipo;

            const restam = Math.max(0, metaDesteTipo - realizadosDesteTipo);
            const completo = realizadosDesteTipo >= metaDesteTipo;

            htmlItensUnificados += `
                <div class="flex items-center justify-between text-[11px] py-2 px-2.5 bg-slate-950/80 rounded-xl border ${completo ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-white/5'} mb-1.5 last:mb-0">
                    <span class="text-white font-bold tracking-tight pr-2 flex-1 break-words">• ${itemDemanda.tipo}</span>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <span class="text-[10px] font-black ${completo ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'} px-2 py-0.5 rounded-lg">
                            ${realizadosDesteTipo}/${metaDesteTipo}x
                        </span>
                        ${!completo ? `
                            <span class="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                Falta: ${restam}
                            </span>
                        ` : `
                            <span class="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">✓</span>
                        `}
                    </div>
                </div>
            `;
        });

        const progressoGeral = totalGeralMeta > 0 ? Math.min(Math.round((totalGeralRealizado / totalGeralMeta) * 100), 100) : 0;
        const isCargaConcluida = totalGeralRealizado >= totalGeralMeta || carga.status === 'concluido';

        container.innerHTML = `
            <div class="bg-slate-900 border ${isCargaConcluida ? 'border-emerald-500/30' : 'border-amber-500/30'} p-3.5 rounded-2xl shadow-inner space-y-2.5">
                <div class="flex justify-between items-center">
                    <span class="text-[8px] font-black ${isCargaConcluida ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'} px-2 py-0.5 rounded uppercase tracking-wider">
                        ${isCargaConcluida ? 'CONCLUÍDO' : 'EM ANDAMENTO'}
                    </span>
                    <span class="text-[9px] text-slate-400 font-mono font-bold">${progressoGeral}%</span>
                </div>

                <div>
                    <div class="text-xs font-black text-white tracking-tight">NF: ${carga.nota_fiscal}</div>
                    <div class="text-[10px] text-amber-500 font-medium truncate">${carga.cliente}</div>
                </div>

                <div class="space-y-1 pt-1 border-t border-slate-800">
                    <div class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Espelho de Produção (Andamento)</div>
                    ${htmlItensUnificados}
                </div>
            </div>
        `;
    } catch (err) {
        console.error("Erro ao renderizar card lateral da carga:", err);
    }
}




/**
 * Converte uma data no formato brasileiro (DD/MM/AAAA) para o formato ISO (AAAA-MM-DD).
 */
function converterDataBRparaISO(dataBR) {
  if (
    !dataBR ||
    dataBR === "----" ||
    dataBR.includes("undefined") ||
    dataBR.length < 8
  )
    return null;
  const partes = dataBR.trim().split("/");
  if (partes.length !== 3) return null;
  const [d, m, a] = partes;
  return `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/**
 * Limpa todos os campos do formulário para preparar a entrada de um novo registro.
 */
function limparCamposAposRegistro() {
  const idsParaLimpar = [
    "X_input_id",
    "ano_fab",
    "nr_cilindro",
    "ult_reteste",
    "tipo_carga",
    "capacidade",
    "nbr_select",
    "lote_nitrogenio",
    "ampola_vinculada",
    "selo_anterior",
    "data_selagem",
    "cod_barras",
    "deposito_galpao",
    "N-Patrimonio",
    "local_extintor",
    "obs_ensaio",
    "p_vazio_valvula",
    "p_cheio_valvula",
    "p_atual",
    "porcent_dif",
    "tara_cilindro",
    "p_cil_vazio_kg",
    "perda_massa_porcent",
    "vol_litros",
    "dvm_et",
    "dvp_ep",
    "ee_resultado",
    "et_ensaio",
    "ep_ensaio",
    "ee_calculado",
    "ep_porcent_final",
  ];

  idsParaLimpar.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const displayRecarga = document.getElementById("display_prox_recarga");
  const displayReteste = document.getElementById("display_prox_reteste");
  const displayFabricante = document.getElementById("nome_fabricante_preview");
  if (displayRecarga) {
    displayRecarga.innerText = "--/--/----";
  }
  if (displayReteste) {
    displayReteste.innerText = "----";
  }
  if (displayFabricante) {
    displayFabricante.innerText = "";
  }

  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb) => {
    // Protege o switch de etiqueta e os switches de modo para não serem limpos pelo reset
    if (cb.id !== "switchEtiqueta" && cb.id !== "switchModoBalcao" && cb.id !== "switchModoDemanda") {
      cb.checked = false;
    }
  });

  // const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  // checkboxes.forEach((cb) => {
  //   if (cb.id !== "switchEtiqueta") {
  //     cb.checked = false;
  //   }
  // });
  const badgeComp = document.getElementById("badge-comp");
  if (badgeComp) {
    badgeComp.innerText = "0";
    badgeComp.classList.add("hidden");
  }
  window.editandoID = null;
  window.idSelecionadoComponentes = null;
  window.fabricanteValido = false;
  if (typeof setLevel === "function") {
    setLevel(2);
  }
  setTimeout(() => {
    document.getElementById("X_input_id")?.focus();
  }, 100);
}

/**
 * Implementa a navegação automática de foco entre os campos do formulário ao pressionar 'Enter'.
 */
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    // Ignora a navegação automática se o usuário estiver dentro de qualquer Modal
    if (e.target.closest(".fixed") || e.target.closest("[id^='modal']")) return;

    // Ignora botões e áreas de texto
    if (e.target.tagName === "BUTTON" || e.target.tagName === "TEXTAREA")
      return;

    const sequence = [
      "cod_barras",
      "X_input_id",
      "nr_cilindro",
      "ano_fab",
      "ult_reteste",
      "tipo_carga",
      "capacidade",
      "nbr_select",
      "lote_nitrogenio",
      "ampola_vinculada",
      "data_selagem",
      "selo_anterior",
      "pallet",
      "deposito_galpao",
      "local_extintor",

      "p_vazio_valvula",
      "p_cheio_valvula",
      "p_atual",
      "porcent_dif",

      "tara_cilindro",
      "p_cil_vazio_kg",
      "perda_massa_porcent",

      "vol_litros",
      "dvm_et",
      "dvp_ep",
      "ee_resultado",

      "et_ensaio",
      "ep_ensaio",
      "ee_calculado",
      "ep_porcent_final",
    ];
    const currentIndex = sequence.indexOf(e.target.id);
    if (currentIndex !== -1) {
      e.preventDefault();

      for (let i = currentIndex + 1; i < sequence.length; i++) {
        const nextField = document.getElementById(sequence[i]);

        if (nextField && nextField.offsetParent !== null) {
          nextField.focus();
          if (nextField.tagName === "INPUT" && !nextField.readOnly) {
            nextField.select();
          }
          return;
        }
      }
      const btnRegistrar = document.querySelector(
        'button[onclick="registrarItem()"]',
      );
      if (btnRegistrar) btnRegistrar.focus();
    }
  }
});


window.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const cargaId = params.get("cargaId");
    const container = document.getElementById("containerPedidoAtivo");

    if (!container) return;

    if (!cargaId) {
      container.innerHTML = `
        <div class="p-3 bg-slate-900/40 border border-white/5 rounded-xl text-center text-[10px] text-slate-500">
          Nenhum pedido vinculado.
        </div>
      `;
      return;
    }

    try {
      const chaveAnon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s";
      
      const respCarga = await fetch("https://gzojpxgpgjapsegerscb.supabase.co/rest/v1/cargas_demandas?id=eq." + cargaId, {
        headers: { "apikey": chaveAnon, "Authorization": "Bearer " + chaveAnon }
      });
      const cargas = await respCarga.json();
      if (!cargas || cargas.length === 0) throw new Error("Carga não encontrada.");
      const carga = cargas.shift();

      window.atualizarEspelhoProducao = async function() {
        const osAtual = window.currentOS || sessionStorage.getItem("currentOS") || "2";

        const respItens = await fetch(`https://gzojpxgpgjapsegerscb.supabase.co/rest/v1/itens_os?os_number=eq.${osAtual}&select=tipo_carga,capacidade`, {
          headers: { "apikey": chaveAnon, "Authorization": "Bearer " + chaveAnon }
        });
        const itensRegistrados = await respItens.json() || [];

        renderizarCardsDuplosTotalmenteFlexivel(carga, itensRegistrados, container);
      };

      await window.atualizarEspelhoProducao();

    } catch (err) {
      console.error("Erro ao carregar espelho:", err);
      container.innerHTML = `
        <div class="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-center text-[10px] text-red-400">
          Erro ao carregar pedido.
        </div>
      `;
    }
  });

  function renderizarCardsDuplosTotalmenteFlexivel(carga, itensRegistrados, container) {
    const dataFormatada = new Date(carga.data_criacao).toLocaleDateString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    
    const contagemRegistrada = {};
    (carga.itens || []).forEach(item => {
      contagemRegistrada[item.tipo] = 0;
    });

    // Mapeamento Totalmente Flexível: Cruza qualquer registo que tenha a capacidade numérica correspondente ou parte do texto
    itensRegistrados.forEach(reg => {
      const tipoReg = (reg.tipo_carga || "").toLowerCase();
      const capReg = String(reg.capacidade || "").toLowerCase().replace(/[^0-9]/g, ""); // ex: "6"

      (carga.itens || []).forEach(item => {
        const tipoItem = item.tipo.toLowerCase();
        const capItemMatch = tipoItem.match(/\d+/);
        const capItemNum = capItemMatch ? capItemMatch[0] : ""; // ex: "6"

        // Extrai palavras-chave essenciais (ex: "pqs", "co2", "abc", "agua")
        const palavrasChave = tipoItem.split(/[\s\-\(\)\/]+/);
        let matchTexto = palavrasChave.some(palavra => palavra.length > 2 && tipoReg.includes(palavra));

        // Se o tipo do registo bater com alguma palavra do item da carga OU se a capacidade for idêntica
        const matchCapacidade = (capReg && capItemNum) ? (capReg === capItemNum) : false;

        // Atribui o ponto se pertencer ao mesmo grupo de capacidade/tipo
        if (matchCapacidade || (matchTexto && capReg === capItemNum)) {
          contagemRegistrada[item.tipo]++;
        } else if (!matchCapacidade && carga.itens.length === 1) {
          // Se houver apenas 1 tipo de item na carga, qualquer registo vai para ele diretamente
          contagemRegistrada[item.tipo]++;
        }
      });
    });

    let tudoConcluido = true;
    let itensEspelhoHtml = "";

    const itensDemandaHtml = (carga.itens || []).map(i => {
      let produzidoReal = contagemRegistrada[i.tipo] || 0;
      if (produzidoReal > i.qtd) produzidoReal = i.qtd; // Trava para não ultrapassar a meta
      
      const falta = i.qtd - produzidoReal;
      const concluidoItem = falta <= 0;

      if (!concluidoItem) tudoConcluido = false;

      if (!concluidoItem) {
        itensEspelhoHtml += `
          <div class="flex items-center justify-between text-[10px] py-1 px-2 bg-red-950/30 border border-red-500/20 rounded-lg mb-1">
            <span class="text-slate-300 truncate">• ${i.tipo}</span>
            <span class="bg-red-500/20 text-red-400 font-black px-2 py-0.5 rounded text-[9px] animate-pulse">Faltam: ${falta}x</span>
          </div>
        `;
      }

      return `
        <div class="flex items-center justify-between text-[10px]">
          <span class="${concluidoItem ? 'text-emerald-400 line-through font-bold' : 'text-slate-300'} truncate">• ${i.tipo}</span>
          <span class="${concluidoItem ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 text-amber-400'} font-bold px-1.5 py-0.5 rounded text-[9px]">
            ${produzidoReal}/${i.qtd}x
          </span>
        </div>
      `;
    }).join("");

    const bordaCardPrincipal = tudoConcluido ? "border-emerald-500/80 bg-emerald-950/20" : "border-amber-500/30 bg-slate-900/90";
    const badgeStatusPrincipal = tudoConcluido 
      ? `<span class="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black px-2 py-0.5 rounded-full">CONCLUÍDO</span>`
      : `<span class="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black px-2 py-0.5 rounded-full">${carga.vendedor_nome || 'Vendedor'}</span>`;

    container.innerHTML = `
      <!-- CARD 1: PEDIDO DA DEMANDA PRINCIPAL -->
      <div onclick="abrirModalDetalhesCarga()" 
           class="${bordaCardPrincipal} rounded-xl p-3 shadow-xl space-y-2 cursor-pointer transition-all mb-2">
        
        <div class="flex justify-between items-center">
          ${badgeStatusPrincipal}
          <span class="text-[9px] text-slate-400 font-mono">${dataFormatada}</span>
        </div>

        <div>
          <div class="text-xs font-black text-white">NF: ${carga.nota_fiscal}</div>
          <div class="text-[11px] font-bold text-amber-200/90 truncate">${carga.cliente}</div>
        </div>

        <div class="bg-slate-950/80 border border-white/5 p-2 rounded-lg space-y-1">
          <div class="text-[9px] font-black text-slate-400 uppercase flex justify-between">
            <span>Progresso Geral</span>
            <span class="${tudoConcluido ? 'text-emerald-400' : 'text-amber-400'}">${tudoConcluido ? '100%' : 'Em Produção'}</span>
          </div>
          ${itensDemandaHtml}
        </div>
      </div>

      <!-- CARD 2: ESPELHO (SALDO RESTANTE EM TEMPO REAL) -->
      ${!tudoConcluido ? `
        <div class="bg-slate-900/90 border border-red-500/30 rounded-xl p-3 shadow-xl space-y-1.5 animate-fade-in">
          <div class="text-[9px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <i class="fa-solid fa-triangle-exclamation"></i> Saldo Pendente (Espelho)
          </div>
          ${itensEspelhoHtml}
        </div>
      ` : `
        <div class="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-center text-emerald-400 text-[10px] font-bold">
          🎉 Todos os itens desta carga foram produzidos!
        </div>
      `}
    `;
  }

  function abrirModalDetalhesCarga() {
    console.log("Abrir modal de detalhes da carga...");
  }

function toggleModoBalcao(checkbox) {
    if (checkbox.checked) {
        localStorage.setItem('modo_balcao_ativo', 'true');
        console.log("🛒 Modo Balcão ATIVADO: Lançamento avulso permitido.");
    } else {
        localStorage.removeItem('modo_balcao_ativo');
        console.log("🔒 Modo Balcão DESATIVADO: Retornando à demanda original.");
    }
    
    // Atualiza o aside imediatamente
    if (typeof renderizarCardDemandaAtivaAside === "function") {
        renderizarCardDemandaAtivaAside();
    }
}

// Garante que o switch venha marcado ao abrir a página se já estiver ativo
window.addEventListener("DOMContentLoaded", () => {
    const isBalcao = localStorage.getItem('modo_balcao_ativo') === 'true';
    const switchEl = document.getElementById('switchModoBalcao');
    if (switchEl) switchEl.checked = isBalcao;
});


  
window.fixData = fixData;
window.carregarItens = carregarItens;
window.focarUltimoRegistro = focarUltimoRegistro;
window.renderItens = renderItens;
window.renderizarLinhas = renderItens; // Compatibilidade com chamadas antigas
window.destacarLinha = destacarLinha;
window.configurarCliquesTabela = configurarCliquesTabela;
window.destacarUltimaLinha = destacarUltimaLinha;
window.registrarItem = registrarItem;
