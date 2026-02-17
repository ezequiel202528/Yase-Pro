function openAcessoriosModal() {
    document.getElementById('modalAcessorios').classList.remove('hidden');
}

function closeAcessoriosModal() {
    document.getElementById('modalAcessorios').classList.add('hidden');
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('modalAcessorios');
    if (event.target == modal) {
        closeAcessoriosModal();
    }
}