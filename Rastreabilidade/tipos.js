/**
 * Gerenciamento de Tipos de Carga do sistema.
 */
const getSupa = () => window._supabase || window.supabase;
window.editandoTipoId = null;

/**
 * Carrega os tipos de carga cadastrados no Supabase.
 */
async function carregarTipos() {
  try {
    const { data, error } = await getSupa()
      .from("tipos_carga")
      .select("*")
      .order("nome", { ascending: true });

    if (error) throw error;
    renderizarListaTipo(data);
    atualizarSelectTipo(data);
  } catch (err) {
    console.error("Erro ao carregar tipos:", err);
  }
}

/**
 * Renderiza a lista de tipos de carga no modal.
 */
function renderizarListaTipo(lista) {
  const container = document.getElementById("listaTipos");
  if (!container) return;

  container.innerHTML = (lista || [])
    .map(
      (item) => `
        <div class="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:border-amber-500 hover:bg-slate-800/60 transition-all group">
            <div onclick="selecionarTipo('${item.nome}')" class="flex-1 cursor-pointer">
                <span class="text-slate-200 text-xs font-bold uppercase">${item.nome}</span>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="prepararEdicaoTipo('${item.id}', '${item.nome}')" class="text-amber-500 hover:text-amber-400 p-1">
                    <i class="fa-solid fa-pen-to-square text-[10px]"></i>
                </button>
                <button onclick="deletarTipo('${item.id}')" class="text-red-500 hover:text-red-400 p-1">
                    <i class="fa-solid fa-trash text-[10px]"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

/**
 * Atualiza o elemento select de tipos de carga no formulário principal.
 */
function atualizarSelectTipo(lista) {
  const select = document.getElementById("tipo_carga");
  if (!select) return;
  const valorAtual = select.value;
  select.innerHTML =
    '<option value="">Tipo</option>' +
    lista.map((n) => `<option value="${n.nome}">${n.nome}</option>`).join("");
  select.value = valorAtual;
}

/**
 * Seleciona um tipo de carga e fecha o modal.
 */
function selecionarTipo(nome) {
  const select = document.getElementById("tipo_carga");
  if (select) {
    select.value = nome;
    select.dispatchEvent(new Event("change"));
  }
  fecharModalTipo();
}

/**
 * Salva (insere ou atualiza) um tipo de carga no banco de dados.
 */
async function salvarTipo() {
  const input = document.getElementById("novoTipoNome");
  const nome = input.value.toUpperCase().trim();
  if (!nome) return;

  const supa = getSupa();
  if (window.editandoTipoId) {
    const { error } = await supa
      .from("tipos_carga")
      .update({ nome })
      .eq("id", window.editandoTipoId);
    if (!error) {
      window.editandoTipoId = null;
      document.getElementById("btnSalvarTipo").innerText = "ADICIONAR";
      input.value = "";
      carregarTipos();
    }
  } else {
    const { error } = await supa.from("tipos_carga").insert([{ nome }]);
    if (!error) {
      input.value = "";
      carregarTipos();
    }
  }
}

/**
 * Prepara o formulário do modal para editar um tipo de carga existente.
 */
function prepararEdicaoTipo(id, nome) {
  window.editandoTipoId = id;
  const input = document.getElementById("novoTipoNome");
  input.value = nome;
  input.focus();
  document.getElementById("btnSalvarTipo").innerText = "SALVAR";
}

/**
 * Exclui um tipo de carga do banco de dados após confirmação.
 */
async function deletarTipo(id) {
  if (confirm("Deseja realmente excluir este tipo de carga?")) {
    const { error } = await getSupa().from("tipos_carga").delete().eq("id", id);
    if (!error) carregarTipos();
  }
}

window.abrirModalTipo = () => {
  const modal = document.getElementById("modalTipo");
  modal?.classList.remove("hidden");
  modal?.classList.add("flex");
  carregarTipos();
};
window.fecharModalTipo = () =>
  document.getElementById("modalTipo")?.classList.add("hidden") ||
  document.getElementById("modalTipo")?.classList.remove("flex");

window.carregarTipos = carregarTipos;
window.salvarTipo = salvarTipo;
window.selecionarTipo = selecionarTipo;
window.prepararEdicaoTipo = prepararEdicaoTipo;
window.deletarTipo = deletarTipo;
window.filtrarTipos = () => {
  const termo = document.getElementById("filtroTipo").value.toLowerCase();
  const itens = document.getElementById("listaTipos").children;
  for (let item of itens)
    item.style.display = item.innerText.toLowerCase().includes(termo)
      ? "flex"
      : "none";
};
