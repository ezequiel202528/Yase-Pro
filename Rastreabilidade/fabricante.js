const getSupa = () => window._supabase || null;

/**
 * Renderiza a lista de fabricantes no container HTML do modal.
 */
function renderizarListaFabricantes(lista) {
  const container = document.getElementById("listaFabricantes");
  if (!container) return;

  container.innerHTML = (lista || [])
    .map(
      (fab) => `
            <div onclick="selecionarFabricante('${fab.id}', '${fab.nome}')" 
                 class="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:border-amber-500 hover:bg-slate-800/60 transition-all cursor-pointer group">
                <span class="bg-amber-500/10 text-amber-500 font-black text-[10px] px-2 py-1 rounded-md group-hover:bg-amber-500 group-hover:text-slate-900">ID: ${fab.id}</span>
                <span class="text-slate-200 text-xs font-bold uppercase">${fab.nome}</span>
            </div>
        `,
    )
    .join("");
}

/**
 * Busca a lista de fabricantes do Supabase e renderiza no modal
 */
async function carregarFabricantes() {
  const supabase = getSupa();
  if (!supabase) {
    console.warn("⏳ Supabase não disponível ainda");
    setTimeout(carregarFabricantes, 500);
    return;
  }

  try {
    const { data, error } = await supabase
      .from("fabricantes")
      .select("id, nome")
      .order("id", { ascending: true });

    if (error) throw error;
    renderizarListaFabricantes(data);
  } catch (err) {
    console.error("Erro ao carregar fabricantes:", err);
  }
}

/**
 * Seleciona um fabricante da lista e preenche o formulário de rastreio.
 */
function selecionarFabricante(id, nome) {
  const inputFabId = document.getElementById("X_input_id");

  if (inputFabId) {
    inputFabId.value = id;
    window.fabricanteValido = true;
    buscarNomeFabricante(id);
    inputFabId.classList.remove("input-error-shake", "border-red-500");
    console.log(`Fabricante selecionado: ${nome} (ID: ${id})`);
  }

  inputFabId.classList.add(
    "border-emerald-500",
    "ring-2",
    "ring-emerald-500/20",
  );

  setTimeout(
    () =>
      inputFabId.classList.remove(
        "border-emerald-500",
        "ring-2",
        "ring-emerald-500/20",
      ),
    1000,
  );

  fecharModalFabricante();
}

/**
 * Cadastra um novo fabricante no banco de dados e atualiza a lista.
 */
async function cadastrarFabricante() {
  const nomeInput = document.getElementById("novoFabricanteNome");
  if (!nomeInput) return;

  const nome = nomeInput.value.toUpperCase().trim();

  if (!nome) return;

  const _supabase = getSupa();
  const { data, error } = await _supabase
    .from("fabricantes")
    .insert([{ nome }])
    .select();

  if (!error) {
    nomeInput.value = "";
    carregarFabricantes();
  } else {
    console.error("Erro ao cadastrar:", error.message);
  }
}

/**
 * Abre o modal de fabricantes.
 */
function abrirModalFabricante() {
  const modal = document.getElementById("modalFabricante");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    carregarFabricantes();
  }
}

/**
 * Fecha o modal de fabricantes.
 */
