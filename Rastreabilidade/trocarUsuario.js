// Garante acesso ao cliente Supabase global
// function obterSupabase() {
//   return window._supabase || null;
//  função correta}



// async function abrirModalTrocaUsuario() {
//   // Mostra o modal
//   const modal = document.getElementById("modalTrocaUsuario");
//   if (modal) {
//     modal.classList.remove("hidden");
//     modal.classList.add("flex");
//   }
  
//   const msgErro = document.getElementById("msgErroTroca");
//   if (msgErro) msgErro.classList.add("hidden");
  
//   const senhaInput = document.getElementById("troca_senha");
//   if (senhaInput) senhaInput.value = "";

//   const _supabase = obterSupabase();
//   const selectEl = document.getElementById("troca_codigo");
//   if (!selectEl) return;

//   selectEl.innerHTML = '<option value="">A carregar operadores...</option>';

//   if (!_supabase) {
//     selectEl.innerHTML = '<option value="">Erro de conexão com o Supabase</option>';
//     return;
//   }

//   // CORREÇÃO: Verifica tanto 'yase_user' quanto 'yase_colab' no localStorage
//   let empresaIdLocal = null;
//   try {
//     const userJson = localStorage.getItem('yase_user') || localStorage.getItem('yase_colab');
//     if (userJson) {
//       const parsedUser = JSON.parse(userJson);
//       empresaIdLocal = parsedUser.empresa_id;
//     }
//   } catch (e) {
//     console.error("Erro ao ler sessão:", e);
//   }

//   if (!empresaIdLocal) {
//     selectEl.innerHTML = '<option value="">Empresa não identificada</option>';
//     return;
//   }

//   // Busca no Supabase apenas os utilizadores vinculados à empresa atual
//   const { data: usuarios, error } = await _supabase
//     .from("usu_arios")
//     .select("codigo_id, nome_completo, nivel_permissao")
//     .eq("empresa_id", empresaIdLocal);

//   if (error) {
//     console.error("Erro ao buscar operadores:", error);
//     selectEl.innerHTML = '<option value="">Erro ao carregar operadores</option>';
//     return;
//   }

//   // Preenche o select com os dados obtidos e formatação corrigida
//   selectEl.innerHTML = '<option value="">Selecione o operador...</option>';
  
//   if (usuarios && usuarios.length > 0) {
//     usuarios.forEach(u => {
//       const option = document.createElement("option");
//       option.value = u.codigo_id; 
//       // CORREÇÃO: Adicionado espaço e separador limpo para o nível e ID
//       option.textContent = `${u.nome_completo} (${u.nivel_permissao || 'Operador'} - ID: ${u.codigo_id})`;
//       selectEl.appendChild(option);
//     });
//   } else {
//     selectEl.innerHTML = '<option value="">Nenhum operador cadastrado</option>';
//   }
//     função correta }


// function fecharModalTrocaUsuario() {
//   document.getElementById("modalTrocaUsuario").classList.add("hidden");
//   document.getElementById("modalTrocaUsuario").classList.remove("flex");
//   document.getElementById("troca_codigo").value = "";
//   document.getElementById("troca_senha").value = "";
//    função correta}

// async function confirmarTrocaUsuario() {
//   const _supabase = obterSupabase();
//   if (!_supabase) {
//     alert("Sistema não conectado. Aguarde um momento e tente novamente.");
//     return;
//   }

//   const codigo = document.getElementById("troca_codigo").value;
//   const senha = document.getElementById("troca_senha").value;
//   const btn = document.getElementById("btnConfirmarTroca");
//   const msg = document.getElementById("msgErroTroca");

//   if (!codigo || !senha) return;

//   // Recupera a empresa atual da sessão para garantir que o usuário pertence à mesma empresa
//   let empresaIdLocal = null;
//   try {
//     const userJson = localStorage.getItem('yase_user');
//     if (userJson) {
//       const parsedUser = JSON.parse(userJson);
//       empresaIdLocal = parsedUser.empresa_id;
//     }
//   } catch (e) {
//     console.error("Erro ao ler dados da sessão:", e);
//   }

//   if (!empresaIdLocal) {
//     alert("Sessão expirada. Faça login novamente.");
//     window.location.replace('index.html');
//     return;
//   }

//   btn.disabled = true;
//   btn.innerText = "VERIFICANDO...";
//   msg.classList.add("hidden");

//   try {
//     // Busca o usuário filtrando OBRIGATORIAMENTE pela empresa_id e pelo codigo_id
//     const { data, error } = await _supabase
//       .from("usu_arios")
//       .select("*") // Puxa todas as colunas para atualizar a sessão completa
//       .eq("empresa_id", empresaIdLocal) // <-- GARANTE que busca apenas na empresa correta
//       .eq("codigo_id", codigo)
//       .eq("senha", senha)
//       .single();

//     if (error || !data) {
//       throw new Error("Credenciais inválidas");
//     }

//     // Atualiza a interface
//     const displayElement = document.getElementById("nome-operador-logado");
//     if (displayElement) {
//       displayElement.innerText = data.nome_completo.toUpperCase();
//     }

