// Variável de controle local
let nbrEmEdicaoId = null;

/**
 * FUNÇÃO DE APOIO: Localiza o Supabase de forma segura
 */
function obterSupabase() {
    // Tenta encontrar no window ou na variável global definida no main.js
    const instance = window._supabase || (typeof _supabase !== 'undefined' ? _supabase : null);
    if (!instance) {
        console.error("ERRO: O cliente Supabase não foi encontrado. Verifique se o main.js carregou corretamente.");
    }
    return instance;
}

// --- 1. SINCRONIZAÇÃO DINÂMICA ---
window.atualizarSelectNBRPrincipal = async function() {
    const selectNBR = document.getElementById('nbr_id');
    const supabase = obterSupabase();
    if (!selectNBR || !supabase) return;

    try {
        const { data, error } = await supabase
            .from('nbrs')
            .select('numero_norma')
            .order('numero_norma', { ascending: true });

        if (error) throw error;

        const valorAtual = selectNBR.value;
        selectNBR.innerHTML = '<option value="">Selecione...</option>';
        
        data.forEach(item => {
            const opcao = document.createElement('option');
            opcao.value = item.numero_norma;
            opcao.text = "NBR " + item.numero_norma;
            selectNBR.appendChild(opcao);
        });

        selectNBR.value = valorAtual; 
    } catch (err) {
        console.error("Erro ao atualizar select:", err.message);
    }
};

// --- 2. GESTÃO DO MODAL ---
window.openNBRModal = async function() {
    const modal = document.getElementById('modalNBR');
    if (modal) {
        modal.classList.remove('hidden');
        window.limparCamposNBR();
        await window.fetchNBRs();
    }
};

window.closeNBRModal = () => {
    const modal = document.getElementById('modalNBR');
    if (modal) modal.classList.add('hidden');
};

// --- 3. LISTAGEM NO MODAL ---
window.fetchNBRs = async function() {
    const supabase = obterSupabase();
    if (!supabase) return;

    try {
        const { data, error } = await supabase
            .from('nbrs')
            .select('*')
            .order('numero_norma', { ascending: true });

        if (error) throw error;

        const tbody = document.getElementById('listaNBRModal');
        if (!tbody) return;

        tbody.innerHTML = data.map(item => `
            <tr class="border-b hover:bg-slate-50 transition-colors group">
                <td class="p-4 font-bold text-indigo-600 cursor-pointer" onclick="selecionarNBR('${item.numero_norma}')">NBR ${item.numero_norma}</td>
                <td class="p-4 text-slate-500">${item.descricao || '-'}</td>
                <td class="p-4 text-center">
                    <button onclick="prepararEdicaoNBR(${item.id}, '${item.numero_norma}', '${item.descricao}')" class="text-blue-400 mr-2"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="excluirNBR(${item.id}, '${item.numero_norma}')" class="text-red-300 hover:text-red-500"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`).join('');
    } catch (error) { console.error(error); }
};

// --- 4. SALVAMENTO E EXCLUSÃO ---
window.salvarNovaNBR = async function() {
    const supabase = obterSupabase();
    const nbrValue = document.getElementById('newNBR').value.trim();
    const descricao = document.getElementById('descNBR').value.trim();

    if (!nbrValue || !supabase) return alert("Verifique os dados ou a conexão.");

    try {
        const payload = { numero_norma: nbrValue, descricao: descricao };
        if (nbrEmEdicaoId) {
            await supabase.from('nbrs').update(payload).eq('id', nbrEmEdicaoId);
        } else {
            await supabase.from('nbrs').insert([payload]);
        }

        await window.atualizarSelectNBRPrincipal(); 
        await window.fetchNBRs(); 
        window.limparCamposNBR();
    } catch (error) { alert("Erro: " + error.message); }
};

window.excluirNBR = function(id, numero) {
    const supabase = obterSupabase();
    if (!supabase) return;

    solicitarConfirmacao({
        titulo: "Excluir NBR?",
        mensagem: `Deseja remover a <b>NBR ${numero}</b>?`,
        icone: "fa-trash",
        callback: async () => {
            await supabase.from('nbrs').delete().eq('id', id);
            await window.fetchNBRs();
            await window.atualizarSelectNBRPrincipal();
        }
    });
};

// --- AUXILIARES ---
window.prepararEdicaoNBR = function(id, numero, descricao) {
    nbrEmEdicaoId = id;
    document.getElementById('newNBR').value = numero;
    document.getElementById('descNBR').value = descricao;
    const btn = document.getElementById('btnSalvarNBR');
    if (btn) btn.innerText = "SALVAR EDIÇÃO";
};

window.limparCamposNBR = function() {
    nbrEmEdicaoId = null;
    document.getElementById('newNBR').value = '';
    document.getElementById('descNBR').value = '';
    const btn = document.getElementById('btnSalvarNBR');
    if (btn) btn.innerText = "CADASTRAR NBR";
};

window.selecionarNBR = function(valor) {
    const select = document.getElementById('nbr_id');
    if (select) {
        select.value = valor;
        select.dispatchEvent(new Event('change'));
    }
    window.closeNBRModal();
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Pequeno delay para garantir que o main.js carregou o _supabase
    setTimeout(() => {
        window.atualizarSelectNBRPrincipal();
    }, 500);
});