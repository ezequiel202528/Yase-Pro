// auth.js – protege apenas páginas que exigem login
(function () {
  // Páginas que são públicas (não exigem login)
  const paginasPublicas = ["/login.html", "/index.html", "/"];

  const caminho = window.location.pathname.toLowerCase();

  // Se a página atual é pública → não bloqueia
  if (paginasPublicas.some((p) => caminho.endsWith(p))) {
    return;
  }

  // Token permanente (login)
  const tokenLocal = localStorage.getItem("token");

  // Token que indica se a aba está ativa
  const tokenSessao = sessionStorage.getItem("session_active");

  // ❌ Se não existir token permanente → login inválido → para login
  if (!tokenLocal) {
    console.warn("Sem token local. Indo para login...");
    window.location.href = "/login.html";
    return;
  }

  // ⚠️ Se ainda NÃO existe token de sessão, mas existe token do login,
  // significa que o usuário FECHOU A ABA.
  if (!tokenSessao) {
    console.warn("Aba nova detectada. Login necessário novamente.");
    window.location.href = "/login.html";
    return;
  }

  // ✔ Se chegou até aqui → página protegida e usuário autenticado
})();
