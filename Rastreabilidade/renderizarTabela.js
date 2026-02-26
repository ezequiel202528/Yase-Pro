/**
 * RASTREABILIDADE - YA SE PRO
 * renderizarTabela.js - Versão Integral 2026
 */

// 1. CARREGAMENTO E SINCRONIZAÇÃO
async function carregarItens() {
    try {
        const osAtiva = window.currentOS || sessionStorage.getItem("currentOS");
        if (!osAtiva) return;

        const { data, error } = await _supabase
            .from('itens_os')
            .select('*')
            .eq('os_number', osAtiva) 
            .order('created_at', { ascending: false });

        if (error) throw error;
        
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
        return isNaN(d.getTime()) ? v : d.toLocaleDateString('pt-BR');
    } catch (e) { return v; }
}

// 2. RENDERIZAÇÃO DA TABELA (ORDEM SOLICITADA)
function renderItens(itens) {
    const list = document.getElementById("itensList");
    if (!list) return;

    if (!itens || itens.length === 0) {
        list.innerHTML = `<tr><td colspan="38" class="p-10 text-center text-slate-500 italic">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    list.innerHTML = itens.map((item, index) => {
        const s = (item.status_servico || "APROVADO").toUpperCase();
        let classesStatus = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (s === "REPROVADO" || s === "REP") classesStatus = "bg-red-500/10 text-red-400 border-red-500/20";

        // Funções de formatação interna para garantir o padrão brasileiro com hora
        const formatarComHora = (dataStr) => {
            if (!dataStr || dataStr === "") return "-";
            const d = new Date(dataStr);
            return isNaN(d) ? dataStr : d.toLocaleString('pt-BR');
        };

        const dataLancamento = formatarComHora(item.created_at);
        const dataAlteracao = item.updated_at ? formatarComHora(item.updated_at) : "Sem alterações";
        const dataSelagem = formatarComHora(item.data_selagem); // Agora com hora

        return `
        <tr class="group text-[11px] border-b border-slate-800 hover:bg-slate-800/40 transition-colors whitespace-nowrap">
            <td class="p-3 text-slate-500">${index + 1}</td>
            <td class="p-3 font-black text-amber-500 bg-amber-500/5">${item.selo_inmetro || "-"}</td>
            <td class="p-3 font-bold text-slate-200">${item.nr_cilindro || "S/N"}</td>
            <td class="p-3">${item.nbr || "-"}</td>
            <td class="p-3">${item.fabricante_id || "-"}</td>
            <td class="p-3">${item.ano_fab || "-"}</td>
            <td class="p-3">${item.ult_reteste || "-"}</td>
            <td class="p-3 text-red-400 font-bold">${item.prox_reteste || "-"}</td>
            <td class="p-3 text-amber-500 font-bold">${item.prox_recarga || "-"}</td>
            
            <td class="p-3 sticky left-0 z-20 bg-slate-900 border-r border-slate-700 font-bold text-indigo-400 shadow-[2px_0_5px_rgba(0,0,0,0.3)] group-hover:bg-[#1e293b]">
                ${item.tipo_carga || "-"} / ${item.capacidade || "-"}
            </td>

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

            <td class="p-3 text-slate-400 font-mono text-[10px]">${dataLancamento}</td>
            <td class="p-3 font-mono text-[10px]">${item.cod_barras || "-"}</td>
            <td class="p-3">${item.lote_nitrogenio || "-"}</td>
            <td class="p-3 font-mono text-[10px] text-cyan-400">${dataSelagem}</td> <td class="p-3">${item.ampola_vinculada || "-"}</td>
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
    }).join("");
}
// 3. REGISTRO (CONECTANDO INPUTS AOS CAMPOS DO BANCO)
async function registrarItem() {
    try {
        const seloNum = parseInt(document.getElementById('proximo_selo_num')?.innerText);

        const dados = {
            os_number: window.currentOS,
            selo_inmetro: isNaN(seloNum) ? null : seloNum,
            nr_cilindro: document.getElementById('nr_cilindro')?.value,
            num_patrimonio: document.getElementById('pallet')?.value, // Input do pallet salva como patrimônio
            
            // PESAGEM
            p_vazio_valvula: document.getElementById('p_vazio_valvula')?.value,
            p_cheio_valvula: document.getElementById('p_cheio_valvula')?.value,
            p_atual: document.getElementById('p_atual')?.value,
            porcent_dif: document.getElementById('porcent_dif')?.value,
            
            // PERDA DE MASSA
            tara_cilindro: document.getElementById('tara_cilindro')?.value,
            p_cil_vazio_kg: document.getElementById('p_cil_vazio_kg')?.value,
            perda_massa_porcent: document.getElementById('perda_massa_porcent')?.value,

            // CUBAGEM
            vol_litros: document.getElementById('vol_litros')?.value,
            dvh: document.getElementById('dvh')?.value,
            dvp: document.getElementById('dvp')?.value,
            ee: document.getElementById('ee')?.value,

            // HIDROSTÁTICO
            dvm_et: document.getElementById('dvm_et')?.value,
            dvp_ep: document.getElementById('dvp_ep')?.value,
            ee_calculado: document.getElementById('ee_calculado')?.value,
            ep_porcent_final: document.getElementById('ep_porcent_final')?.value,

            // DATAS E SERVIÇO
            prox_reteste: converterDataBRparaISO(document.getElementById('display_prox_reteste')?.innerText),
            prox_recarga: converterDataBRparaISO(document.getElementById('display_prox_recarga')?.innerText),
            tipo_carga: document.getElementById('tipo_carga')?.value,
            capacidade: document.getElementById('capacidade')?.value,
            nbr: document.getElementById('nbr_select')?.value,
            ano_fab: parseInt(document.getElementById('ano_fab')?.value) || null,
            ult_reteste: document.getElementById('ult_reteste')?.value,
            status_servico: document.getElementById('resultado_valor')?.value || "APROVADO",
            usuario_lancamento: document.getElementById('userName')?.innerText || 'Técnico',
            
            // LOGÍSTICA
            cod_barras: document.getElementById('cod_barras')?.value,
            lote_nitrogenio: document.getElementById('lote_nitrogenio')?.value,
            data_selagem: document.getElementById('data_selagem')?.value || null,
            ampola_vinculada: document.getElementById('ampola_vinculada')?.value,
            deposito_galpao: document.getElementById('deposito_galpao')?.value,
            local_especifico: document.getElementById('local_extintor')?.value,
            fabricante_id: parseInt(document.getElementById('X_input_id')?.value) || null
        };

        const { error } = await _supabase.from('itens_os').insert([dados]);
        if (error) throw error;

        alert("Extintor registrado com sucesso!");
        carregarItens();
        limparCamposAposRegistro();
        if (typeof atualizarSelo === "function") atualizarSelo();

    } catch (err) { 
        console.error("Erro no registro:", err);
        alert("Erro ao salvar: " + err.message); 
    }
}

