/**
 * GERENCIAMENTO DE NBR - YA SE PRO
 * Ajustado para evitar conflitos de declaração e erros de UI
 */

let editandoNBR_ID = null;

// --- 1. FUNÇÕES DE LIMPEZA E INTERFACE ---

function limparEstadosVisuais() {
    const modalNBR = document.getElementById('modalNBR');
    const modalConfirm = document.getElementById('modalConfirmacao');

    // Remove desfoques
    if (modalNBR) {
        modalNBR.classList.remove('blur-sm');
        modalNBR.style.filter = "none";
    }

    // Fecha confirmação se estiver aberta
    if (modalConfirm) {
        modalConfirm.classList.add('hidden');
        modalConfirm.classList.remove('flex');
    }

    // Libera o scroll da página
    document.body.style.overflow = 'auto';
}

// --- 2. COMUNICAÇÃO COM O BANCO (SUPABASE) ---

async function atualizarSelectNBR() {
    const select = document.getElementById('nbr_select');
    if (!select) return;

    try {
        // Usa a instância _supabase já declarada no main.js
        const { data, error } = await _supabase
            .from('nbr')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;

        let options = '<option value="">SELECIONE...</option>';
        data.forEach(item => {
            const desc = item.descricao ? ` - ${item.descricao}` : "";
            options += `<option value="${item.id}">${item.nome}${desc}</option>`;
        });
        select.innerHTML = options;
    } catch (err) {
        console.error("Erro ao carregar NBRs:", err);
    }
}

async function carregarNBRNaTabela(filtro = "") {
    const tbody = document.getElementById('listaNBRModal');
    if (!tbody) return;

    try {
        let query = _supabase.from('nbr').select('*').order('id', { ascending: true });
        if (filtro) query = query.ilike('nome', `%${filtro}%`);

        const { data, error } = await query;
        if (error) throw error;

        tbody.innerHTML = data.map(n => `
            <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td class="p-2 border-r border-slate-200 text-center font-bold text-indigo-600">${n.id}</td>
                <td class="p-2 border-r border-slate-200 uppercase font-bold cursor-pointer" onclick="selecionarNBR(${n.id})">${n.nome}</td>
                <td class="p-2 border-r border-slate-200 uppercase text-slate-500 text-[10px] cursor-pointer" onclick="selecionarNBR(${n.id})">${n.descricao || ''}</td>
                <td class="p-2 text-center">
                    <div class="flex justify-center gap-2">
                        <button onclick="prepararEdicaoNBR(${n.id}, '${n.nome}', '${n.descricao || ''}')" class="text-blue-500 hover:scale-110 transition-transform">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deletarNBR(${n.id})" class="text-red-400 hover:scale-110 transition-transform">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Erro na tabela:", err);
    }
}

// --- 3. AÇÕES (SALVAR / DELETAR) ---

async function salvarNBR() {
    const nome = document.getElementById('busca_nbr_nome').value.trim().toUpperCase();
    const descricao = document.getElementById('busca_nbr_descricao').value.trim().toUpperCase();

    if (!nome) return alert("Preencha o campo Norma.");

    try {
        if (editandoNBR_ID) {
            await _supabase.from('nbr').update({ nome, descricao }).eq('id', editandoNBR_ID);
        } else {
            await _supabase.from('nbr').insert([{ nome, descricao }]);
        }
        cancelarEdicaoNBR();
        await carregarNBRNaTabela();
        await atualizarSelectNBR();
    } catch (e) {
        alert("Erro ao salvar dados.");
    }
}

async function deletarNBR(id) {
    abrirConfirmacaoGeral(
        "CONFIRMAR EXCLUSÃO", 
        `Deseja realmente excluir a NBR ID: ${id}?`,
        async () => {
            try {
                const { error } = await _supabase.from('nbr').delete().eq('id', id);
                if (error) throw error;
                await carregarNBRNaTabela();
                await atualizarSelectNBR();
                limparEstadosVisuais(); 
            } catch (err) {
                alert("Erro: Esta norma pode estar vinculada a um extintor.");
                limparEstadosVisuais();
            }
        }
    );
}

// --- 4. CONTROLE DE MODAIS (UI) ---

async function X_ABRIR_NBR() {
    const modal = document.getElementById('modalNBR');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        await carregarNBRNaTabela();
    }
}

function fecharModalNBR() {
    const modal = document.getElementById('modalNBR');
    if (modal) modal.classList.add('hidden');
    limparEstadosVisuais();
    cancelarEdicaoNBR();
}

function abrirConfirmacaoGeral(titulo, mensagem, acaoConfirmar) {
    const modalConfirm = document.getElementById('modalConfirmacao');
    const modalNBR = document.getElementById('modalNBR');
    const btn = document.getElementById('btnConfirmarAcaoGeral');

    if (modalConfirm) {
        document.getElementById('confirmTitle').innerText = titulo;
        document.getElementById('confirmMessage').innerText = mensagem;

        if (modalNBR) modalNBR.classList.add('blur-sm');

        modalConfirm.classList.remove('hidden');
        modalConfirm.classList.add('flex');

        const novoBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(novoBtn, btn);
        novoBtn.onclick = async () => {
            await acaoConfirmar();
        };
    }
}

function fecharConfirmacao() {
    limparEstadosVisuais();
}

// --- 5. AUXILIARES ---

function prepararEdicaoNBR(id, nome, descricao) {
    editandoNBR_ID = id;
    document.getElementById('busca_nbr_nome').value = nome;
    document.getElementById('busca_nbr_descricao').value = descricao;
    document.getElementById('btnCancelarEdicaoNBR').classList.remove('hidden');
    
    const btnSalvar = document.getElementById('btnSalvarNBR');
    btnSalvar.innerHTML = 'Atualizar';
    btnSalvar.classList.replace('bg-slate-100', 'bg-amber-500');
}

function cancelarEdicaoNBR() {
    editandoNBR_ID = null;
    document.getElementById('busca_nbr_nome').value = "";
    document.getElementById('busca_nbr_descricao').value = "";
    document.getElementById('btnCancelarEdicaoNBR').classList.add('hidden');
    
    const btnSalvar = document.getElementById('btnSalvarNBR');
    btnSalvar.innerHTML = '+ Salvar Norma';
    btnSalvar.className = "bg-slate-100 border border-slate-400 px-6 py-1.5 text-[10px] font-black text-slate-700 hover:bg-emerald-600 hover:text-white transition-all uppercase";
}

function selecionarNBR(id) {
    const select = document.getElementById('nbr_select');
    if (select) select.value = id;
    fecharModalNBR();
}

function filtrarNBR() {
    carregarNBRNaTabela(document.getElementById('busca_nbr_nome').value);
}

// Inicialização
document.addEventListener('DOMContentLoaded', atualizarSelectNBR);