/**
 * RASTREABILIDADE - YA SE PRO
 * renderizarTabela.js - Versão Integral 2026
 */

// 1. CARREGAMENTO E SINCRONIZAÇÃO
async function carregarItens() {
  try {
    // Usa a variável global unificada
    const osAtiva = window.currentOS || sessionStorage.getItem("currentOS");

    if (!osAtiva) {
      console.error("OS não definida para carregamento");
      return;
    }

    const { data, error } = await _supabase
      .from("itens_os")
      .select("*")
      .eq("os_number", osAtiva)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Atualiza o contador na sidebar
    const contadorEl = document.getElementById("itemCounter");
    if (contadorEl) contadorEl.innerText = data ? data.length : 0;

    renderItens(data);
  } catch (err) {
    console.error("Erro ao carregar tabela:", err);
  }
}







// Auxiliar para formatar datas na visualização
function fixData(v) {
  if (!v || v === "-" || v === "null") return "-";
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString("pt-BR");
  } catch (e) {
    return v;
  }
}


// 2. RENDERIZAÇÃO DA TABELA (ORDEM SOLICITADA)

function renderItens(itens) {
  const list = document.getElementById("itensList");
  if (!list) return;

  if (!itens || itens.length === 0) {
    list.innerHTML = `<tr><td colspan="38" class="p-10 text-center text-slate-500 italic">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  list.innerHTML = itens
    .map((item, index) => {
      // 1. AJUSTE DE STATUS: Pega o valor do banco e garante que entenda NOVO, APR e REP
      const s = (item.status_servico || "APROVADO").toUpperCase();
      
      let classesStatus = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"; // Padrão APR
      
      if (s === "REPROVADO" || s === "REP") {
        classesStatus = "bg-red-500/10 text-red-400 border-red-500/20";
      } else if (s === "NOVO") {
        classesStatus = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      }

      // Funções de formatação interna
      const formatarComHora = (dataStr) => {
        if (!dataStr || dataStr === "") return "-";
        const d = new Date(dataStr);
        return isNaN(d) ? dataStr : d.toLocaleString("pt-BR");
      };

      const dataLancamento = formatarComHora(item.created_at);
      const dataAlteracao = item.updated_at ? formatarComHora(item.updated_at) : "Sem alterações";
      const dataSelagem = formatarComHora(item.data_selagem);

      return `
        <tr class="group text-[11px] border-b border-slate-800 hover:bg-slate-800/40 transition-colors whitespace-nowrap">
            <td class="p-3 text-slate-500">${index + 1}</td>
            <td class="p-3 font-black text-amber-500 bg-amber-500/5">${item.selo_inmetro || "-"}</td>
            <td class="p-3 font-bold text-slate-200">${item.nr_cilindro || "S/N"}</td>
            <td class="p-3">${item.nbr || "-"}</td>
            <td class="p-3">${item.fabricante_id || "-"}</td>
            <td class="p-3">${item.ano_fab || "-"}</td>
            <td class="p-3">${item.ult_reteste || "-"}</td>
            <td class="px-4 py-3 text-xs font-bold text-orange-500">${item.prox_reteste ? item.prox_reteste : "-"}</td>
            <td class="p-3 text-amber-500 font-bold">${item.prox_recarga || "-"}</td>
            
            <td class="p-3 sticky left-0 z-20 bg-slate-900 border-r border-slate-700 font-bold text-indigo-400 shadow-[2px_0_5px_rgba(0,0,0,0.3)] group-hover:bg-[#1e293b]">
                ${item.tipo_carga || "-"} / ${item.capacidade || "-"}
            </td>

            <td class="p-3">${item.usuario_lancamento || "-"}</td>
            <td class="p-3 text-center">${item.nivel_manutencao || "2"}</td>
            
            <td class="p-3">
                <span class="px-2 py-0.5 rounded border font-bold text-[9px] ${classesStatus}">
                    ${s}
                </span>
            </td>

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

            <td class="p-3 text-slate-400 font-mono text-[10px]">${dataLancamento}</td>
            <td class="p-3 font-mono text-[10px]">${item.cod_barras || "-"}</td>
            <td class="p-3">${item.lote_nitrogenio || "-"}</td>
            <td class="p-3 font-mono text-[10px] text-cyan-400">${dataSelagem}</td> 
            <td class="p-3">${item.ampola_vinculada || "-"}</td>
            <td class="p-3">${item.deposito_galpao || "-"}</td>
            <td class="p-3 font-bold text-indigo-400 bg-indigo-500/5 text-center border-x border-slate-800/20">${item.num_patrimonio || "-"}</td>
            <td class="p-3">${item.local_especifico || "-"}</td>
            
            <td class="p-3 text-[9px] text-slate-500 italic font-mono">${dataAlteracao}</td>
            <td class="p-3 text-[9px] font-bold text-amber-600/80">${item.usuario_alteracao || "-"}</td>

            <td class="p-3 sticky right-0 z-20 bg-slate-900 border-l border-slate-700 text-right pr-4 shadow-[-5px_0_10px_rgba(0,0,0,0.5)] group-hover:bg-[#1e293b]">
                <div class="flex gap-2 justify-end">
                    <button onclick="prepararEdicao('${item.id}')" class="text-amber-500 hover:text-amber-400"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="deletarItem('${item.id}')" class="text-red-400 hover:text-red-300"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    })
    .join("");
}

