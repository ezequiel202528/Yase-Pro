

 function checkAuth() {
  const userStr = sessionStorage.getItem('ya_u');
  const empresaStr = sessionStorage.getItem('ya_e');

  if (!userStr || !empresaStr) {
    window.location.href = "EntrarSistema.html";
    return;
  }

  const user = JSON.parse(userStr);

  document.getElementById("userName").textContent =
    user.nome_completo;

  document.getElementById("userRole").textContent =
    user.nivel_permissao;
}

 function logout() {
  sessionStorage.clear();
  window.location.href = "EntrarSistema.html";
}

window.addEventListener("load", checkAuth);