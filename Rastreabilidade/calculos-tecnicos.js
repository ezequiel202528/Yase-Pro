function calcularDatasAutomaticas() {
  const dataSelagem = document.getElementById("data_selagem").value;
  const ultReteste = document.getElementById("ult_reteste").value;

  // Cálculo Próxima Recarga (+1 ano)
  if (dataSelagem) {
    const data = new Date(dataSelagem);
    data.setFullYear(data.getFullYear() + 1);

    // Formata para o padrão brasileiro DD/MM/AAAA
    const dataFormatada = data.toLocaleDateString("pt-BR");

    // Atualiza o display visual no card de VALIDADES
    const displayRecarga = document.getElementById("display_prox_recarga");
    if (displayRecarga) displayRecarga.innerText = dataFormatada;
  }

  // Cálculo Próximo Reteste (+5 anos)
  if (ultReteste && ultReteste.length === 4) {
    const proxReteste = parseInt(ultReteste) + 5;
    const displayReteste = document.getElementById("display_prox_reteste");
    if (displayReteste) displayReteste.innerText = proxReteste;
  }
}
function definirNivelPeloReteste() {
  const campoReteste = document.getElementById("ult_reteste");
  const valorInformado = campoReteste.value;
  const tipoCarga = document.getElementById("tipo_carga").value;
  const anoAtual = new Date().getFullYear();

  // 1. Prioridade absoluta: Se for CO2, é inspeção (Nível 1)
  if (tipoCarga === "CO2") {
    setLevel(1);
    return;
  }

  // 2. Só processa se o usuário informou um ano válido de 4 dígitos
  if (valorInformado.length === 4) {
    const anoReteste = parseInt(valorInformado);

    // Se o ano informado for IGUAL ao ano atual -> Nível 3 (Vistoria de 5 anos)
    if (anoReteste === anoAtual) {
      setLevel(3);
    }
    // Se o ano informado for MENOR que o atual e MAIOR que (atual - 5) -> Nível 2
    else if (anoReteste < anoAtual && anoReteste >= anoAtual - 4) {
      setLevel(2);
    }
    // Para qualquer outra situação (anos muito antigos ou novos) -> Nível 1
    else {
      setLevel(1);
    }
  }
}