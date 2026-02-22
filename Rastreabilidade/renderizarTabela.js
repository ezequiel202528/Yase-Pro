// ATENÇÃO: Não declare SUPABASE_URL ou _supabase aqui.
// Eles já vêm do main.js automaticamente.

/**
 * RASTREABILIDADE - YA SE PRO
 * renderizarTabela.js: Gestão da lista e gravação de itens
 */

function renderItens(itens) {
  const list = document.getElementById("itensList");
  const counter = document.getElementById("itemCounter");
  if (counter) counter.innerText = itens.length;

  if (!itens || itens.length === 0) {
    list.innerHTML = `<tr><td colspan="30" class="p-10 text-center text-slate-400 italic">Nenhum item registrado.</td></tr>`;
    return;
  }

  list.innerHTML = itens.map((item, index) => {
    // Lógica de cores para o Status
    const statusRaw = item.resultado || "APROVADO";
    const statusResumo = statusRaw.substring(0, 3).toUpperCase();
    const statusColor = statusResumo === 'REP' ? 'text-red-500' : 'text-emerald-500';

    return `
    <tr class="tr-item-tabela transition-all text-[11px] border-b border-slate-800 hover:bg-slate-800/30">
        
        <td class="p-4 text-slate-500 font-medium">${index + 1}</td>

        <td class="p-4 font-black text-amber-500">${item.proximo_selo_num || item.selo_proximo || "-"}</td>

        <td class="p-4 text-slate-300">${item.nr_cilindro || "-"}</td>

        <td class="p-4 text-slate-400">${item.nbr_id || "-"}</td>

        <td class="p-4 text-slate-300 font-semibold">${item.fabricante || "-"}</td>

        <td class="p-4 text-center text-slate-400">${item.ano_fab || "-"}</td>

        <td class="p-4 text-center text-slate-400">${item.ult_reteste || "-"}</td>

        <td class="p-4 font-bold text-red-400">${item.prox_reteste || "-"}</td>

        <td class="p-4 font-bold text-amber-500">
            ${item.prox_recarga ? new Date(item.prox_recarga + "T12:00:00").toLocaleDateString("pt-BR") : "--/--/----"}
        </td>

        <td class="p-4 text-slate-400">${item.operador || "-"}</td>

        <td class="p-4 text-center">
            <span class="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">NV ${item.nivel || "1"}</span>
        </td>

        <td class="p-4 font-black ${statusColor}">${statusResumo}</td>

        <td class="sticky left-0 z-10 bg-slate-900 p-4 font-mono font-black text-indigo-400 border-r border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
            ${item.cod_barras || "-"}
        </td>

        <td class="p-4 bg-indigo-900/10 text-slate-300">${item.pallet || "-"}</td>

        <td class="p-4 text-slate-500">${item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : "-"}</td>

        <td class="p-4 text-slate-500">${item.usuario_lancamento || "-"}</td>

        <td class="p-4 text-amber-500/60">${item.updated_at ? new Date(item.updated_at).toLocaleString("pt-BR") : "-"}</td>

        <td class="p-4 text-amber-500/60">${item.usuario_alteracao || "-"}</td>

        <td class="p-4 text-center text-slate-400">${item.troca_realizada ? "SIM" : "NÃO"}</td>

        <td class="p-4 text-slate-300">${item.tipo_carga || "-"} / ${item.capacidade || "-"}</td>

        <td class="p-4 text-slate-400">${item.lote_nitrogenio || "-"}</td>

        <td class="p-4 text-slate-400">
            ${item.data_selagem ? new Date(item.data_selagem + "T12:00:00").toLocaleDateString("pt-BR") : "-"}
        </td>

        <td class="p-4 text-slate-400">${item.ampola_vinculada || "-"}</td>

        <td class="p-4 text-emerald-500 font-medium">${item.data_inspecao_final || "Pendente"}</td>

        <td class="p-4 bg-indigo-900/10 text-slate-300">${item.pallet || "-"}</td>

        <td class="p-4 bg-slate-800/40 text-slate-400">${item.deposito_galpao || "-"}</td>

        <td class="p-4 bg-slate-800/40 text-slate-400">${item.local_extintor || "-"}</td>

        <td class="sticky right-0 z-10 bg-slate-900 p-4 border-l border-slate-700 shadow-[-5px_0_10px_rgba(0,0,0,0.5)]">
            <div class="flex gap-3 justify-center">
                <button onclick="prepararEdicao('${item.id}')" class="text-indigo-400 hover:text-indigo-300 transition-colors">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deletarItem('${item.id}')" class="text-red-400 hover:text-red-300 transition-colors">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>`;
  }).join("");
}
async function registrarItem() {
  try {
    // 1. Captura de Elementos Básicos
    const fabId = document.getElementById("X_input_id").value;
    const nomeFab = document.getElementById("badgeNomeFabricante")?.innerText || "N/I";
    const nrCilindro = document.getElementById("nr_cilindro").value;
    const ultReteste = document.getElementById("ult_reteste").value;
    const dataSelagem = document.getElementById("data_selagem").value;
    
    // Captura o usuário logado para auditoria (Cadex Style)
    const usuarioLogado = document.getElementById("userName")?.innerText || "Técnico";

    // Tratamento da Norma NBR
    const nbrSelect = document.getElementById("nbr_select");
    const nbrApenasNumero = nbrSelect.options[nbrSelect.selectedIndex]?.text.split(" - ")[0].trim() || "";

    if (!fabId) return alert("Informe o fabricante!");
    if (!nrCilindro) return alert("Informe o número do cilindro!");

    // 2. Cálculos Automáticos de Prazos (Conformidade INMETRO)
    let vProxReteste = ultReteste && ultReteste.length === 4 ? parseInt(ultReteste) + 5 : null;
    let vProxRecarga = null;
    if (dataSelagem) {
      let d = new Date(dataSelagem + "T12:00:00");
      d.setFullYear(d.getFullYear() + 1);
      vProxRecarga = d.toISOString().split("T")[0];
    }

    // 3. Montagem do Payload Completo (Campos do Sistema + Campos Cadex)
    const payload = {
      // Identificação
      os_number: typeof currentOS !== "undefined" ? currentOS : null,
      cod_barras: document.getElementById("cod_barras").value,
      nr_cilindro: nrCilindro,
      fabricante: nomeFab.replace("- ", "").trim(),
      fabricante_id: parseInt(fabId),
      nbr_id: nbrApenasNumero,
      
      // Datas e Prazos
      ano_fab: document.getElementById("ano_fab").value,
      ult_reteste: ultReteste,
      prox_reteste: vProxReteste,
      data_selagem: dataSelagem,
      prox_recarga: vProxRecarga,
      
      // Especificações Técnicas
      tipo_carga: document.getElementById("tipo_carga").value,
      capacidade: document.getElementById("capacidade").value,
      nivel: typeof selectedLevel !== "undefined" ? selectedLevel : 2,
      lote_nitrogenio: document.getElementById("lote_nitrogenio").value, // Novo
      ampola_vinculada: document.getElementById("ampola_vinculada").value, // Novo
      
      // Manutenção e Logística
      selo_anterior: document.getElementById("selo_anterior").value,
      pallet: document.getElementById("pallet").value, // Novo
      deposito_galpao: document.getElementById("deposito_galpao").value, // Novo
      local_extintor: document.getElementById("local_extintor").value, // Novo
      resultado: document.getElementById("resultado_valor")?.value || "APROVADO",
      obs_ensaio: document.getElementById("obs_ensaio").value,
      
      // Auditoria (Rastreabilidade Cadex)
      usuario_lancamento: usuarioLogado, // Novo
      operador: usuarioLogado,
      data_inspecao_final: null, // Será preenchido na conclusão
      troca_realizada: false // Campo booleano para controle de peças
    };

    // 4. Gravação no Banco de Dados (Supabase)
    const { error } = await _supabase.from("itens_os").insert([payload]);
    
    if (error) throw error;

    // 5. Pós-Processamento: Impressão de Etiqueta
    const deveImprimir = document.getElementById("switchEtiqueta")?.checked;
    if (deveImprimir) {
      prepararModalEtiqueta(payload);
    } else {
      alert("Item registrado com sucesso!");
    }

    // 6. Limpeza de Campos para Próximo Registro
    limparCamposAposRegistro();
    
    // Atualiza a tabela na tela
    if (typeof loadItens === "function") loadItens();
    
  } catch (err) {
    console.error("Erro ao registrar:", err);
    alert("Erro ao salvar: " + err.message);
  }
}

// Função auxiliar para limpar apenas o necessário
function limparCamposAposRegistro() {
    const camposParaLimpar = ["nr_cilindro", "cod_barras", "selo_anterior"];
    camposParaLimpar.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    // Foca novamente no código de barras para o próximo item
    document.getElementById("cod_barras")?.focus();
}
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (event.target.tagName === "TEXTAREA") return;
    event.preventDefault();

    const campos = [
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

    const index = campos.indexOf(event.target.id);
    if (index > -1 && index < campos.length - 1) {
      const proximo = document.getElementById(campos[index + 1]);
      if (proximo) proximo.focus();
    } else if (index === campos.length - 1) {
      registrarItem();
    }
  }
});
