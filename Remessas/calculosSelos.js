/**
 * Lógica de Remessas YaSe PRO
 * Integração com Tabela 'rem_essas'
 */

// 1. ANULA O REDIRECIONAMENTO DO main.js DA RASTREABILIDADE
window.onload = null; 

// Inicialização da Página
document.addEventListener('DOMContentLoaded', () => {
    // Define data de hoje
    const campoData = document.getElementById("data_rec");
    if (campoData) campoData.value = new Date().toISOString().split("T")[0];

    // Carrega dados iniciais
    carregarHistorico();
    
    // Configura cálculo automático de quantidade
    const inInicio = document.getElementById('selo_inicio');
    const inFim = document.getElementById('selo_fim');
    
    if (inInicio && inFim) {
        [inInicio, inFim].forEach(el => el.addEventListener('input', () => {
            const inicio = parseInt(inInicio.value) || 0;
            const fim = parseInt(inFim.value) || 0;
            const campoQtd = document.getElementById('qtd_selos');
            if (fim >= inicio && inicio > 0) {
                campoQtd.value = (fim - inicio) + 1;
            } else {
                campoQtd.value = 0;
            }
        }));
    }
});

// FUNÇÃO PARA GRAVAR LOTE
async function salvarLote() {
    const dados = {
        data_rec: document.getElementById('data_rec').value,
        tipo_selo: document.getElementById('tipo_selo').value,
        selo_inicio: parseInt(document.getElementById('selo_inicio').value),
        selo_fim: parseInt(document.getElementById('selo_fim').value),
        qtd_selos: parseInt(document.getElementById('qtd_selos').value),
        prefixo: document.getElementById('prefixo').value,
        documento: document.getElementById('documento').value,
        status_lote: document.getElementById('status_lote').value
    };

    if (!dados.data_rec || !dados.selo_inicio || !dados.selo_fim) {
        alert("Preencha os campos obrigatórios (Datas e Selos).");
        return;
    }

    try {
        const { error } = await _supabase.from('rem_essas').insert([dados]);
        if (error) throw error;
        
        alert("Lote cadastrado com sucesso!");
        carregarHistorico();
        limparCampos();
    } catch (err) {
        console.error("Erro ao salvar:", err);
        alert("Erro ao gravar no banco. Verifique a tabela 'rem_essas'.");
    }
}

