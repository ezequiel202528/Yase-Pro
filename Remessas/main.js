// 1. ANULA O BLOQUEIO DE OS DO main.js PRINCIPAL
window.onload = null;

document.addEventListener('DOMContentLoaded', () => {
    // Data padrão para hoje
    const hoje = new Date().toISOString().split("T")[0];
    if (document.getElementById("data_rec")) document.getElementById("data_rec").value = hoje;

    // Cálculo automático de quantidade ao digitar
    const funcCalc = () => {
        const ini = parseInt(document.getElementById('selo_inicio').value) || 0;
        const fim = parseInt(document.getElementById('selo_fim').value) || 0;
        const campoQtd = document.getElementById('qtd_selos');
        campoQtd.value = (fim >= ini && ini > 0) ? (fim - ini) + 1 : 0;
    };
    document.getElementById('selo_inicio').addEventListener('input', funcCalc);
    document.getElementById('selo_fim').addEventListener('input', funcCalc);

    carregarHistorico();
});

// GRAVAR NOVO LOTE
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

    try {
        const { error } = await _supabase.from('rem_essas').insert([dados]);
        if (error) throw error;
        
        alert("Lote registado com sucesso!");
        carregarHistorico();
        limparCampos();
    } catch (err) {
        console.error("Erro ao gravar:", err);
        alert("Erro ao gravar lote. Verifique a ligação.");
    }
}

// CARREGAR DADOS E EXECUTAR AUTOMAÇÃO
async function carregarHistorico() {
    try {
        // Busca todos os lotes
        const { data, error } = await _supabase
            .from('rem_essas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Renderiza a tabela
        const tbody = document.getElementById('lista-remessas');
        tbody.innerHTML = data.map(r => `
            <tr class="border-b hover:bg-slate-50 transition-colors">
                <td class="p-4">${new Date(r.data_rec).toLocaleDateString('pt-BR')}</td>
                <td class="p-4">${r.tipo_selo}</td>
                <td class="p-4">${r.selo_inicio}</td>
                <td class="p-4">${r.selo_fim}</td>
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

        // 2. ATUALIZA O RESUMO (Apenas Lotes Abertos)
        const lotesAbertos = data.filter(r => r.status_lote === 'ABERTO');
        const totalAberto = lotesAbertos.reduce((acc, curr) => acc + (curr.qtd_selos || 0), 0);
        
        document.getElementById('resumo_total').value = totalAberto;
        if (data.length > 0) {
            document.getElementById('resumo_data').value = new Date(data[0].data_rec).toLocaleDateString('pt-BR');
        }

        // 3. VERIFICA ENCERRAMENTO AUTOMÁTICO
        await verificarEncerramentoAutomatico(lotesAbertos);
        
        calcularEstoque();

    } catch (err) {
        console.error("Erro ao carregar histórico:", err);
    }
}

// LOGICA DE ENCERRAMENTO AUTOMÁTICO
async function verificarEncerramentoAutomatico(lotes) {
    for (const lote of lotes) {
        // Conta selos usados na tabela itens_os dentro do intervalo do lote
        const { count, error } = await _supabase
            .from('itens_os')
            .select('*', { count: 'exact', head: true })
            .gte('selo_inmetro', lote.selo_inicio) // Ajuste para o nome real do campo na sua tabela
            .lte('selo_inmetro', lote.selo_fim);

        if (!error && count >= lote.qtd_selos) {
            await _supabase
                .from('rem_essas')
                .update({ status_lote: 'FECHADO' })
                .eq('id', lote.id);
            
            console.log(`Lote ${lote.selo_inicio} encerrado automaticamente.`);
        }
    }
}

function calcularEstoque() {
    const total = parseInt(document.getElementById('resumo_total').value) || 0;
    const uti = parseInt(document.getElementById('resumo_utilizados').value) || 0;
    const inu = parseInt(document.getElementById('resumo_inutilizados').value) || 0;
    document.getElementById('resumo_estoque').value = total - uti - inu;
}

async function deletarLote(id) {
    if (confirm("Deseja eliminar este lote permanentemente?")) {
        const { error } = await _supabase.from('rem_essas').delete().eq('id', id);
        if (!error) carregarHistorico();
    }
}

function limparCampos() {
    ['selo_inicio', 'selo_fim', 'qtd_selos', 'prefixo', 'documento'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

// Torna as funções acessíveis ao HTML
window.salvarLote = salvarLote;
window.deletarLote = deletarLote;
window.limparCampos = limparCampos;
window.carregarHistorico = carregarHistorico;
window.calcularEstoque = calcularEstoque;