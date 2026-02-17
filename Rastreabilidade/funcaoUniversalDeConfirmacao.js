// FUNÇÃO UNIVERSAL DE CONFIRMAÇÃO
function solicitarConfirmacao({ titulo, mensagem, corBtn, textoBtn, icone, callback }) {
    const modal = document.getElementById('modalConfirmacao');
    const btn = document.getElementById('btnConfirmarAcaoGeral');
    
    // Personaliza os textos e cores
    document.getElementById('confirmTitle').innerText = titulo || "Tem certeza?";
    document.getElementById('confirmMessage').innerHTML = mensagem || "Esta ação é permanente.";
    document.getElementById('confirmIcon').className = `fa-solid ${icone || 'fa-trash-can'} text-3xl`;
    
    // Ajusta a cor do botão (Ex: red-500 para excluir, indigo-600 para salvar)
    btn.className = `flex-[1.5] text-white font-bold py-4 rounded-2xl text-xs uppercase shadow-lg transition-all ${corBtn || 'bg-red-500 hover:bg-red-600 shadow-red-200'}`;
    btn.innerText = textoBtn || "Confirmar";

    modal.classList.remove('hidden');

    // Define o que acontece no clique
    btn.onclick = async () => {
        btn.disabled = true;
        const originalText = btn.innerText;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Processando...';
        
        await callback(); // Executa a função que você passou
        
        btn.disabled = false;
        btn.innerText = originalText;
        fecharConfirmacao();
    };
}

function fecharConfirmacao() {
    document.getElementById('modalConfirmacao').classList.add('hidden');
}
