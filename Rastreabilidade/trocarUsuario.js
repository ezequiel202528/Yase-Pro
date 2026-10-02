// Garante acesso ao cliente Supabase global
function obterSupabase() {
  return window._supabase || null;
}

async function abrirModalTrocaUsuario() {
  // Mostra o modal
  const modal = document.getElementById("modalTrocaUsuario");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
  
  const msgErro = document.getElementById("msgErroTroca");
  if (msgErro) msgErro.classList.add("hidden");
  
  const senhaInput = document.getElementById("troca_senha");
  if (senhaInput) senhaInput.value = "";

  const _supabase = obterSupabase();
  const selectEl = document.getElementById("troca_codigo");
  if (!selectEl) return;

  selectEl.innerHTML = '<option value="">A carregar operadores...</option>';

  if (!_supabase) {
    selectEl.innerHTML = '<option value="">Erro de conexão com o Supabase</option>';
    return;
  }

  // Recupera o ID da empresa atual do utilizador logado no localStorage
  let empresaIdLocal = null;
  try {
    const userJson = localStorage.getItem('yase_user');
    if (userJson) {
      const parsedUser = JSON.parse(userJson);
      empresaIdLocal = parsedUser.empresa_id;
    }
  } catch (e) {
    console.error("Erro ao ler sessão:", e);
  }

  if (!empresaIdLocal) {
    selectEl.innerHTML = '<option value="">Empresa não identificada</option>';
    return;
  }

  // Busca no Supabase apenas os utilizadores vinculados à empresa atual
  const { data: usuarios, error } = await _supabase
    .from("usu_arios")
    .select("codigo_id, nome_completo, nivel_permissao")
    .eq("empresa_id", empresaIdLocal);

  if (error) {
    console.error("Erro ao buscar operadores:", error);
    selectEl.innerHTML = '<option value="">Erro ao carregar operadores</option>';
    return;
  }

  // Preenche o select com os dados obtidos
  selectEl.innerHTML = '<option value="">Selecione o operador...</option>';
  
  if (usuarios && usuarios.length > 0) {
    usuarios.forEach(u => {
      const option = document.createElement("option");
      option.value = u.codigo_id; // O valor enviado será o código ID (ex: OPE2, 01)
      option.textContent = `${u.nome_completo} (${u.nivel_permissao} - ID: ${u.codigo_id})`;
      selectEl.appendChild(option);
    });
  } else {
    selectEl.innerHTML = '<option value="">Nenhum operador cadastrado</option>';
  }
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

  // Recupera a empresa atual da sessão para garantir que o usuário pertence à mesma empresa
  let empresaIdLocal = null;
  try {
    const userJson = localStorage.getItem('yase_user');
    if (userJson) {
      const parsedUser = JSON.parse(userJson);
      empresaIdLocal = parsedUser.empresa_id;
    }
  } catch (e) {
    console.error("Erro ao ler dados da sessão:", e);
  }

  if (!empresaIdLocal) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.replace('index.html');
    return;
  }

  btn.disabled = true;
  btn.innerText = "VERIFICANDO...";
  msg.classList.add("hidden");

  try {
    // Busca o usuário filtrando OBRIGATORIAMENTE pela empresa_id e pelo codigo_id
    const { data, error } = await _supabase
      .from("usu_arios")
      .select("*") // Puxa todas as colunas para atualizar a sessão completa
      .eq("empresa_id", empresaIdLocal) // <-- GARANTE que busca apenas na empresa correta
      .eq("codigo_id", codigo)
      .eq("senha", senha)
      .single();

    if (error || !data) {
      throw new Error("Credenciais inválidas");
    }

    // Atualiza a interface
    const displayElement = document.getElementById("nome-operador-logado");
    if (displayElement) {
      displayElement.innerText = data.nome_completo.toUpperCase();
    }

    // Atualiza o localStorage com o objeto completo do novo usuário logado
    localStorage.setItem("yase_user", JSON.stringify(data));
    localStorage.setItem("nome_operador", data.nome_completo);

    // Atualiza variáveis globais se houverem
    window.nomeOperadorLogado = data.nome_completo;

    fecharModalTrocaUsuario();

    // Recarrega a página ou a aplicação para aplicar o novo perfil por completo
    location.reload(); 

  }	catch (err) {
    console.error(err);
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