// 3. REGISTRO (CONECTANDO INPUTS AOS CAMPOS DO BANCO)

async function registrarItem() {
  try {
    // CAPTURA O SELO DIRETAMENTE DO HTML (O campo amarelo que calculamos)
    const seloTexto = document.getElementById("proximo_selo_num")?.innerText;
    const seloNum = parseInt(seloTexto);
    
    const checks = document.querySelectorAll(".custom-checkbox");

    // Captura os valores dos displays
    const textoReteste = document.getElementById("display_prox_reteste")?.innerText;
    const textoRecarga = document.getElementById("display_prox_recarga")?.innerText;

    // 1. MONTAGEM DO OBJETO DE DADOS
    const dados = {
      os_number: window.currentOS || sessionStorage.getItem("currentOS"),
      selo_inmetro: isNaN(seloNum) ? null : seloNum, // GARANTE QUE O NÚMERO SEQUENCIAL VAI PARA O BANCO
      nr_cilindro: document.getElementById("nr_cilindro")?.value,
      num_patrimonio: document.getElementById("N-Patrimonio")?.value || document.getElementById("pallet")?.value,

      // Checklist e Manutenção
      ens_pneum_manometro: checks[0]?.checked || false,
      ens_pneum_valvula: checks[1]?.checked || false,
      reg_valvula_alivio: checks[2]?.checked || false,
      ens_cond_eletrica: checks[3]?.checked || false,
      ens_hidrost_valvula: checks[4]?.checked || false,
      ens_hidrost_mangueira: checks[5]?.checked || false,
      comp_pintura: document.getElementById("comp_pintura")?.checked || false,

      // Pesagem e Medições
      p_vazio_valvula: document.getElementById("p_vazio_valvula")?.value,
      p_cheio_valvula: document.getElementById("p_cheio_valvula")?.value,
      p_atual: document.getElementById("p_atual")?.value,
      porcent_dif: document.getElementById("porcent_dif")?.value,
      tara_cilindro: document.getElementById("tara_cilindro")?.value,
      p_cil_vazio_kg: document.getElementById("p_cil_vazio_kg")?.value,
      perda_massa_porcent: document.getElementById("perda_massa_porcent")?.value,
      vol_litros: document.getElementById("vol_litros")?.value,
      dvh: document.getElementById("dvh")?.value,
      dvp: document.getElementById("dvp")?.value,
      ee: document.getElementById("ee")?.value,
      dvm_et: document.getElementById("dvm_et")?.value,
      dvp_ep: document.getElementById("dvp_ep")?.value,
      ee_calculado: document.getElementById("ee_calculado")?.value,
      ep_porcent_final: document.getElementById("ep_porcent_final")?.value,

      // --- AJUSTE DE DATAS E INTEIROS ---
      prox_reteste: (textoReteste && textoReteste !== "----") ? parseInt(textoReteste) : null,
      prox_recarga: typeof converterDataBRparaISO === "function" ? converterDataBRparaISO(textoRecarga) : null,

      tipo_carga: document.getElementById("tipo_carga")?.value,
      capacidade: document.getElementById("capacidade")?.value,
      nbr: document.getElementById("nbr_select")?.value,
      ano_fab: parseInt(document.getElementById("ano_fab")?.value) || null,
      ult_reteste: parseInt(document.getElementById("ult_reteste")?.value) || null,
      nivel_manutencao: window.selectedLevel || 2,
      status_servico: document.getElementById("resultado_valor")?.value || "APROVADO",
      usuario_lancamento: document.getElementById("userName")?.innerText || "Técnico",

      cod_barras: document.getElementById("cod_barras")?.value,
      lote_nitrogenio: document.getElementById("lote_nitrogenio")?.value,
      data_selagem: document.getElementById("data_selagem")?.value || null,
      ampola_vinculada: document.getElementById("ampola_vinculada")?.value,
      deposito_galpao: document.getElementById("deposito_galpao")?.value,
      local_especifico: document.getElementById("local_extintor")?.value,
      fabricante_id: parseInt(document.getElementById("X_input_id")?.value) || null,
    };

    // Componentes do modal
    const listaComp = ["pistola","valvula","bucha","sifao","punho_pino","quebra_jato","manometro","mangueira","cord_plastico","saia_plastica","conj_apague","difusor","pera_ved","mola_rosca","conj_miolo","conj_haste","anel_oring","sifao_aluminio","conj_seguranca","haste_valvula","gancho_sup","trava_corrente"];
    listaComp.forEach((item) => {
      dados[`comp_${item}`] = document.getElementById(`comp_${item}`)?.checked || false;
    });

    // 2. LÓGICA DE SALVAMENTO
    if (window.editandoID) {
      const { error } = await _supabase
        .from("itens_os")
        .update(dados)
        .eq("id", window.editandoID);

      if (error) throw error;
      window.editandoID = null;
      const btnReg = document.querySelector('button[onclick="registrarItem()"]');
      if (btnReg) {
        btnReg.innerHTML = '<i class="fa-solid fa-plus-circle"></i> REGISTRAR';
        btnReg.classList.remove("bg-emerald-500");
        btnReg.classList.add("bg-indigo-600");
      }
    } else {
      const { error } = await _supabase.from("itens_os").insert([dados]);
      if (error) throw error;
    }

    // 3. FINALIZAÇÃO E ATUALIZAÇÃO DA TELA
    await carregarItens();
    limparCamposAposRegistro();
    
    // --- CORREÇÃO AQUI: CHAMA A FUNÇÃO CORRETA DO SEU ARQUIVO atualizarSelo.js ---
    if (typeof monitorarLoteAtivo === "function") {
      await monitorarLoteAtivo(); 
    }

  } catch (err) {
    console.error("Erro no processo de salvamento:", err);
    alert("Erro ao salvar: " + err.message);
  }
}









