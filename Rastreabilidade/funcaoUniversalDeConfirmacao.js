/**
 * Exibe um modal de confirmação genérico com título, mensagem e ação customizáveis.
 */
function solicitarConfirmacao({
  titulo,
  mensagem,
  corBtn,
  textoBtn,
  icone,
  callback,
}) {
  const modal = document.getElementById("confirmacaoGeral");
  const btn = document.getElementById("btnConfirmarAcaoGeral");

  if (document.getElementById("tituloConfirmacao"))
    document.getElementById("tituloConfirmacao").innerText =
      titulo || "Tem certeza?";
  if (document.getElementById("msgConfirmacao"))
    document.getElementById("msgConfirmacao").innerHTML =
      mensagem || "Esta ação é permanente.";

  btn.className = `flex-[1.5] text-white font-bold py-4 rounded-2xl text-xs uppercase shadow-lg transition-all ${corBtn || "bg-red-500 hover:bg-red-600 shadow-red-200"}`;
  btn.innerText = textoBtn || "Confirmar";

  modal.classList.remove("hidden");

  btn.onclick = async () => {
    btn.disabled = true;
    const originalText = btn.innerText;
    btn.innerHTML =
      '<i class="fa-solid fa-circle-notch animate-spin"></i> Processando...';

    await callback(); // Executa a função que você passou

    btn.disabled = false;
    btn.innerText = originalText;
    fecharConfirmacao();
  };
}

function fecharConfirmacao() {
  const modal = document.getElementById("confirmacaoGeral");
  if (modal) modal.classList.add("hidden");
}

window.solicitarConfirmacao = solicitarConfirmacao;
window.fecharConfirmacao = fecharConfirmacao;
