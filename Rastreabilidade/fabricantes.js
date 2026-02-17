async function openFabricanteModal() {
    document.getElementById('modalFabricante').classList.remove('hidden');
    cancelarEdicao(); // Garante que começa em modo cadastro
    await fetchFabricantes(); 
}

function closeFabricanteModal() {
    document.getElementById('modalFabricante').classList.add('hidden');
}

// Adiciona busca automática enquanto digita
document.addEventListener('DOMContentLoaded', () => {
    const n = document.getElementById('searchFabNome');
    const a = document.getElementById('searchFabApelido');
    if(n) n.oninput = fetchFabricantes;
    if(a) a.oninput = fetchFabricantes;
});

async function fetchFabricantes() {
    const nome = document.getElementById('searchFabNome').value;
    const apelido = document.getElementById('searchFabApelido').value;
    try {
        let q = _supabase.from('fabricantes').select('*').order('nome', { ascending: true });
        if (nome) q = q.ilike('nome', `%${nome}%`);
        if (apelido) q = q.ilike('apelido', `%${apelido}%`);
        const { data, error } = await q;
        if (error) throw error;
        renderFabricantesModal(data);
    } catch (e) { console.error(e.message); }
}

function renderFabricantesModal(lista) {
    const tbody = document.getElementById('listaFabricantesModal');
    tbody.innerHTML = lista.map(f => `
        <tr class="hover:bg-indigo-50/50 transition-all group cursor-pointer">
            <td onclick="selectFabricante('${f.nome}', '${f.id}')" class="p-3 text-slate-400 font-mono text-[10px]">${f.id}</td>
            <td onclick="selectFabricante('${f.nome}', '${f.id}')" class="p-3 font-bold text-slate-700 uppercase text-xs">${f.nome}</td>
            <td onclick="selectFabricante('${f.nome}', '${f.id}')" class="p-3 text-slate-500 uppercase text-xs">${f.apelido || '-'}</td>
            <td class="p-3 text-right space-x-2">
                <button onclick="prepararEdicao('${f.id}', '${f.nome}', '${f.apelido}')" class="text-blue-500 hover:scale-110"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deletarFabricante('${f.id}', '${f.nome}')" class="text-red-300 hover:text-red-600"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function prepararEdicao(id, nome, apelido) {
    const modal = document.getElementById('modalFabricante');
    modal.dataset.editingId = id;
    document.getElementById('searchFabNome').value = nome;
    document.getElementById('searchFabApelido').value = apelido;
    document.getElementById('btnSalvarFab').innerText = "Salvar Alteração";
    document.getElementById('btnSalvarFab').classList.replace('bg-indigo-600', 'bg-amber-500');
    document.getElementById('btnCancelarEdit').classList.remove('hidden');
}

function cancelarEdicao() {
    const modal = document.getElementById('modalFabricante');
    delete modal.dataset.editingId;
    document.getElementById('searchFabNome').value = "";
    document.getElementById('searchFabApelido').value = "";
    document.getElementById('btnSalvarFab').innerText = "Cadastrar";
    document.getElementById('btnSalvarFab').classList.remove('bg-amber-500');
    document.getElementById('btnSalvarFab').classList.add('bg-indigo-600');
    document.getElementById('btnCancelarEdit').classList.add('hidden');
    fetchFabricantes();
}

async function cadastrarFabricante() {
    const modal = document.getElementById('modalFabricante');
    const id = modal.dataset.editingId;
    const nome = document.getElementById('searchFabNome').value.toUpperCase().trim();
    const apelido = document.getElementById('searchFabApelido').value.toUpperCase().trim();

    if (!nome) return alert("Nome obrigatório");

    const { error } = id 
        ? await _supabase.from('fabricantes').update({ nome, apelido }).eq('id', id)
        : await _supabase.from('fabricantes').insert([{ nome, apelido }]);

    if (error) alert(error.message);
    else cancelarEdicao();
}

async function deletarFabricante(id, nome) {
    solicitarConfirmacao({
        titulo: "Excluir Fabricante",
        mensagem: `Você deseja apagar <b>${nome.toUpperCase()}</b>? Isso pode afetar os extintores cadastrados com este código.`,
        corBtn: "bg-red-500 hover:bg-red-600 shadow-red-200",
        textoBtn: "Sim, Excluir",
        icone: "fa-industry",
        callback: async () => {
            const { error } = await _supabase.from('fabricantes').delete().eq('id', id);
            if (error) alert("Erro ao excluir: " + error.message);
            else await fetchFabricantes();
        }
    });
}

// 1. Função para buscar o nome quando você digita o ID manualmente
async function buscarFabricantePorCodigo(id) {
    const display = document.getElementById('nomeFabricanteDisplay');
    if (!id) {
        display.innerText = '';
        return;
    }

    try {
        const { data, error } = await _supabase
            .from('fabricantes')
            .select('nome')
            .eq('id', id)
            .single();

        if (data) {
            display.innerText = data.nome;
        } else {
            display.innerText = 'NÃO ACHOU';
        }
    } catch (e) {
        display.innerText = '';
    }
}

// 2. Função para quando você clica na linha da tabela no Modal
window.selectFabricante = function(nome, id) {
    const inputId = document.getElementById('fabricante_id');
    const display = document.getElementById('nomeFabricanteDisplay');
    
    if (inputId) inputId.value = id;
    if (display) display.innerText = nome;
    
    closeFabricanteModal();
};