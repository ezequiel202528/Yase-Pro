// Garante o acesso ao cliente Supabase
const getSupabase = () => (typeof _supabase !== 'undefined') ? _supabase : (window._supabase || null);

window.openCapacidadeModal = async function() {
    const modal = document.getElementById('modalCapacidade');
    if (modal) {
        modal.classList.remove('hidden');
        if (typeof window.resetarFormCapacidade === 'function') window.resetarFormCapacidade(); 
        await carregarCapacidades();
    }
};

window.closeCapacidadeModal = () => {
    const modal = document.getElementById('modalCapacidade');
    if (modal) modal.classList.add('hidden');
};

async function carregarCapacidades() {
    const client = getSupabase();
    if (!client) return;

    const listaKG = document.getElementById('listaKG');
    const listaL = document.getElementById('listaL');
    const selectPrincipal = document.getElementById('capacidade');
    
    if (!listaKG || !listaL || !selectPrincipal) return;

    try {
        const { data, error } = await client.from('cad_capacidades').select('*');
        if (error) throw error;

        data.sort((a, b) => a.valor_num - b.valor_num);

        listaKG.innerHTML = '';
        listaL.innerHTML = '';
        selectPrincipal.innerHTML = '<option value="">Selecione a capacidade</option>';

        data.forEach(item => {
            const label = `${item.valor_num} ${item.unidade}`;
            const opt = document.createElement('option');
            opt.value = label; opt.textContent = label;
            selectPrincipal.appendChild(opt);

            const row = document.createElement('div');
            row.className = "flex items-center justify-between px-4 py-3 border-b border-slate-200/50 hover:bg-white/60 transition-all group w-full";
            row.innerHTML = `
                <div onclick="selecionarCapacidade('${label}')" class="flex items-baseline gap-1.5 cursor-pointer">
                    <span class="text-sm font-black text-slate-800">${item.valor_num}</span>
                    <span class="text-[9px] font-bold text-slate-500 uppercase">${item.unidade}</span>
                </div>
                <div class="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button onclick="prepararEdicaoCap('${item.id}', '${item.valor_num}', '${item.unidade}')" class="text-amber-500 hover:text-amber-600 p-1">
                        <i class="fa-solid fa-pen-to-square text-[12px]"></i>
                    </button>
                    <button onclick="excluirCapacidade('${item.id}', '${label}')" class="text-red-400 hover:text-red-600 p-1">
                        <i class="fa-solid fa-trash text-[12px]"></i>
                    </button>
                </div>
            `;
            if (item.unidade === 'KG') listaKG.appendChild(row);
            else listaL.appendChild(row);
        });
    } catch (err) { console.error(err); }
}

// FUNÇÃO DE EXCLUSÃO ATUALIZADA PARA O MODAL UNIVERSAL
window.excluirCapacidade = async function(id, label) {
    solicitarConfirmacao({
        titulo: "Excluir Capacidade",
        mensagem: `Tem certeza que deseja remover a capacidade <b>${label}</b>?`,
        icone: "fa-weight-hanging",
        corBtn: "bg-red-500 hover:bg-red-600 shadow-red-200",
        textoBtn: "Sim, Excluir",
        callback: async () => {
            const client = getSupabase();
            try {
                const { error } = await client.from('cad_capacidades').delete().eq('id', id);
                if (error) throw error;
                await carregarCapacidades();
            } catch (err) {
                console.error("Erro ao excluir:", err);
                alert("Não foi possível excluir o item.");
            }
        }
    });
};

window.selecionarCapacidade = function(valor) {
    const select = document.getElementById('capacidade');
    if (select) {
        select.value = valor;
        select.dispatchEvent(new Event('change'));
    }
    window.closeCapacidadeModal();
};

// Funções restantes de salvamento e reset...
window.resetarFormCapacidade = function() {
    document.getElementById('editId').value = "";
    document.getElementById('capValor').value = "";
    const btn = document.getElementById('btnSalvarCap');
    if (btn) btn.innerText = "Cadastrar";
    document.getElementById('btnCancelarEdit').classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', () => { setTimeout(carregarCapacidades, 500); });


window.executarSalvarCapacidade = async function() {
    const client = getSupabase();
    if (!client) return;

    const id = document.getElementById('editId').value;
    const valor = document.getElementById('capValor').value;
    const unidade = document.getElementById('capUnidade').value;

    if (!valor) {
        alert("Por favor, insira um valor.");
        return;
    }

    const dados = {
        valor_num: parseFloat(valor),
        unidade: unidade
    };

    try {
        if (id) {
            // Se tem ID, estamos editando
            const { error } = await client.from('cad_capacidades').update(dados).eq('id', id);
            if (error) throw error;
        } else {
            // Se não tem ID, estamos criando novo
            const { error } = await client.from('cad_capacidades').insert([dados]);
            if (error) throw error;
        }

        // Limpa o formulário e recarrega a lista
        resetarFormCapacidade();
        await carregarCapacidades();
        
    } catch (err) {
        console.error("Erro ao salvar capacidade:", err);
        alert("Erro ao salvar os dados.");
    }
};

// Aproveite e adicione a função de preparar edição que também parece faltar:
window.prepararEdicaoCap = function(id, valor, unidade) {
    document.getElementById('editId').value = id;
    document.getElementById('capValor').value = valor;
    document.getElementById('capUnidade').value = unidade;
    
    document.getElementById('btnSalvarCap').innerText = "Atualizar";
    document.getElementById('btnCancelarEdit').classList.remove('hidden');
};