const getSupabase = () => window._supabase || null;

/**
 * Busca informações técnicas de um cilindro no banco de dados.
 */
async function buscarCilindro() {
  const _supabase = getSupabase();
  if (!_supabase) {
    alert("Sistema não conectado. Aguarde um momento e tente novamente.");
    return;
  }

  const nrCilindro = document.getElementById("nr_cilindro").value.trim();
  const osAtual = document.getElementById("osBadgeNumber").innerText;

  if (!nrCilindro) {
    alert("Por favor, digite o número do cilindro.");
    return;
  }

  try {
    // 1. Tenta buscar na OS Atual primeiro para evitar duplicidade ou permitir edição
    const { data: itemLocal } = await _supabase
      .from("itens_os")
      .select("*")
      .eq("nr_cilindro", nrCilindro)
      .eq("os_number", osAtual)
      .single();

    if (itemLocal) {
      // Apenas destaca na tabela e seleciona o ID para o modal de componentes
      window.idSelecionadoComponentes = itemLocal.id;

      const rows = document.querySelectorAll("#itensList tr");
      rows.forEach((row) => {
        if (row.dataset.id == itemLocal.id) {
          if (typeof window.destacarLinha === "function")
            window.destacarLinha(parseInt(row.dataset.index));
        }
      });

      alert("Item encontrado nesta Ordem de Serviço.");
      return;
    }

    // 2. Se não achou na atual, busca em todo o histórico (Global)
    const { data: itemGlobal } = await _supabase
      .from("itens_os")
      .select("os_number, created_at")
      .eq("nr_cilindro", nrCilindro)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (itemGlobal) {
      alert(
        `Cilindro encontrado na OS: ${itemGlobal.os_number}\nData do último registro: ${new Date(itemGlobal.created_at).toLocaleDateString()}`,
      );
    } else {
      alert("Cilindro não encontrado em nenhuma Ordem de Serviço.");
    }
  } catch (err) {
    console.error("Erro na busca:", err);
    alert("Erro ao consultar o banco de dados.");
  }
}

/**
 * Preenche os campos do formulário com dados de um cilindro encontrado.
 */
function preencherCampos(item) {
  document.getElementById("cod_barras").value = item.cod_barras || "";
  document.getElementById("ano_fab").value = item.ano_fab || "";
  document.getElementById("ult_reteste").value = item.ult_reteste || "";
  document.getElementById("tipo_carga").value = item.tipo_carga || "";
}

/**
 * Abre o modal de busca de cilindros.
 */
function abrirModalBusca() {
  const modal = document.getElementById("modalBuscaCilindro");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    const input = document.getElementById("inputBuscaModal");
    input.value = "";
    input.focus();
  }
}

/**
 * Fecha o modal de busca de cilindros.
 */
function fecharModalBusca() {
  const modal = document.getElementById("modalBuscaCilindro");
  if (modal) {
    document.getElementById("inputBuscaModal").blur();
    modal.classList.add("hidden");
    document.getElementById("inputBuscaModal").value = "";
  }
}

/**
 * Executa a busca de um cilindro dentro do modal e destaca na tabela caso pertença à OS atual.
 */
async function executarBuscaModal() {
  const _supabase = getSupabase();
  const nrCilindroBusca = document
    .getElementById("inputBuscaModal")
    .value.trim();
  const osAtual = window.currentOS || sessionStorage.getItem("currentOS");

  if (!nrCilindroBusca) return;

  try {
    const { data: resultados, error } = await _supabase
      .from("itens_os")
      .select("*")
      .eq("nr_cilindro", nrCilindroBusca)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (resultados && resultados.length > 0) {
      const item = resultados[0];
      fecharModalBusca();

      if (String(item.os_number) === String(osAtual)) {
        const tbody = document.getElementById("itensList");
        const linhas = tbody.querySelectorAll("tr");
        let linhaParaDestacar = null;

        linhas.forEach((linha) => {
          if (linha.innerText.includes(nrCilindroBusca)) {
            linhaParaDestacar = linha;
            // Vincula o ID encontrado para a seleção de componentes
            window.idSelecionadoComponentes = item.id;
          }
        });

        if (linhaParaDestacar) {
          document.querySelectorAll(".row-highlight-active").forEach((el) => {
            el.classList.remove("row-highlight-active");
          });
          linhaParaDestacar.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          linhaParaDestacar.classList.add("row-highlight-active");
          const removerAoClicarFora = (e) => {
            // Se o clique não foi na própria linha, remove o destaque
            if (!linhaParaDestacar.contains(e.target)) {
              linhaParaDestacar.classList.remove("row-highlight-active");
              document.removeEventListener("click", removerAoClicarFora);
            }
          };

          setTimeout(() => {
            document.addEventListener("click", removerAoClicarFora);
          }, 200);
        } else {
          alert(
            `✅ Localizado na OS ${osAtual}, mas não está visível na tabela.`,
          );
        }
      } else {
        alert(`📍 Cilindro em outra OS: ${item.os_number}`);
      }
    } else {
      alert(`🔍 Cilindro ${nrCilindroBusca} não encontrado.`);
    }
  } catch (err) {
    console.error(err);
    alert("Erro na busca.");
  }
}

/**
 * Renderiza os resultados da busca e aplica efeitos visuais na tabela.
 */
function exibirResultadosBusca(resultados, osAtual) {
  if (resultados && resultados.length > 0) {
    const item = resultados[0];

    if (String(item.os_number) === String(osAtual)) {
      fecharModalBusca();
      const todasAsLinhas = document.querySelectorAll("tr");
      let linhaEncontrada = null;
      todasAsLinhas.forEach((linha) => {
        if (linha.innerText.includes(item.nr_cilindro)) {
          linhaEncontrada = linha;
        }
      });
      if (linhaEncontrada) {
        linhaEncontrada.scrollIntoView({ behavior: "smooth", block: "center" });
        linhaEncontrada.classList.add("row-highlight");
        setTimeout(() => {
          linhaEncontrada.classList.remove("row-highlight");
        }, 3000);
      } else {
        alert(
          `✅ Este cilindro está nesta OS, mas a linha não foi renderizada na tabela.`,
        );
      }
    } else {
      alert(`📍 Cilindro localizado em outra OS!\n\nNº OS: ${item.os_number}`);
      fecharModalBusca();
    }
  } else {
    alert("🔍 Nenhum registro encontrado para este cilindro.");
  }
}

window.buscarCilindro = buscarCilindro;
window.preencherCampos = preencherCampos;
window.abrirModalBusca = abrirModalBusca;
window.fecharModalBusca = fecharModalBusca;
window.executarBuscaModal = executarBuscaModal;
window.exibirResultadosBusca = exibirResultadosBusca;
