/**
 * RESPONSABILIDADE: Gestão da Interface do Usuário (UI).
 * - Controla estados visuais de botões e limpeza do formulário.
 * - Gerencia modais de confirmação universais.
 */

function setLevel(lvl) {
    selectedLevel = lvl;
    document.querySelectorAll('[data-level]').forEach((btn) => {
        btn.classList.remove("active");
        if (parseInt(btn.dataset.level) === lvl) btn.classList.add("active");
    });
}

function setStatus(valor, elemento) {
    document.querySelectorAll('#groupResultado .btn-level').forEach(btn => {
        btn.classList.remove('active');
    });
    elemento.classList.add('active');
    document.getElementById('resultado_valor').value = valor;
}

function limparFormulario() {
    // 1. Resetar o estado de edição
    editandoID = null;

    // 2. Lista expandida de campos para limpar (incluindo os novos que vimos no seu HTML)
    const campos = [
        "cod_barras", 
        "fabricante_id", 
        "nr_cilindro", 
        "ano_fab", 
        "ult_reteste", 
        "selo_anterior", 
        "obs_ensaio", 
        "tipo_carga", 
        "capacidade", 
        "nbr_id",
        "lote_nitrogenio",
        "ampola_vinculada",
        "pallet",
        "deposito_galpao",
        "local_extintor"
    ];

    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    
    // 3. Limpar displays de texto e labels
    document.getElementById("nomeFabricanteDisplay").innerText = "";
    document.getElementById("display_prox_recarga").innerText = "--/--/----";
    document.getElementById("display_prox_reteste").innerText = "----";
    
    // 4. Resetar componentes visuais (Nível e Status)
    if (typeof setLevel === "function") setLevel(1);
    if (typeof setStatus === "function") {
        const btnApr = document.querySelector('.btn-status-apr');
        setStatus('APROVADO', btnApr);
    }
    
    // 5. Restaurar o botão de Registro (caso tenha vindo de uma edição)
    const btnRegistro = document.querySelector('button[onclick="registrarItem()"]');
    if (btnRegistro) {
        btnRegistro.innerHTML = '<i class="fa-solid fa-plus-circle"></i> REGISTRAR ITEM';
        btnRegistro.classList.remove("bg-emerald-500");
        btnRegistro.classList.add("bg-indigo-600");
    }

    // 6. FOCO AUTOMÁTICO (O mais importante para agilidade)
    const campoFoco = document.getElementById("cod_barras");
    if (campoFoco) campoFoco.focus();
}

function solicitarConfirmacao({ titulo, mensagem, corBtn, textoBtn, icone, callback }) {
    const modal = document.getElementById('modalConfirmacao');
    const btn = document.getElementById('btnConfirmarAcaoGeral');
    
    document.getElementById('confirmTitle').innerText = titulo || "Tem certeza?";
    document.getElementById('confirmMessage').innerHTML = mensagem || "Esta ação é permanente.";
    document.getElementById('confirmIcon').className = `fa-solid ${icone || 'fa-trash-can'} text-3xl`;
    
    btn.className = `flex-[1.5] text-white font-bold py-4 rounded-2xl text-xs uppercase shadow-lg transition-all ${corBtn || 'bg-red-500'}`;
    btn.innerText = textoBtn || "Confirmar";

    modal.classList.remove('hidden');
    btn.onclick = async () => {
        btn.disabled = true;
        await callback();
        btn.disabled = false;
        fecharConfirmacao();
    };
}

function fecharConfirmacao() {
    document.getElementById('modalConfirmacao').classList.add('hidden');
}