/**
 * RESPONSABILIDADE: Gestão da Interface do Usuário (UI).
 * - Controla estados visuais de botões e limpeza do formulário.
 * - Gerencia modais de confirmação universais e automação de níveis.
 */

function setLevel(lvl) {
    selectedLevel = lvl;
    
    // 1. Controle Visual dos Botões de Nível
    document.querySelectorAll('[data-level]').forEach((btn) => {
        btn.classList.remove("active", "bg-indigo-600", "text-white");
        btn.classList.add("bg-slate-800/40", "text-slate-300");
        
        if (parseInt(btn.dataset.level) === lvl) {
            btn.classList.add("active", "bg-indigo-600", "text-white");
        }
    });

    // 2. Automação de Checklist de Inspeção e Ensaio
    const checkboxes = document.querySelectorAll('.custom-checkbox');
    // Mapeamento conforme a ordem do seu HTML
    const ensPneumManometro   = checkboxes[0];
    const ensPneumValvula     = checkboxes[1];
    const regValvulaAlivio    = checkboxes[2];
    const ensCondEletrica     = checkboxes[3];
    const ensHidrostValvula   = checkboxes[4];
    const ensHidrostMangueira = checkboxes[5];

    // Lógica Dinâmica baseada no Nível selecionado
    if (lvl === 2) {
        // Nível 2: Apenas inspeção pneumática
        if(ensPneumManometro)   ensPneumManometro.checked = true;
        if(ensPneumValvula)     ensPneumValvula.checked = true;
        
        // Desmarca ensaios hidrostáticos obrigatoriamente
        if(ensHidrostValvula)   ensHidrostValvula.checked = false;
        if(ensHidrostMangueira) ensHidrostMangueira.checked = false;
        
        // Esmaecer visualmente o grupo de ensaios hidrostáticos
        const grupoHidro = document.querySelector('.ensaios-group-red');
        if(grupoHidro) grupoHidro.style.opacity = "0.5";
    } 
    else if (lvl === 3) {
        // Nível 3: Habilita Pneumáticos + Hidrostáticos
        if(ensPneumManometro)   ensPneumManometro.checked = true;
        if(ensPneumValvula)     ensPneumValvula.checked = true;
        if(ensHidrostValvula)   ensHidrostValvula.checked = true;
        if(ensHidrostMangueira) ensHidrostMangueira.checked = true;
        
        // Automação: Marca "Pintura" em acessórios (conforme imagem de Nível 3)
        const checkPintura = document.querySelector('input[type="checkbox"][id*="Pintura"]');
        if(checkPintura) checkPintura.checked = true;

        const grupoHidro = document.querySelector('.ensaios-group-red');
        if(grupoHidro) grupoHidro.style.opacity = "1";
    }
}

function setStatus(valor, elemento) {
    document.getElementById("resultado_valor").value = valor;
    
    // Reset visual dos botões de status
    const botoes = elemento.parentElement.querySelectorAll('div');
    botoes.forEach(btn => {
        btn.classList.add('opacity-40');
        btn.classList.remove('opacity-100', 'ring-2', 'ring-white');
    });

    // Ativa o clicado
    elemento.classList.remove('opacity-40');
    elemento.classList.add('opacity-100', 'ring-2', 'ring-white');
}

function limparFormulario() {
    // 1. Resetar o estado de edição
    editandoID = null;

    // 2. Limpeza abrangente de campos (Texto, Números e Selects)
    const campos = [
        "cod_barras", "fabricante_id", "nr_cilindro", "ano_fab", "ult_reteste", 
        "selo_anterior", "obs_ensaio", "tipo_carga", "capacidade", "nbr_id",
        "lote_nitrogenio", "ampola_vinculada", "pallet", "deposito_galpao", "local_extintor",
        "p_vazio_valvula", "p_cheio_valvula", "p_atual", "porcent_dif",
        "tara_cilindro", "p_cil_vazio_kg", "perda_massa_porcent",
        "vol_litros", "dvm_et", "dvp_ep", "ee_resultado",
        "et_ensaio", "ep_ensaio", "ee_calculado", "ep_porcent_final"
    ];

    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    
    // 3. Resetar todos os checkboxes (Inspeção e Componentes)
    document.querySelectorAll('input[type="checkbox"]').forEach(check => {
        check.checked = false;
    });
    
    // 4. Limpar displays de texto e labels
    const badgeFab = document.getElementById("badgeNomeFabricante");
    if(badgeFab) badgeFab.classList.add("hidden");
    
    if(document.getElementById("display_prox_recarga")) document.getElementById("display_prox_recarga").innerText = "--/--/----";
    if(document.getElementById("display_prox_reteste")) document.getElementById("display_prox_reteste").innerText = "----";
    
    // 5. Resetar componentes visuais para o padrão (Nível 2 e Status Aprovado)
    if (typeof setLevel === "function") setLevel(2); 
    
    const btnApr = document.querySelector('.bg-emerald-900\\/20'); // Seleciona o botão APR via classe
    if (btnApr) setStatus('APROVADO', btnApr);
    
    // 6. Restaurar o botão de Registro (caso tenha vindo de uma edição)
    const btnRegistro = document.querySelector('button[onclick="registrarItem()"]');
    if (btnRegistro) {
        btnRegistro.innerHTML = '<i class="fa-solid fa-plus-circle"></i> REGISTRAR ITEM';
        btnRegistro.classList.remove("bg-emerald-500");
        btnRegistro.classList.add("bg-indigo-600");
    }

    // 7. Foco automático para produtividade
    const campoFoco = document.getElementById("cod_barras");
    if (campoFoco) campoFoco.focus();
}