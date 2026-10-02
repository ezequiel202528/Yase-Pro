let statusSelecionadoManual = "APROVADO";

/**
 * Define o status do serviço (Aprovado/Reprovado/Novo) e atualiza o feedback visual.
 */
function setStatus(status, element) {
  statusSelecionadoManual = status.toUpperCase();

  const inputHidden = document.getElementById("resultado_valor");
  if (inputHidden) inputHidden.value = statusSelecionadoManual;

  const botoes = element.parentElement.querySelectorAll(
    'div[onclick^="setStatus"]',
  );

  botoes.forEach((btn) => {
    btn.classList.remove("opacity-100", "border-2");
    btn.classList.add("opacity-40");
  });

  element.classList.remove("opacity-40");
  element.classList.add("opacity-100", "border-2");
}

/**
 * Define o status manualmente sem feedback visual direto no elemento (uso interno).
 */
function selecionarStatusManual(status) {
  statusSelecionadoManual = status.toUpperCase();
  document.querySelectorAll(".btn-status-selector").forEach((btn) => {
    btn.classList.remove("ring-2", "ring-white", "border-white");
  });
}

const inputUltimoReteste = document.getElementById("ult_reteste");
const camposHidrostaticos = document.querySelectorAll(
  ".ensaios-group-red input",
);

/**
 * Monitora a digitação do ano de último reteste.
 * Bloqueia ou libera os campos de Ensaio Hidrostático conforme a necessidade
 * (Manutenção de 2º ou 3º nível).
 */
inputUltimoReteste.addEventListener("input", function () {
  const anoInformado = parseInt(this.value);
  const anoAtual = new Date().getFullYear(); // 2026
  const diferencaAnos = anoAtual - anoInformado;

  // Lógica para Bloqueio: Se a diferença for entre 1 e 4 anos, é Nível 2.
  // O Teste Hidrostático (Nível 3) só é permitido se a diferença for >= 5 ou se for o ano atual.
  if (this.value.length === 4) {
    if (diferencaAnos > 0 && diferencaAnos < 5) {
      camposHidrostaticos.forEach((input) => {
        input.disabled = true;
        input.style.backgroundColor = "#1a1a1a";
        input.style.cursor = "not-allowed";
        input.value = "";
      });
      const grupoHidro = document.querySelector(".ensaios-group-red");
      if (grupoHidro) grupoHidro.style.opacity = "0.4";
    } else {
      camposHidrostaticos.forEach((input) => {
        input.disabled = false;
        input.style.backgroundColor = "transparent";
        input.style.cursor = "text";
      });
      const grupoHidro = document.querySelector(".ensaios-group-red");
      if (grupoHidro) grupoHidro.style.opacity = "1";
    }
  }
});

/**
 * Valida se o ano de reteste informado é válido para manutenção.
 * Exibe um modal de erro caso o extintor esteja condenado ou com data incompatível.
 */
function validarAnoReteste() {
  const campoReteste = document.getElementById("ult_reteste");
  if (!campoReteste) return true;

  const valorInformado = parseInt(campoReteste.value);
  const anoAtual = new Date().getFullYear(); // 2026
  const limiteMinimo = anoAtual - 5; // 2021

  if (!valorInformado || campoReteste.value.length !== 4) return true;

  if (valorInformado < limiteMinimo) {
    document.getElementById("anoInvalidoDestaque").innerText = valorInformado;
    document.getElementById("anoMinimoDestaque").innerText = limiteMinimo;
    const modal = document.getElementById("modalErroReteste");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    campoReteste.classList.add("border-red-500", "bg-red-500/5");
    return false;
  }
  campoReteste.classList.remove("border-red-500", "bg-red-500/5");
  return true;
}

/**
 * Fecha o modal de erro de ano de reteste.
 */
function fecharModalErroReteste() {
  const modal = document.getElementById("modalErroReteste");
  if (modal) modal.classList.add("hidden");
  modal.classList.remove("flex");

  document.getElementById("ult_reteste").focus();
}

// Garante que o modal de erro de reteste seja fechado globalmente
window.fecharModalErroReteste = fecharModalErroReteste;
window.validarAnoReteste = validarAnoReteste;
window.setStatus = setStatus;

/**
 * Realiza o cálculo automático das próximas datas de recarga (+1 ano)
 * e reteste (+5 anos) com base na data de selagem e último reteste.
 */
function calcularDatasAutomaticas() {
  const campoDataSelagem = document.getElementById("data_selagem");
  const ultReteste = document.getElementById("ult_reteste").value;
  const displayRecarga = document.getElementById("display_prox_recarga");
  const displayReteste = document.getElementById("display_prox_reteste");

  let dataReferencia =
    campoDataSelagem && campoDataSelagem.value
      ? new Date(campoDataSelagem.value)
      : new Date();

  if (campoDataSelagem.value) {
    dataReferencia.setMinutes(
      dataReferencia.getMinutes() + dataReferencia.getTimezoneOffset(),
    );
  }

  const dataProxRecarga = new Date(dataReferencia);
  dataProxRecarga.setFullYear(dataProxRecarga.getFullYear() + 1);

  if (displayRecarga) {
    displayRecarga.innerText = dataProxRecarga.toLocaleDateString("pt-BR");
  }

  if (ultReteste && ultReteste.length === 4) {
    const anoBase = parseInt(ultReteste);
    const proximoReteste = anoBase + 5;

    if (displayReteste) {
      displayReteste.innerText = proximoReteste;
    }
  } else {
    if (displayReteste) displayReteste.innerText = "----";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setLevel(2);
  const campoDataSelagem = document.getElementById("data_selagem");
  if (campoDataSelagem && !campoDataSelagem.value) {
    campoDataSelagem.value = new Date().toISOString().split("T")[0];
  }
  calcularDatasAutomaticas();
});