// 4. FUNÇÕES DE APOIO
function converterDataBRparaISO(dataBR) {
    if (!dataBR || dataBR.includes("-") || dataBR.length < 8 || dataBR.includes("undefined")) return null;
    const partes = dataBR.trim().split('/');
    if (partes.length !== 3) return null;
    const [d, m, a] = partes;
    // Retorna YYYY-MM-DD para o Supabase não dar erro 22008
    return `${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function limparCamposAposRegistro() {
    ["nr_cilindro", "cod_barras", "ano_fab", "pallet"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    document.getElementById("cod_barras")?.focus();
}

// Inicialização
window.addEventListener('load', () => {
    setTimeout(carregarItens, 500);
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        // Ignora botões e áreas de texto
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;

        const sequence = [
            'cod_barras',
            'X_input_id',
            'nr_cilindro',
            'ano_fab',
            'ult_reteste',
            'tipo_carga',
            'capacidade',
            'nbr_select',
            'lote_nitrogenio',
            'ampola_vinculada',
            'data_selagem',
            'selo_anterior',
            'pallet',
            'deposito_galpao',
            'local_extintor',
            
            // GRUPO PESAGEM
            'p_vazio_valvula',
            'p_cheio_valvula',
            'p_atual',
            'porcent_dif',          // <-- Adicionado (Visualização)

            // GRUPO PERDA DE MASSA
            'tara_cilindro',
            'p_cil_vazio_kg',
            'perda_massa_porcent',  // <-- Adicionado (Visualização)

            // GRUPO CUBAGEM
            'vol_litros',
            'dvm_et',
            'dvp_ep',
            'ee_resultado',         // <-- Adicionado (Visualização)

            // GRUPO HIDROSTÁTICO
            'et_ensaio',
            'ep_ensaio',
            'ee_calculado',
            'ep_porcent_final'      // <-- Adicionado (Visualização)
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
                    if (nextField.tagName === 'INPUT' && !nextField.readOnly) {
                        nextField.select();
                    }
                    return; 
                }
            }

            // Ao final de tudo, foca no botão REGISTRAR
            const btnRegistrar = document.querySelector('button[onclick="registrarItem()"]');
            if (btnRegistrar) btnRegistrar.focus();
        }
    }
});