/**
 * GERENCIAMENTO DE NBR - YA SE PRO
 */

const getSupa = () => window._supabase || window.supabase;
window.editandoNBRId = null;

async function carregarNBRs() {
  try {
    const { data, error } = await getSupa()
      .from("nbr")
      .select("*")
      .order("nome", { ascending: true });

    if (error) throw error;
    renderizarListaNBR(data);
    atualizarSelectNBR(data);
  } catch (err) {
    console.error("Erro ao carregar NBRs:", err);
  }
}

function renderizarListaNBR(lista) {
  const container = document.getElementById("listaNBRs");
  if (!container) return;

  container.innerHTML = (lista || [])
    .map(
      (item) => `
        <div class="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:border-amber-500 hover:bg-slate-800/60 transition-all group">
            <div onclick="selecionarNBR('${item.nome}')" class="flex-1 cursor-pointer">
                <span class="text-slate-200 text-xs font-bold uppercase">${item.nome}</span>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="prepararEdicaoNBR('${item.id}', '${item.nome}')" class="text-amber-500 hover:text-amber-400 p-1">
                    <i class="fa-solid fa-pen-to-square text-[10px]"></i>
                </button>
                <button onclick="deletarNBR('${item.id}')" class="text-red-500 hover:text-red-400 p-1">
                    <i class="fa-solid fa-trash text-[10px]"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

function atualizarSelectNBR(lista) {
  const select = document.getElementById("nbr_select");
  if (!select) return;
  const valorAtual = select.value;
  select.innerHTML =
    '<option value="">Norma NBR</option>' +
    lista.map((n) => `<option value="${n.nome}">${n.nome}</option>`).join("");
  select.value = valorAtual;
}

function selecionarNBR(nome) {
  const select = document.getElementById("nbr_select");
  if (select) select.value = nome;
  if (select) {
    select.value = nome;

    // Remove estados de erro e aplica feedback visual de sucesso
    select.classList.remove("input-error-shake", "border-red-500");
    select.classList.add("border-emerald-500", "ring-2", "ring-emerald-500/20");

    // Dispara o evento de mudança para atualizar o estado interno do sistema
    select.dispatchEvent(new Event("change"));

    setTimeout(() => {
      select.classList.remove(
        "border-emerald-500",
        "ring-2",
        "ring-emerald-500/20",
      );
    }, 1000);

    console.log(`✅ NBR selecionada com sucesso: ${nome}`);
  }
  fecharModalNBR();
}

async function salvarNBR() {
  const input = document.getElementById("novoNBRNome");
  const nome = input.value.toUpperCase().trim();
  if (!nome) return;

  const supa = getSupa();
  if (window.editandoNBRId) {
    const { error } = await supa
      .from("nbr")
      .update({ nome })
      .eq("id", window.editandoNBRId);
    if (!error) {
      window.editandoNBRId = null;
      document.getElementById("btnSalvarNBR").innerText = "ADICIONAR";
      input.value = "";
      carregarNBRs();
    }
  } else {
    const { error } = await supa.from("nbr").insert([{ nome }]);
    if (!error) {
      input.value = "";
      carregarNBRs();
    }
  }
}

function prepararEdicaoNBR(id, nome) {
  window.editandoNBRId = id;
  const input = document.getElementById("novoNBRNome");
  input.value = nome;
  input.focus();
  document.getElementById("btnSalvarNBR").innerText = "SALVAR";
}

async function deletarNBR(id) {
  if (confirm("Deseja realmente excluir esta norma?")) {
    const { error } = await getSupa().from("nbr").delete().eq("id", id);
    if (!error) carregarNBRs();
  }
}

export function abrirModalNBR() {
  document.getElementById("modalNBR")?.classList.replace("hidden", "flex");
  carregarNBRs();
}

export function fecharModalNBR() {
  document.getElementById("modalNBR")?.classList.replace("flex", "hidden");
  window.editandoNBRId = null;
  document.getElementById("novoNBRNome").value = "";
  document.getElementById("btnSalvarNBR").innerText = "ADICIONAR";
}

window.carregarNBRs = carregarNBRs;
window.abrirModalNBR = abrirModalNBR;
window.fecharModalNBR = fecharModalNBR;
window.salvarNBR = salvarNBR;
window.selecionarNBR = selecionarNBR;
window.prepararEdicaoNBR = prepararEdicaoNBR;
window.deletarNBR = deletarNBR;
window.filtrarNBRs = () => {
  const termo = document.getElementById("filtroNBR").value.toLowerCase();
  const itens = document.getElementById("listaNBRs").children;
  for (let item of itens)
    item.style.display = item.innerText.toLowerCase().includes(termo)
      ? "flex"
      : "none";
};