/**
 * Define o nível de manutenção dinamicamente com base no ano do último reteste.
 * Regras:
 * - Ano Atual: Nível 3 (Ensaio Hidrostático)
 * - Até 5 anos atrás: Nível 2 (Manutenção de 2º Grau)
 * - Acima de 5 anos: Nível 1 (Inspeção)
 */
function definirNivelPeloReteste() {
  const campoReteste = document.getElementById("ult_reteste");
  const valorInformado = campoReteste.value;
  const anoAtual = new Date().getFullYear(); // 2026

  const checkboxes = document.querySelectorAll(".custom-checkbox");
  const getCheck = (texto) =>
    Array.from(checkboxes).find((c) =>
      c.nextElementSibling?.textContent.includes(texto),
    );

  const chkPneumMano = getCheck("Ens. Pneum. Manômetro");
  const chkPneumValv = getCheck("Ens. Pneum. Válvula");
  const chkHidroValv = getCheck("Ens. Hidrost. Válvula");
  const chkHidroMang = getCheck("Ens. Hidrost. Mangueira");
  const chkPintura = document.getElementById("comp_pintura");

  if (valorInformado.length === 4) {
    const anoReteste = parseInt(valorInformado);
    const diferencaAnos = anoAtual - anoReteste;

    [
      chkPneumMano,
      chkPneumValv,
      chkHidroValv,
      chkHidroMang,
      chkPintura,
    ].forEach((c) => {
      if (c) c.checked = false;
    });

    // REGRA NÍVEL 3: Ano atual (2026) ou mais de 5 anos de atraso
    if (anoReteste === anoAtual || diferencaAnos >= 5) {
      setLevel(3);

      // Marca Inspeções
      if (chkPneumMano) chkPneumMano.checked = true;
      if (chkPneumValv) chkPneumValv.checked = true;
      if (chkHidroValv) chkHidroValv.checked = true;
      if (chkHidroMang) chkHidroMang.checked = true;

      // MARCA PINTURA AUTOMATICAMENTE
      if (chkPintura) chkPintura.checked = true;
    }

    // REGRA NÍVEL 2: Entre 1 e 4 anos de diferença
    else if (diferencaAnos > 0 && diferencaAnos < 5) {
      setLevel(2);
      if (chkPneumMano) chkPneumMano.checked = true;
      if (chkPneumValv) chkPneumValv.checked = true;
    }

    // REGRA NÍVEL 1
    else {
      setLevel(1);
    }
  }
}
// Função setLevel atualizada com automação de Pintura e Badge
function setLevel(lvl) {
  window.selectedLevel = lvl; // Variável global com window

  // Atualiza visual dos botões NV1, NV2, NV3
  document.querySelectorAll("[data-level]").forEach((btn) => {
    btn.classList.remove("active", "bg-indigo-600", "text-white");
    if (parseInt(btn.dataset.level) === lvl) {
      btn.classList.add("active", "bg-indigo-600", "text-white");
    }
  });

  // --- LÓGICA DA PINTURA AUTOMÁTICA ---
  const checkPintura = document.getElementById("comp_pintura");
  if (checkPintura) {
    // Se for nível 3, marca. Se não, desmarca.
    checkPintura.checked = lvl === 3;
  }

  // Lógica do Teste Hidrostático (Habilitar/Desabilitar campos)
  const grupoHidro = document.querySelector(".ensaios-group-red");
  if (lvl === 3) {
    if (grupoHidro) grupoHidro.style.opacity = "1";
    // ... habilita campos de ensaio
  } else {
    if (grupoHidro) grupoHidro.style.opacity = "0.4";
    // ... limpa e desabilita campos de ensaio
  }
}
// Inicialização ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
  setLevel(2); // Define Nível 2 como padrão ao abrir
});

function atualizarBadgeComponentes() {
  // Conta quantos checkboxes estão marcados dentro do modal
  const totalMarcados = document.querySelectorAll(
    '#container_checks_componentes input[type=\"checkbox\"]:checked',
  ).length;
  const badge = document.getElementById("badge-comp");

  if (badge) {
    badge.innerText = totalMarcados;
    if (totalMarcados > 0) {
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }
}

// Exportação Global para o HTML (onclick/oninput)
window.setStatus = setStatus;
window.selecionarStatusManual = selecionarStatusManual;
window.validarAnoReteste = validarAnoReteste;
window.fecharModalErroReteste = fecharModalErroReteste;
window.calcularDatasAutomaticas = calcularDatasAutomaticas;
window.definirNivelPeloReteste = definirNivelPeloReteste;
window.setLevel = setLevel;
window.atualizarBadgeComponentes = atualizarBadgeComponentes;
