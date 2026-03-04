/**
 * calculosSelos.js - VERSÃO REVISADA E BLINDADA
 */

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById("data_rec")) {
        document.getElementById("data_rec").value = new Date().toISOString().split("T")[0];
    }

    const inInicio = document.getElementById('selo_inicio');
    const inFim = document.getElementById('selo_fim');
    if (inInicio && inFim) {
        const calcularInput = () => {
            const ini = parseInt(inInicio.value) || 0;
            const fim = parseInt(inFim.value) || 0;
            const campoQtd = document.getElementById('qtd_selos');
            if (campoQtd) campoQtd.value = (fim >= ini && ini > 0) ? (fim - ini) + 1 : 0;
        };
        inInicio.addEventListener('input', calcularInput);
        inFim.addEventListener('input', calcularInput);
    }

    carregarHistorico();
});

async function carregarHistorico() {
    try {
        const { data: todasRemessas, error } = await _supabase
            .from('rem_essas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const tabela = document.getElementById('lista-remessas');
        if (tabela) {
            tabela.innerHTML = '';
            todasRemessas.forEach(lote => {
                const tr = document.createElement('tr');
                tr.className = "border-b border-slate-800 hover:bg-slate-800/50 transition-colors";
                tr.innerHTML = `
                    <td class="p-4 text-[11px] font-medium">${new Date(lote.data_rec).toLocaleDateString('pt-BR')}</td>
                    <td class="p-4 text-[11px] font-bold text-amber-500">${lote.documento || '---'}</td>
                    <td class="p-4 text-[11px]">${lote.selo_inicio} a ${lote.selo_fim}</td>
                    <td class="p-4 text-[11px] font-black">${lote.qtd_selos}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                            lote.status_lote === 'ABERTO' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-slate-700 text-slate-400'
                        }">${lote.status_lote}</span>
                    </td>
                    <td class="p-4 text-right">
                        <button onclick='prepararEdicao(${JSON.stringify(lote)})' class="text-blue-400 hover:text-blue-300 mr-3"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="deletarLote('${lote.id}')" class="text-red-400 hover:text-red-300"><i class="fa-solid fa-trash"></i></button>
                    </td>`;
                tabela.appendChild(tr);
            });
        }

        // Chama o resumo focado na NF-e aberta
        await atualizarResumoLotes();

    } catch (err) {
        console.error("Erro ao carregar histórico:", err);
    }
}

async function salvarLote() {
    const btn = document.querySelector('button[onclick="salvarLote()"]');
    const docInput = document.getElementById('documento');
    const numNota = docInput ? docInput.value.trim() : "";

    if (!numNota || !document.getElementById('selo_inicio').value) {
        alert("Preencha a NF-e e o intervalo de selos!");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Gravando...';

        const dados = {
            data_rec: document.getElementById('data_rec').value,
            selo_inicio: parseInt(document.getElementById('selo_inicio').value),
            selo_fim: parseInt(document.getElementById('selo_fim').value),
            qtd_selos: parseInt(document.getElementById('qtd_selos').value),
            documento: numNota,
            status_lote: document.getElementById('status_lote').value
        };

        // Regra de Ouro: Se for abrir este, fecha todos os outros
        if (dados.status_lote === 'ABERTO') {
            await _supabase.from('rem_essas').update({ status_lote: 'FECHADO' }).eq('status_lote', 'ABERTO');
        }

        let query;
        if (window.editandoLoteId) {
            query = await _supabase.from('rem_essas').update(dados).eq('id', window.editandoLoteId);
        } else {
            query = await _supabase.from('rem_essas').insert([dados]);
        }

        if (query.error) throw query.error;

        alert("Lote Processado!");
        limparFormulario();
        carregarHistorico();

    } catch (err) {
        console.error("Erro técnico:", err);
        alert("Erro ao salvar. Verifique se as colunas no Supabase estão corretas.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Gravar Lote';
    }
}

async function atualizarResumoLotes() {
    try {
        // Busca apenas a nota que manda no sistema
        const { data: loteAtivo } = await _supabase
            .from('rem_essas')
            .select('*')
            .eq('status_lote', 'ABERTO')
            .maybeSingle();

        const inTotal = document.getElementById('resumo_total');
        const inUtilizados = document.getElementById('resumo_utilizados');
        const inEstoque = document.getElementById('resumo_estoque');

        if (!loteAtivo) {
            if (inTotal) inTotal.value = 0;
            if (inUtilizados) inUtilizados.value = 0;
            if (inEstoque) inEstoque.value = 0;
            return;
        }

        // Conta selos usados NO INTERVALO desta NF-e
        const { count: usados } = await _supabase
            .from('itens_os')
            .select('*', { count: 'exact', head: true })
            .gte('selo_inmetro', loteAtivo.selo_inicio)
            .lte('selo_inmetro', loteAtivo.selo_fim);

        const totalNota = parseInt(loteAtivo.qtd_selos) || 0;
        const utilizadoNota = usados || 0;
        const estoqueNota = totalNota - utilizadoNota;

        if (inTotal) inTotal.value = totalNota;
        if (inUtilizados) inUtilizados.value = utilizadoNota;
        if (inEstoque) {
            inEstoque.value = estoqueNota;
            inEstoque.style.backgroundColor = estoqueNota <= 0 ? '#ef4444' : '#10b981';
            inEstoque.style.color = '#fff';
        }
    } catch (err) {
        console.error("Erro no resumo:", err);
    }
}

function limparFormulario() {
    window.editandoLoteId = null;
    document.getElementById('selo_inicio').value = '';
    document.getElementById('selo_fim').value = '';
    document.getElementById('qtd_selos').value = '';
    document.getElementById('documento').value = '';
    document.getElementById('status_lote').value = 'ABERTO';
    const btn = document.querySelector('button[onclick="salvarLote()"]');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Gravar Lote';
}

function prepararEdicao(lote) {
    window.editandoLoteId = lote.id;
    document.getElementById('data_rec').value = lote.data_rec;
    document.getElementById('selo_inicio').value = lote.selo_inicio;
    document.getElementById('selo_fim').value = lote.selo_fim;
    document.getElementById('qtd_selos').value = lote.qtd_selos;
    document.getElementById('documento').value = lote.documento || '';
    document.getElementById('status_lote').value = lote.status_lote;
    const btn = document.querySelector('button[onclick="salvarLote()"]');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Atualizar Lote';
}

async function deletarLote(id) {
    if (confirm("Excluir esta remessa?")) {
        await _supabase.from('rem_essas').delete().eq('id', id);
        carregarHistorico();
    }
}