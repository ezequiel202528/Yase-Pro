/**
 * calculosSelos.js - LÓGICA E INTERFACE
 * Responsável por cálculos, CRUD e Estilização do Resumo.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Data padrão
    if (document.getElementById("data_rec")) {
        document.getElementById("data_rec").value = new Date().toISOString().split("T")[0];
    }

    // 2. Cálculo automático de quantidade (Input dinâmico)
    const inInicio = document.getElementById('selo_inicio');
    const inFim = document.getElementById('selo_fim');
    if (inInicio && inFim) {
        const calcular = () => {
            const ini = parseInt(inInicio.value) || 0;
            const fim = parseInt(inFim.value) || 0;
            const campoQtd = document.getElementById('qtd_selos');
            if (campoQtd) campoQtd.value = (fim >= ini && ini > 0) ? (fim - ini) + 1 : 0;
        };
        inInicio.addEventListener('input', calcular);
        inFim.addEventListener('input', calcular);
    }

    carregarHistorico();
});

// FUNÇÃO: Busca dados e atualiza a tabela
async function carregarHistorico() {
    try {
        const { data, error } = await _supabase.from('rem_essas').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        const tbody = document.getElementById('lista-remessas');
        if (tbody) {
           // Localize este trecho dentro de carregarHistorico no calculosSelos.js
tbody.innerHTML = data.map(r => `
    <tr class="border-b border-slate-800/50 hover:bg-slate-800/30 text-slate-300">
        <td class="p-4">${new Date(r.data_rec).toLocaleDateString('pt-BR')}</td>
        <td class="p-4 font-bold text-slate-400">${r.selo_inicio}</td>
        <td class="p-4">${r.selo_fim}</td>
        <td class="p-4 text-center font-black text-amber-500">${r.qtd_selos}</td>
        <td class="p-4">${r.documento || '---'}</td> 
        <td class="p-4 text-center flex gap-3 justify-center">
            <button onclick='prepararEdicao(${JSON.stringify(r)})' class="text-blue-400 hover:text-blue-500">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button onclick="deletarLote('${r.id}')" class="text-red-400 hover:text-red-500">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
    </tr>
`).join('');
        }
        atualizarResumoVisual(data);
    } catch (err) { console.error(err); }
}

// FUNÇÃO: O "Coração" do Resumo - Ajuste de Cores e Contraste
async function atualizarResumoVisual(lotes) {
    const total = lotes.reduce((acc, cur) => acc + (cur.qtd_selos || 0), 0);
    const { count: usados } = await _supabase.from('itens_os').select('*', { count: 'exact', head: true }).not('selo_inmetro', 'is', null);
    
    const estoque = total - (usados || 0);

    // Atualiza inputs de apoio
    if (document.getElementById('resumo_total')) document.getElementById('resumo_total').value = total;
    if (document.getElementById('resumo_utilizados')) document.getElementById('resumo_utilizados').value = usados || 0;
    
    const campoEstoque = document.getElementById('resumo_estoque');
    if (campoEstoque) {
        // Define o valor
        if (campoEstoque.tagName === 'INPUT') campoEstoque.value = estoque;
        else campoEstoque.innerText = estoque;

        // --- ESTILIZAÇÃO DE ALTO IMPACTO ---
        campoEstoque.style.fontWeight = "900";
        
        if (usados === 0 || usados === null) {
            // ESTADO: NENHUM USO (PRETO PURO NO FUNDO CLARO/VERDE)
            campoEstoque.style.color = "#000000"; 
            campoEstoque.style.opacity = "1";
        } else if (estoque <= 0) {
            // ESTADO: CRÍTICO (BRANCO NO FUNDO VERMELHO/ESCURO)
            campoEstoque.style.color = "#FFFFFF";
        } else {
            // ESTADO: DISPONÍVEL (PRETO NO FUNDO VERDE)
            campoEstoque.style.color = "#000000";
        }
    }
}


function limparCampos() {
    window.editandoLoteId = null; // Fundamental para o próximo clique ser um NOVO registro
    
    // Reseta o botão para o estado original
    const btnGravar = document.querySelector('button[onclick="salvarLote()"]');
    if (btnGravar) {
        btnGravar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Gravar Lote';
        btnGravar.classList.replace('text-blue-400', 'text-emerald-400');
    }

    // Limpa os inputs (mantendo a data atual)
    document.getElementById('selo_inicio').value = '';
    document.getElementById('selo_fim').value = '';
    document.getElementById('qtd_selos').value = '0';
    document.getElementById('documento').value = '';
    document.getElementById('data_rec').value = new Date().toISOString().split("T")[0];
}


// FUNÇÕES DE AÇÃO (SALVAR / EDITAR / DELETAR)
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
        if (window.editandoLoteId) {
            // LÓGICA DE ATUALIZAÇÃO
            const { error } = await _supabase
                .from('rem_essas')
                .update(dados)
                .eq('id', window.editandoLoteId);
            
            if (error) throw error;
            alert("Lote atualizado com sucesso!");
            window.editandoLoteId = null; // Limpa o estado de edição
        } else {
            // LÓGICA DE NOVO REGISTRO
            const { error } = await _supabase
                .from('rem_essas')
                .insert([dados]);
            
            if (error) throw error;
            alert("Novo lote gravado com sucesso!");
        }
        
        carregarHistorico();
        limparCampos(); // Função que limpa os inputs após o sucesso
    } catch (err) { 
        console.error(err);
        alert("Erro ao processar a operação."); 
    }
}



function prepararEdicao(lote) {
    window.editandoLoteId = lote.id; // Garante que o ID global seja preenchido
    
    // Preenche os campos
    document.getElementById('data_rec').value = lote.data_rec;
    document.getElementById('tipo_selo').value = lote.tipo_selo;
    document.getElementById('selo_inicio').value = lote.selo_inicio;
    document.getElementById('selo_fim').value = lote.selo_fim;
    document.getElementById('qtd_selos').value = lote.qtd_selos;
    document.getElementById('prefixo').value = lote.prefixo || '';
    document.getElementById('documento').value = lote.documento || '';
    document.getElementById('status_lote').value = lote.status_lote;

    // Feedback Visual: Altera o botão para avisar que é uma atualização
    const btnGravar = document.querySelector('button[onclick="salvarLote()"]');
    if (btnGravar) {
        btnGravar.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Atualizar Lote';
        btnGravar.classList.replace('text-emerald-400', 'text-blue-400');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deletarLote(id) {
    if (confirm("Excluir registro?")) {
        await _supabase.from('rem_essas').delete().eq('id', id);
        carregarHistorico();
    }
}


document.getElementById('busca_nfe').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const linhas = document.querySelectorAll('#lista-remessas tr');
    
    linhas.forEach(linha => {
        // A coluna 4 (índice 4) é onde colocamos a NF-e (documento)
        const nfe = linha.cells[4].textContent.toLowerCase();
        linha.style.display = nfe.includes(termo) ? '' : 'none';
    });
});

async function buscarPorNfe(numeroNfe) {
    try {
        const { data, error } = await _supabase
            .from('rem_essas')
            .select('*')
            .ilike('documento', `%${numeroNfe}%`) // Busca parcial (Ex: "123" acha "00123")
            .order('created_at', { ascending: false });

        if (error) throw error;
        renderizarTabela(data); // Função para atualizar o HTML
    } catch (err) { console.error(err); }
}

// Exportação Global
window.salvarLote = salvarLote;
window.deletarLote = deletarLote;
window.prepararEdicao = prepararEdicao;