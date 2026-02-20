// Função para alternar entre Dark e Light Mode
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    
    // Salva a preferência para não perder ao atualizar a página
    const isLight = body.classList.contains('light-mode');
    localStorage.setItem('yase_theme', isLight ? 'light' : 'dark');
    
    console.log("Tema alterado para:", isLight ? "Light" : "Dark");
}

// Executa ao carregar para manter o tema salvo
(function() {
    const savedTheme = localStorage.getItem('yase_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
})();