//     // Atualiza o localStorage com o objeto completo do novo usuário logado
//     localStorage.setItem("yase_user", JSON.stringify(data));
//     localStorage.setItem("nome_operador", data.nome_completo);

//     // Atualiza variáveis globais se houverem
//     window.nomeOperadorLogado = data.nome_completo;

//     fecharModalTrocaUsuario();

//     // Recarrega a página ou a aplicação para aplicar o novo perfil por completo
//     location.reload(); 

//   }	catch (err) {
//     console.error(err);
//     msg.innerText = "ID ou Senha incorretos!";
//     msg.classList.remove("hidden");
//   } finally {
//     btn.disabled = false;
//     btn.innerText = "CONFIRMAR TROCA";
//   }
//       função correta}

// Garante acesso ao cliente Supabase global
function obterSupabase() {
  return window._supabase || null;
}

async function abrirModalTrocaUsuario() {
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

  let empresaIdLocal = null;
  let usuarioLogadoId = null;
  try {
    const userJson = localStorage.getItem('yase_user') || localStorage.getItem('yase_colab');
    if (userJson) {
      const parsedUser = JSON.parse(userJson);
      empresaIdLocal = parsedUser.empresa_id;
      usuarioLogadoId = parsedUser.id; // Captura o ID do usuário logado para ocultá-lo
    }
  } catch (e) {
    console.error("Erro ao ler sessão:", e);
  }

  if (!empresaIdLocal) {
    selectEl.innerHTML = '<option value="">Empresa não identificada</option>';
    return;
  }

  // Busca operadores ativos da empresa, incluindo o 'id' e excluindo o usuário logado e bloqueados
  let query = _supabase
    .from("usu_arios")
    .select("id, codigo_id, nome_completo, nivel_permissao, status")
    .eq("empresa_id", empresaIdLocal)
    .neq("status", "bloqueado");

  if (usuarioLogadoId) {
    query = query.neq("id", usuarioLogadoId);
  }

  const { data: usuarios, error } = await query;

  if (error) {
    console.error("Erro ao buscar operadores:", error);
    selectEl.innerHTML = '<option value="">Erro ao carregar operadores</option>';
    return;
  }

  selectEl.innerHTML = '<option value="">Selecione o operador...</option>';
  
  if (usuarios && usuarios.length > 0) {
    usuarios.forEach(u => {
      const option = document.createElement("option");
      option.value = u.codigo_id; 
      // Texto formatado de forma limpa sem quebras indesejadas
      option.textContent = `${u.nome_completo} (${u.nivel_permissao || 'Operador'} - ID: ${u.codigo_id})`;
      selectEl.appendChild(option);
    });
  } else {
    selectEl.innerHTML = '<option value="">Nenhum outro operador ativo disponível</option>';
  }
}

function fecharModalTrocaUsuario() {
  const modal = document.getElementById("modalTrocaUsuario");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  const codigoEl = document.getElementById("troca_codigo");
  const senhaEl = document.getElementById("troca_senha");
  if (codigoEl) codigoEl.value = "";
  if (senhaEl) senhaEl.value = "";
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

  let empresaIdLocal = null;
  try {
    const userJson = localStorage.getItem('yase_user') || localStorage.getItem('yase_colab');
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
  if (msg) msg.classList.add("hidden");

  try {
    const { data, error } = await _supabase
      .from("usu_arios")
      .select("*") 
      .eq("empresa_id", empresaIdLocal) 
      .eq("codigo_id", codigo)
      .eq("senha", senha)
      .single();

    if (error || !data) {
      throw new Error("Credenciais inválidas");
    }

    if (data.status === 'bloqueado') {
      if (msg) {
        msg.innerText = "⚠️ Acesso Bloqueado: Este usuário está bloqueado pelo administrador.";
        msg.classList.remove("hidden");
      }
      btn.disabled = false;
      btn.innerText = "CONFIRMAR TROCA";
      return; 
    }

    const displayElement = document.getElementById("nome-operador-logado");
    if (displayElement) {
      displayElement.innerText = data.nome_completo.toUpperCase();
    }

    localStorage.setItem("yase_user", JSON.stringify(data));
    localStorage.setItem("yase_colab", JSON.stringify(data));
    localStorage.setItem("nome_operador", data.nome_completo);

    window.nomeOperadorLogado = data.nome_completo;

    fecharModalTrocaUsuario();
    location.reload(); 

  } catch (err) {
    console.error(err);
    if (msg) {
      msg.innerText = "ID ou Senha incorretos!";
      msg.classList.remove("hidden");
    }
    btn.disabled = false;
    btn.innerText = "CONFIRMAR TROCA";
  }
}

// Vincula as funções ao escopo global de forma limpa
window.abrirModalTrocaUsuario = abrirModalTrocaUsuario;
window.fecharModalTrocaUsuario = fecharModalTrocaUsuario;
window.confirmarTrocaUsuario = confirmarTrocaUsuario;