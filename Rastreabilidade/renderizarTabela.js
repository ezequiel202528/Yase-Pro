// ATENÇÃO: Não declare SUPABASE_URL ou _supabase aqui.
// Eles já vêm do main.js automaticamente.

/**
 * RASTREABILIDADE - YA SE PRO
 * renderizarTabela.js: Gestão da lista e gravação de itens
 */

// 1. BUSCA OS DADOS NO SUPABASE (Ajustado para ordenar por selo)
async function carregarItens() {
    try {
        const { data, error } = await _supabase
            .from('itens_os')
            .select('*')
            // MUDAMOS PARA FALSE: O maior selo (mais recente) aparece no topo da lista
            .order('selo_inmetro', { ascending: false }); 

        if (error) throw error;
        renderItens(data);
    } catch (err) {
        console.error("Erro ao carregar tabela:", err);
    }
}
// 2. DESENHA AS LINHAS NO HTML
function renderItens(itens) {
    const list = document.getElementById("itensList");
    if (!list) return;

    if (!itens || itens.length === 0) {
        list.innerHTML = `<tr><td colspan="35" class="p-10 text-center text-slate-500 italic">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    list.innerHTML = itens.map((item, index) => {
        const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '-';
        
        return `
        <tr class="text-[11px] border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
            <td class="p-3 text-slate-500">${index + 1}</td>
            
            <td class="p-3 font-black text-amber-500 bg-amber-500/5">${item.selo_inmetro || "-"}</td>
            
            <td class="p-3 font-bold text-slate-200">${item.nr_cilindro || "S/N"}</td>
            <td class="p-3">${item.nbr || "-"}</td>
            <td class="p-3">${item.fabricante_id || "-"}</td>
            <td class="p-3">${item.ano_fab || "-"}</td>
            <td class="p-3">${item.ult_reteste || "-"}</td>
            <td class="p-3 text-red-400 font-bold">${item.prox_reteste || "-"}</td>
            <td class="p-3 text-amber-500 font-bold">${formatDate(item.prox_recarga)}</td>
            <td class="p-3">${item.usuario_lancamento || "Sistema"}</td>
            <td class="p-3">${item.nivel_manutencao || "-"}</td>
            <td class="p-3">
                <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    ${item.status_servico || "APROVADO"}
                </span>
            </td>

            <td class="p-3 sticky left-0 z-20 bg-slate-900 border-r border-slate-700 font-mono text-indigo-400">
                ${item.cod_barras || "-"}
            </td>

            <td class="p-3 bg-indigo-900/5">${item.pallet || "-"}</td>
            <td class="p-3 text-slate-500">${formatDate(item.created_at)}</td>
            <td class="p-3 text-slate-500">${item.usuario_lancamento || "-"}</td>
            <td class="p-3 text-amber-500/50">${formatDate(item.updated_at)}</td>
            <td class="p-3 text-amber-500/50">${item.usuario_alteracao || "-"}</td>
            <td class="p-3 text-center">${item.troca_realizada ? 'Sim' : 'Não'}</td>
            <td class="p-3">${item.tipo_carga || "-"} / ${item.capacidade || "-"}</td>
            <td class="p-3">${item.lote_nitrogenio || "-"}</td>
            <td class="p-3">${formatDate(item.data_selagem)}</td>
            <td class="p-3">${item.ampola_vinculada || "-"}</td>
            <td class="p-3">${formatDate(item.data_inspecao_final)}</td>
            <td class="p-3 bg-indigo-900/5">${item.pallet || "-"}</td>
            <td class="p-3 bg-slate-800/20">${item.deposito_galpao || "-"}</td>
            <td class="p-3 bg-slate-800/20">${item.local_especifico || "-"}</td>

            <td class="p-3 sticky right-0 z-20 bg-slate-900 border-l border-slate-700 text-right pr-4">
                <div class="flex gap-2 justify-end">
                    <button onclick="deletarItem('${item.id}')" class="text-red-400 hover:text-red-300 px-2">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");
}



// Inicialização
document.addEventListener('DOMContentLoaded', carregarItens);

// 3. FUNÇÃO PARA REGISTRAR (CHAMA O CARREGAR ITENS NO FINAL)
async function registrarItem() {
    const seloAtual = document.getElementById('proximo_selo_num')?.innerText;
    
    if (!seloAtual || seloAtual === "---" || seloAtual === "SEM LOTE") {
        alert("Erro: Não há um lote de selos aberto.");
        return;
    }

    const dados = {
        nr_cilindro: document.getElementById('nr_cilindro')?.value,
        tipo_carga: document.getElementById('tipo_carga')?.value,
        capacidade: document.getElementById('capacidade')?.value,
        selo_inmetro: parseInt(seloAtual),
        data_selagem: document.getElementById('data_selagem')?.value || new Date().toISOString().split('T')[0],
        status_servico: 'APROVADO'
        // Adicione aqui os outros campos que você precisar salvar
    };

    try {
        const { error } = await _supabase.from('itens_os').insert([dados]);
        if (error) throw error;

        // ESTA PARTE É A QUE FAZ APARECER NA TELA IMEDIATAMENTE:
        carregarItens(); 
        if (typeof monitorarLoteAtivo === "function") monitorarLoteAtivo();
        
        limparCamposAposRegistro();
    } catch (err) {
        console.error("Erro ao salvar:", err);
    }
}

// Inicializa a tabela ao carregar a página
document.addEventListener('DOMContentLoaded', carregarItens);


// 3. FUNÇÕES DE APOIO
function limparCamposAposRegistro() {
    const camposParaLimpar = ["nr_cilindro", "cod_barras", "selo_anterior"];
    camposParaLimpar.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
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