// 4. FUNÇÕES DE APOIO
function converterDataBRparaISO(dataBR) {
  if (!dataBR || dataBR === "----" || dataBR.includes("undefined") || dataBR.length < 8) return null;
  const partes = dataBR.trim().split("/");
  if (partes.length !== 3) return null;
  const [d, m, a] = partes;
  return `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}








function limparCamposAposRegistro() {
  console.log("Executando limpeza completa...");

  // 1. Limpa todos os Inputs e Selects da lista
  const idsParaLimpar = [
    "X_input_id", "ano_fab", "nr_cilindro", "ult_reteste", "tipo_carga",
    "capacidade", "nbr_select", "lote_nitrogenio", "ampola_vinculada",
    "selo_anterior", "data_selagem", "cod_barras", "deposito_galpao", 
    "N-Patrimonio", "local_extintor", "resultado_valor", "obs_ensaio",
    "p_vazio_valvula", "p_cheio_valvula", "p_atual", "porcent_dif",
    "tara_cilindro", "p_cil_vazio_kg", "perda_massa_porcent", "vol_litros",
    "dvm_et", "dvp_ep", "ee_resultado", "et_ensaio", "ep_ensaio",
    "ee_calculado", "ep_porcent_final"
  ];

  idsParaLimpar.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = ""; 
  });

  // 2. O PULO DO GATO: Limpar os campos de exibição (os que você circulou)
  // Usamos innerText porque eles não são inputs de digitação
  const displayRecarga = document.getElementById("display_prox_recarga");
  const displayReteste = document.getElementById("display_prox_reteste");

  if (displayRecarga) {
    displayRecarga.innerText = "--/--/----"; // Limpa o campo Azul
  }
  if (displayReteste) {
    displayReteste.innerText = "----"; // Limpa o campo Vermelho
  }

  // 3. Reset dos Checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb) => {
    if (cb.id !== "switchEtiqueta") {
      cb.checked = false;
    }
  });

  // 4. Reset do Badge de componentes
  const badgeComp = document.getElementById("badge-comp");
  if (badgeComp) {
    badgeComp.innerText = "0";
    badgeComp.classList.add("hidden");
  }

  // 5. Reset de Estado (Nível 2 padrão)
  window.editandoID = null;
  if (typeof setLevel === "function") {
    setLevel(2);
  }

  // 6. Foco no primeiro campo para iniciar novo registro
  setTimeout(() => {
    document.getElementById("X_input_id")?.focus();
  }, 100);
}









// Inicialização
window.addEventListener("load", () => {
  setTimeout(carregarItens, 500);
});










document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
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

      // GRUPO PESAGEM
      "p_vazio_valvula",
      "p_cheio_valvula",
      "p_atual",
      "porcent_dif", // <-- Adicionado (Visualização)

      // GRUPO PERDA DE MASSA
      "tara_cilindro",
      "p_cil_vazio_kg",
      "perda_massa_porcent", // <-- Adicionado (Visualização)

      // GRUPO CUBAGEM
      "vol_litros",
      "dvm_et",
      "dvp_ep",
      "ee_resultado", // <-- Adicionado (Visualização)

      // GRUPO HIDROSTÁTICO
      "et_ensaio",
      "ep_ensaio",
      "ee_calculado",
      "ep_porcent_final", // <-- Adicionado (Visualização)
    ];

    const currentIndex = sequence.indexOf(e.target.id);

    if (currentIndex !== -1) {
      e.preventDefault();

      for (let i = currentIndex + 1; i < sequence.length; i++) {
        const nextField = document.getElementById(sequence[i]);

        if (nextField && nextField.offsetParent !== null) {
          nextField.focus();

          // Se o campo for readonly (como as porcentagens), apenas foca para conferência
          // Se for input normal, seleciona o texto.
          if (nextField.tagName === "INPUT" && !nextField.readOnly) {
            nextField.select();
          }
          return;
        }
      }

      // Ao final de tudo, foca no botão REGISTRAR
      const btnRegistrar = document.querySelector(
        'button[onclick="registrarItem()"]',
      );
      if (btnRegistrar) btnRegistrar.focus();
    }
  }
});