function fecharModalFabricante() {
  const modal = document.getElementById("modalFabricante");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

/**
 * Filtra a lista de fabricantes exibida no modal com base no texto digitado.
 */
function filtrarFabricantes() {
  const termo = document.getElementById("filtroFabricante").value.toLowerCase();
  const lista = document.getElementById("listaFabricantes");
  const itens = lista.getElementsByTagName("div");

  for (let i = 0; i < itens.length; i++) {
    const nomeFabricante = itens[i].innerText.toLowerCase();
    if (nomeFabricante.includes(termo)) {
      itens[i].style.display = "flex";
    } else {
      itens[i].style.display = "none";
    }
  }
}

window.fabricanteValido = false;

/**
 * Busca o nome do fabricante pelo ID para exibição no preview do formulário.
 */
async function buscarNomeFabricante(id) {
  const display = document.getElementById("nome_fabricante_preview");
  window.fabricanteValido = false;
  if (!id) {
    display.innerText = "";
    return;
  }

  try {
    const { data, error } = await getSupa()
      .from("fabricantes")
      .select("nome")
      .eq("id", parseInt(id))
      .single();

    if (data && data.nome) {
      const primeiroNome = data.nome.split(" ")[0];
      display.innerText = primeiroNome.substring(0, 10);
      display.classList.remove("text-red-500");
      display.classList.add("text-emerald-500");
      window.fabricanteValido = true;
    } else {
      display.innerText = "NÃO ENCONTRADO";
      display.classList.remove("text-emerald-500");
      display.classList.add("text-red-500");
      window.fabricanteValido = false;
    }
  } catch (err) {
    display.innerText = "ERRO";
    window.fabricanteValido = false;
  }
}

/**
 * Verifica se o fabricante é válido antes de permitir o registro do item.
 */
function validarFabricanteAntesDeSeguir(event) {
  if (!window.fabricanteValido) {
    event.preventDefault();

    const msg = document.createElement("div");
    msg.innerHTML = `
            <div id="alert-fabricante" class="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 border-l-4 border-red-500 p-4 rounded shadow-2xl animate-bounce">
                <div class="flex items-center">
                    <i class="fa-solid fa-triangle-exclamation text-red-500 mr-3"></i>
                    <span class="text-white text-[11px] font-bold uppercase">Fabricante Inválido! Informe um ID cadastrado.</span>
                </div>
            </div>
        `;
    document.body.appendChild(msg);

    setTimeout(() => {
      const alert = document.getElementById("alert-fabricante");
      if (alert) alert.remove();
    }, 3000);

    return false;
  }
}

/**
 * Exibe um alerta de erro estilizado na tela.
 */
function exibirAlertaErro(mensagem) {
  const alertaAntigo = document.getElementById("yase-alert-premium");
  if (alertaAntigo) alertaAntigo.remove();

  const modal = document.createElement("div");
  modal.id = "yase-alert-premium";

  modal.className = `
        fixed top-8 left-1/2 -translate-x-1/2 z-[10000] 
        flex items-center gap-4 px-6 py-4
        bg-slate-900/90 backdrop-blur-xl
        border border-red-500/50 rounded-2xl
        shadow-[0_20px_50px_rgba(239,68,68,0.3)]
        animate-in fade-in zoom-in slide-in-from-top-8 duration-300
    `;

  modal.innerHTML = `
        <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
            <i class="fa-solid fa-triangle-exclamation text-red-500 text-lg"></i>
        </div>
        <div class="flex flex-col">
            <span class="text-[10px] font-black text-red-500 uppercase tracking-[2px]">Erro de Validação</span>
            <span class="text-white text-xs font-bold">${mensagem}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="ml-4 text-slate-500 hover:text-white transition-colors">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

  document.body.appendChild(modal);

  setTimeout(() => {
    if (modal) {
      modal.classList.add(
        "animate-out",
        "fade-out",
        "zoom-out",
        "slide-out-to-top-8",
      );
      setTimeout(() => modal.remove(), 300);
    }
  }, 4000);
}

window.abrirModalFabricante = abrirModalFabricante;
window.fecharModalFabricante = fecharModalFabricante;
window.carregarFabricantes = carregarFabricantes;
window.renderizarListaFabricantes = renderizarListaFabricantes;
window.selecionarFabricante = selecionarFabricante;
window.cadastrarFabricante = cadastrarFabricante;
window.filtrarFabricantes = filtrarFabricantes;
window.buscarNomeFabricante = buscarNomeFabricante;
window.validarFabricanteAntesDeSeguir = validarFabricanteAntesDeSeguir;
window.exibirAlertaErro = exibirAlertaErro;
