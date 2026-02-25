/**
 * RASTREABILIDADE - YA SE PRO
 * renderizarTabela.js: Versão INTEGRAL sem perda de dados
 */


// 1. CARREGAR ITENS
/**
 * RASTREABILIDADE - YA SE PRO
 * renderizarTabela.js: Versão INTEGRAL com Status Dinâmico e Colunas Fixas
 */

// 1. BUSCA DADOS E ATUALIZA CONTADOR
async function carregarItens() {
    try {
        // currentOS deve estar definido globalmente no seu main.js
        const { data, error } = await _supabase
            .from('itens_os')
            .select('*')
            .eq('os_number', currentOS) 
            .order('created_at', { ascending: false });

        if (error) throw error;

        const contadorEl = document.getElementById("itemCounter");
        if (contadorEl) contadorEl.innerText = data ? data.length : 0;

        renderItens(data);
    } catch (err) {
        console.error("Erro ao carregar tabela:", err);
    }
}

// Auxiliar para formatar datas com segurança
function fixData(v) {
    if (!v || v === "-" || v === "null") return "-";
    try {
        const d = new Date(v);
        return isNaN(d.getTime()) ? v : d.toLocaleDateString('pt-BR');
    } catch (e) { return v; }
}

// 2. RENDERIZAÇÃO DA TABELA
function renderItens(itens) {
    const list = document.getElementById("itensList");
    if (!list) return;

    if (!itens || itens.length === 0) {
        list.innerHTML = `<tr><td colspan="40" class="p-10 text-center text-slate-500 italic">Nenhum registro encontrado para esta OS.</td></tr>`;
        return;
    }

    list.innerHTML = itens.map((item, index) => {
        // Lógica de Cores do Status
        const s = (item.status_servico || "APROVADO").toUpperCase();
        let classesStatus = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"; // Padrão: Verde (Aprovado)
        
        if (s === "REPROVADO" || s === "REP") {
            classesStatus = "bg-red-500/10 text-red-400 border-red-500/20"; // Vermelho
        } else if (s === "NOVO") {
            classesStatus = "bg-blue-500/10 text-blue-400 border-blue-500/20"; // Azul
        } else if (s === "RAP") {
            classesStatus = "bg-amber-500/10 text-amber-400 border-amber-500/20"; // Laranja/Ambar
        }

        return `
        <tr class="group text-[11px] border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
            <td class="p-3 text-slate-500">${index + 1}</td>
            <td class="p-3 font-black text-amber-500 bg-amber-500/5">${item.selo_inmetro || "-"}</td>
            <td class="p-3 font-bold text-slate-200">${item.nr_cilindro || "S/N"}</td>
            <td class="p-3">${item.nbr || "-"}</td>
            <td class="p-3">${item.fabricante_id || "-"}</td>
            <td class="p-3">${item.ano_fab || "-"}</td>
            <td class="p-3">${item.ult_reteste || "-"}</td>
            
            <td class="p-3 text-red-400 font-bold">${item.prox_reteste || "-"}</td>
            <td class="p-3 text-amber-500 font-bold">${fixData(item.prox_recarga)}</td>
            
            <td class="p-3 text-slate-400">${item.usuario_lancamento || "Sistema"}</td>
            <td class="p-3 text-center">${item.nivel_manutencao || "2"}</td>
            
            <td class="p-3">
                <span class="px-2 py-0.5 rounded border font-bold text-[10px] ${classesStatus}">
                    ${s}
                </span>
            </td>
            
            <td class="p-3 sticky left-0 z-20 bg-slate-900 border-r border-slate-700 font-bold text-indigo-400 shadow-[2px_0_5px_rgba(0,0,0,0.3)] group-hover:bg-[#1e293b]">
                ${item.tipo_carga || "-"} / ${item.capacidade || "-"}
            </td>

            <td class="p-3 text-slate-500">${fixData(item.created_at)}</td>
            <td class="p-3 text-slate-500">${item.usuario_lancamento || "-"}</td>
            <td class="p-3 text-amber-500/50">${fixData(item.updated_at)}</td>
            <td class="p-3 text-amber-500/50">${item.usuario_alteracao || "-"}</td>
            <td class="p-3 text-center">${item.troca_realizada ? 'Sim' : 'Não'}</td>
            
            <td class="p-3 font-mono">${item.cod_barras || "-"}</td>
            <td class="p-3">${item.lote_nitrogenio || "-"}</td>
            <td class="p-3">${fixData(item.data_selagem)}</td>
            <td class="p-3">${item.ampola_vinculada || "-"}</td>
            <td class="p-3">${fixData(item.data_inspecao_final)}</td>
            
            <td class="p-3 bg-indigo-900/10">${item.pallet || "-"}</td>
            
            <td class="p-3 bg-slate-800/40">${item.deposito_galpao || "-"}</td>
            <td class="p-3 bg-slate-800/40">${item.local_especifico || "-"}</td>

            <td class="p-3 sticky right-0 z-20 bg-slate-900 border-l border-slate-700 text-right pr-4 shadow-[-5px_0_10px_rgba(0,0,0,0.5)] group-hover:bg-[#1e293b]">
                <div class="flex gap-2 justify-end">
                    <button onclick="prepararEdicao('${item.id}')" class="text-amber-500 hover:text-amber-400">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="deletarItem('${item.id}')" class="text-red-400 hover:text-red-300">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

// 3. FUNÇÃO DE REGISTRO (Utiliza a variável statusSelecionadoManual)
async function registrarItem() {
    try {
        const seloNum = document.getElementById('proximo_selo_num')?.innerText;
        
        // Objeto de dados para o Supabase
        const dados = {
            os_number: currentOS,
            selo_inmetro: seloNum ? parseInt(seloNum) : null,
            nr_cilindro: document.getElementById('nr_cilindro').value,
            nbr: document.getElementById('nbr_select')?.value,
            fabricante_id: document.getElementById('fabricante_select')?.value,
            ano_fab: document.getElementById('ano_fab').value,
            ult_reteste: document.getElementById('ult_reteste').value,
            tipo_carga: document.getElementById('tipo_carga').value,
            capacidade: document.getElementById('capacidade').value,
            lote_nitrogenio: document.getElementById('lote_nitrogenio').value,
            ampola_vinculada: document.getElementById('ampola_vinculada').value,
            data_selagem: document.getElementById('data_selagem').value,
            pallet: document.getElementById('pallet').value,
            status_servico: typeof statusSelecionadoManual !== 'undefined' ? statusSelecionadoManual : "APROVADO",
            usuario_lancamento: document.getElementById('userName')?.innerText || 'Técnico'
        };

        const { error } = await _supabase.from('itens_os').insert([dados]);
        
        if (error) throw error;

        // Limpeza e feedback
        console.log("Item registrado com sucesso!");
        if (typeof statusSelecionadoManual !== 'undefined') statusSelecionadoManual = "APROVADO"; // Reseta status
        
        carregarItens(); // Recarrega a tabela
        
        // Se tiver a função de atualizar selo disponível
        if (typeof atualizarSelo === "function") atualizarSelo();

    } catch (err) {
        console.error("Erro ao registrar item:", err);
        alert("Erro ao salvar o item. Verifique o console.");
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', carregarItens);
function limparCamposAposRegistro() {
    ["nr_cilindro", "cod_barras", "ano_fab", "ult_reteste"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    document.getElementById("cod_barras")?.focus();
}

// 4. ATIVAÇÃO DE ESCUTADORES
document.addEventListener('DOMContentLoaded', () => {
    carregarItens();
    
    // Realtime (Corrigido para usar a biblioteca supabase-js v2)
    _supabase
        .channel('public:itens_os')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'itens_os' }, () => {
            carregarItens();
        })
        .subscribe();
});
// Auxiliares
function converterDataBRparaISO(dataBR) {
    if (!dataBR || dataBR === "--/--/----") return null;
    const [d, m, a] = dataBR.split('/');
    return `${a}-${m}-${d}`;
}






document.addEventListener('DOMContentLoaded', carregarItens);
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

