// Garante acesso ao cliente Supabase global
function obterSupabase() {
  return window._supabase || null;
}

function abrirModalTrocaUsuario() {
  document.getElementById("modalTrocaUsuario").classList.remove("hidden");
  document.getElementById("modalTrocaUsuario").classList.add("flex");
  document.getElementById("msgErroTroca").classList.add("hidden");
}

function fecharModalTrocaUsuario() {
  document.getElementById("modalTrocaUsuario").classList.add("hidden");
  document.getElementById("modalTrocaUsuario").classList.remove("flex");
  document.getElementById("troca_codigo").value = "";
  document.getElementById("troca_senha").value = "";
}

async function confirmarTrocaUsuario() {
  const _supabase = obterSupabase();
  if (!_supabase) {
    alert("Sistema não conectado. Aguarde um momento e tente novamente.");
    return;
  }

  const codigo = document.getElementById("troca_codigo").value;
  const senha = document.getElementById("troca_senha").value;
  const btn = document.getElementById("btnConfirmarTroca");
  const msg = document.getElementById("msgErroTroca");

  if (!codigo || !senha) return;

  btn.disabled = true;
  btn.innerText = "VERIFICANDO...";
  msg.classList.add("hidden");

  try {
    // Busca o usuário no banco de dados
    const { data, error } = await _supabase
      .from("usu_arios")
      .select("nome_completo")
      .eq("codigo_id", codigo)
      .eq("senha", senha)
      .single();

    if (error || !data) {
      throw new Error("Credenciais inválidas");
    }

    // Atualiza a interface sem recarregar
    const displayElement = document.getElementById("nome-operador-logado");
    if (displayElement) {
      displayElement.innerText = data.nome_completo.toUpperCase();
    }

    // Opcional: Salvar no localStorage para manter após o refresh se desejar
    localStorage.setItem("nome_operador", data.nome_completo);

    // Atualiza a variável global para que o sistema reconheça a troca imediatamente
    window.nomeOperadorLogado = data.nome_completo;

    fecharModalTrocaUsuario();

    // Notificação de sucesso visual
    console.log(`Operador alterado para: ${data.nome_completo}`);
  } catch (err) {
    msg.innerText = "ID ou Senha incorretos!";
    msg.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.innerText = "CONFIRMAR TROCA";
  }
}

window.abrirModalTrocaUsuario = abrirModalTrocaUsuario;
window.fecharModalTrocaUsuario = fecharModalTrocaUsuario;
window.confirmarTrocaUsuario = confirmarTrocaUsuario;