// CARREGAR TABELA E ATUALIZAR RESUMO
async function carregarHistorico() {
    try {
        const { data, error } = await _supabase
            .from('rem_essas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const tbody = document.getElementById('lista-remessas');
        tbody.innerHTML = data.map(r => `
            <tr class="border-b hover:bg-slate-50 transition-colors">
                <td class="p-4">${new Date(r.data_rec).toLocaleDateString('pt-BR')}</td>
                <td class="p-4">${r.tipo_selo}</td>
                <td class="p-4">${r.prefixo || ''} ${r.selo_inicio}</td>
                <td class="p-4">${r.prefixo || ''} ${r.selo_fim}</td>
                <td class="p-4 text-center font-black text-indigo-600">${r.qtd_selos}</td>
                <td class="p-4">${r.documento || '-'}</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded-full text-[9px] font-black ${r.status_lote === 'ABERTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}">
                        ${r.status_lote}
                    </span>
                </td>
                <td class="p-4 text-center">
                    <button onclick="deletarLote('${r.id}')" class="text-red-400 hover:text-red-600">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        atualizarResumoLotes();
    } catch (err) {
        console.error("Erro ao listar:", err);
    }
    await gerenciarEstoqueAutomatico();
}

// LÓGICA DE RESUMO POR LOTES
async function atualizarResumoLotes() {
    try {
        // Soma apenas lotes ABERTOS para o resumo de estoque
        const { data, error } = await _supabase
            .from('rem_essas')
            .select('qtd_selos, data_rec')
            .eq('status_lote', 'ABERTO')
            .order('data_rec', { ascending: false });

        if (error) throw error;

        const totalRecebido = data.reduce((acc, curr) => acc + (parseInt(curr.qtd_selos) || 0), 0);
        
        if (data.length > 0) {
            document.getElementById('resumo_data').value = new Date(data[0].data_rec).toLocaleDateString('pt-BR');
        }
        
        document.getElementById('resumo_total').value = totalRecebido;
        calcularSaldoFinal();

    } catch (err) {
        console.error("Erro no resumo:", err);
    }
}

function calcularSaldoFinal() {
    const total = parseInt(document.getElementById('resumo_total').value) || 0;
    const uti = parseInt(document.getElementById('resumo_utilizados').value) || 0;
    const inu = parseInt(document.getElementById('resumo_inutilizados').value) || 0;
    document.getElementById('resumo_estoque').value = total - uti - inu;
}

async function deletarLote(id) {
    if (confirm("Deseja excluir permanentemente este lote?")) {
        await _supabase.from('rem_essas').delete().eq('id', id);
        carregarHistorico();
    }
}

function limparCampos() {
    const campos = ['selo_inicio', 'selo_fim', 'qtd_selos', 'prefixo', 'documento'];
    campos.forEach(id => document.getElementById(id).value = '');
}

// Exposição Global
window.salvarLote = salvarLote;
window.limparCampos = limparCampos;
window.deletarLote = deletarLote;
window.atualizarResumoLotes = atualizarResumoLotes;
window.calcularSaldoFinal = calcularSaldoFinal;


async function gerenciarEstoqueAutomatico() {
    try {
        // 1. Busca lotes abertos
        const { data: lotes, error: errLotes } = await _supabase
            .from('rem_essas')
            .select('*')
            .eq('status_lote', 'ABERTO');

        if (errLotes) throw errLotes;

        let totalSeloUsadoGeral = 0;
        let loteAcabouAgora = false;

        for (const lote of lotes) {
            // Conta uso na tabela itens_os
            const { count, error: errCount } = await _supabase
                .from('itens_os')
                .select('*', { count: 'exact', head: true })
                .gte('selo_inmetro', lote.selo_inicio) 
                .lte('selo_inmetro', lote.selo_fim);

            if (errCount) continue;
            totalSeloUsadoGeral += count;

            // VERIFICAÇÃO DE FECHAMENTO
            if (count >= lote.qtd_selos) {
                await _supabase
                    .from('rem_essas')
                    .update({ status_lote: 'FECHADO' })
                    .eq('id', lote.id);
                
                loteAcabouAgora = true;
            }
        }

        // 2. Atualiza a tela
        atualizarCamposResumo(lotes, totalSeloUsadoGeral);

        // 3. LÓGICA DO MODAL / AVISO DE NOVO LOTE
        if (loteAcabouAgora || (totalSeloUsadoGeral >= calcularTotalLotes(lotes) && lotes.length > 0)) {
            exibirModalNovoLote();
        }

    } catch (error) {
        console.error("Erro na gestão:", error);
    }
}

// Função para exibir o convite de novo lote
function exibirModalNovoLote() {
    // Criamos um alerta estilizado ou usamos o confirm do navegador
    const mensagem = "🚨 O LOTE DE SELOS ACABOU!\n\nTodos os selos deste lote foram utilizados. Deseja cadastrar uma nova remessa agora para continuar os trabalhos?";
    
    if (confirm(mensagem)) {
        // Rola a tela para o topo e foca no campo de data para novo cadastro
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            document.getElementById('data_rec').focus();
            // Adiciona um brilho temporário no formulário para destacar
            document.querySelector('.section-card').classList.add('ring-4', 'ring-amber-500', 'duration-500');
        }, 500);
    }
}

function calcularTotalLotes(lotes) {
    return lotes.reduce((acc, cur) => acc + (cur.qtd_selos || 0), 0);
}

function atualizarCamposResumo(lotes, usados) {
    const total = calcularTotalLotes(lotes);
    const inu = parseInt(document.getElementById('resumo_inutilizados')?.value) || 0;
    const estoque = total - usados - inu;

    if(document.getElementById('resumo_total')) document.getElementById('resumo_total').value = total;
    if(document.getElementById('resumo_utilizados')) document.getElementById('resumo_utilizados').value = usados;
    
    const campoEstoque = document.getElementById('resumo_estoque');
    if(campoEstoque) {
        campoEstoque.value = estoque;
        // Se o estoque estiver zerado, pinta de vermelho
        if (estoque <= 0) {
            campoEstoque.style.backgroundColor = "#ef4444"; // Vermelho
            campoEstoque.style.color = "white";
        } else {
            campoEstoque.style.backgroundColor = "#fde047"; // Amarelo original
            campoEstoque.style.color = "#0f172a";
        }
    }
}