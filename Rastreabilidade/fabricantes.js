// Usamos 'var' para evitar erros de redeclaração no console
var idFabEdicaoGlobal = null;

// --- 1. BUSCA NOME DINÂMICO (EXIBE DENTRO DO INPUT) ---
async function X_BUSCAR_POR_ID(id) {
    const input = document.getElementById("X_input_id");
    const badge = document.getElementById("badgeNomeFabricante");

    // Se o input estiver vazio, limpa o badge e o padding
    if (!id) {
        if (badge) badge.classList.add("hidden");
        if (input) input.style.paddingLeft = "0.75rem"; // pl-3 original
        return;
    }

    try {
        const { data, error } = await _supabase
            .from("fabricantes")
            .select("nome")
            .eq("id", id)
            .single();

        if (data && !error) {
            badge.innerText = data.nome;
            badge.classList.remove("hidden");
            
            // Calcula o espaço necessário para o nome não cobrir o número digitado
            // Aguarda um pequeno tempo para o badge renderizar e obter a largura real
            setTimeout(() => {
                const larguraBadge = badge.offsetWidth;
                input.style.paddingLeft = (larguraBadge + 12) + "px";
            }, 10);
        } else {
            if (badge) badge.classList.add("hidden");
            if (input) input.style.paddingLeft = "0.75rem";
        }
    } catch (e) {
        if (badge) badge.classList.add("hidden");
    }
}

// --- 2. PREPARAR EDIÇÃO (ACIONADO PELO LÁPIS NO MODAL) ---
function prepararEdicaoFabricante(id, nome, apelido) {
    idFabEdicaoGlobal = id;

    // Preenche os campos do formulário no modal
    document.getElementById("busca_fab_nome").value = nome;
    document.getElementById("busca_fab_apelido").value = apelido;

    // Atualiza o input de Cód externo e mostra o badge com o nome
    const inputId = document.getElementById("X_input_id");
    const badge = document.getElementById("badgeNomeFabricante");

    if (inputId && badge) {
        inputId.value = id;
        badge.innerText = nome;
        badge.classList.remove("hidden");
        
        // Ajusta o padding dinamicamente
        setTimeout(() => {
            inputId.style.paddingLeft = (badge.offsetWidth + 12) + "px";
        }, 20);
    }

    // Altera o botão do modal para modo ATUALIZAR
    const btnSalvar = document.getElementById("btnSalvarFabricante");
    if (btnSalvar) {
        btnSalvar.innerHTML = '<i class="fa-solid fa-rotate"></i> ATUALIZAR';
        btnSalvar.className = "bg-amber-500 border border-amber-600 px-6 py-1.5 text-[10px] font-black text-white hover:bg-amber-600 transition-all uppercase rounded-sm";
    }
    
    document.getElementById("btnCancelarEdicaoFab")?.classList.remove("hidden");
}

// --- 3. CANCELAR / RESETAR INTERFACE ---
function cancelarEdicaoFabricante() {
    idFabEdicaoGlobal = null;
    
    const inputId = document.getElementById("X_input_id");
    const badge = document.getElementById("badgeNomeFabricante");

    if (inputId) {
        inputId.value = "";
        inputId.style.paddingLeft = "0.75rem";
    }
    if (badge) badge.classList.add("hidden");

    document.getElementById("busca_fab_nome").value = "";
    document.getElementById("busca_fab_apelido").value = "";

    const btnSalvar = document.getElementById("btnSalvarFabricante");
    if (btnSalvar) {
        btnSalvar.innerHTML = '+ Salvar Fabricante';
        btnSalvar.className = "bg-slate-100 border border-slate-400 px-6 py-1.5 text-[10px] font-black text-slate-700 hover:bg-emerald-600 hover:text-white transition-all uppercase rounded-sm";
    }
    
    document.getElementById("btnCancelarEdicaoFab")?.classList.add("hidden");
}

// --- 4. SALVAR OU ATUALIZAR NO BANCO ---
async function cadastrarNovoFabricante() {
    const nome = document.getElementById("busca_fab_nome").value.trim().toUpperCase();
    const apelido = document.getElementById("busca_fab_apelido").value.trim().toUpperCase();

    if (!nome) return alert("O nome é obrigatório.");

    try {
        if (idFabEdicaoGlobal) {
            const { error } = await _supabase.from("fabricantes").update({ nome, apelido }).eq('id', idFabEdicaoGlobal);
            if (error) throw error;
        } else {
            const { error } = await _supabase.from("fabricantes").insert([{ nome, apelido }]);
            if (error) throw error;
        }

        cancelarEdicaoFabricante();
        await carregarFabricantesNaTabela();
    } catch (err) {
        alert("Erro: " + err.message);
    }
}

// --- 5. EXCLUIR COM SEU MODAL UNIVERSAL ---
async function deletarFabricante(id) {
    solicitarConfirmacao({
        titulo: "EXCLUIR FABRICANTE",
        mensagem: `Deseja remover o fabricante ID: ${id}?`,
        icone: "fa-trash-can",
        corBtn: "bg-red-500 hover:bg-red-600",
        textoBtn: "Excluir",
        callback: async () => {
            try {
                const { error } = await _supabase.from("fabricantes").delete().eq('id', id);
                if (error) throw error;
                await carregarFabricantesNaTabela();
            } catch (e) {
                alert("Erro ao excluir: Item pode estar vinculado.");
            }
        }
    });
}

// --- 6. FUNÇÕES DE CARREGAMENTO E MODAL ---
async function carregarFabricantesNaTabela(filtro = "") {
    const tbody = document.getElementById("listaFabricantesModal");
    if (!tbody) return;

    try {
        let query = _supabase.from("fabricantes").select("*").order("id", { ascending: true });
        if (filtro) query = query.ilike("nome", `%${filtro}%`);

        const { data, error } = await query;
        if (error) throw error;

        tbody.innerHTML = data.map(fab => `
            <tr class="border-b border-slate-200 hover:bg-slate-50">
                <td class="p-2 border-r border-slate-200 text-center font-bold text-indigo-600">${fab.id}</td>
                <td class="p-2 border-r border-slate-200 uppercase font-bold">${fab.nome}</td>
                <td class="p-2 border-r border-slate-200 uppercase text-slate-500 text-[10px]">${fab.apelido || ""}</td>
                <td class="p-2 text-center">
                    <div class="flex justify-center gap-2">
                        <button onclick="prepararEdicaoFabricante(${fab.id}, '${fab.nome}', '${fab.apelido || ''}')" class="text-blue-500 hover:scale-125 transition-all">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deletarFabricante(${fab.id})" class="text-red-400 hover:scale-125 transition-all">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");
    } catch (e) { console.error(e); }
}

async function X_ABRIR_FAB() {
    document.getElementById("modalFabricante").classList.remove("hidden");
    await carregarFabricantesNaTabela();
}

function fecharModalFab() {
    document.getElementById("modalFabricante").classList.add("hidden");
    cancelarEdicaoFabricante();
}

function filtrarFabricantes() {
    carregarFabricantesNaTabela(document.getElementById("busca_fab_nome").value);
}