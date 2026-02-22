/**
 * RESPONSABILIDADE: Gestão da Interface do Usuário (UI).
 */

// No ui-updates.js, atualize a função setLevel
function setLevel(lvl) {
    selectedLevel = lvl;
    
    // 1. Controle Visual: Aplica o fundo azul (indigo) apenas ao nível ativo
    document.querySelectorAll('[data-level]').forEach((btn) => {
        // Remove estado ativo
        btn.classList.remove("bg-indigo-600", "text-white");
        // Aplica estado inativo (escuro)
        btn.classList.add("bg-slate-800/40", "text-slate-300");
        
        if (parseInt(btn.dataset.level) === lvl) {
            btn.classList.add("bg-indigo-600", "text-white");
            btn.classList.remove("bg-slate-800/40", "text-slate-300");
        }
    });

    // 2. Lógica de bloqueio dos campos de Ensaio Hidrostático (Nível 3)
    const camposHidro = ["et_ensaio", "ep_ensaio", "ee_calculado", "ep_porcent_final"];
    const grupoHidro = document.querySelector('.ensaios-group-red');

    if (lvl === 3) {
        if(grupoHidro) grupoHidro.style.opacity = "1";
        camposHidro.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.readOnly = false;
        });
    } else {
        // Níveis 1 e 2 bloqueiam e limpam os campos técnicos de reteste
        if(grupoHidro) grupoHidro.style.opacity = "0.4";
        camposHidro.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.readOnly = true;
                el.value = ""; 
            }
        });
    }
}

// 3. Garantir Nível 2 por padrão ao abrir a tela
window.addEventListener('DOMContentLoaded', () => {
    setLevel(2); 
});

function setStatus(valor, elemento) {
    document.getElementById("resultado_valor").value = valor;
    
    const botoes = elemento.parentElement.querySelectorAll('div');
    botoes.forEach(btn => {
        btn.classList.add('opacity-40');
        btn.classList.remove('opacity-100', 'ring-2', 'ring-white');
    });

    elemento.classList.remove('opacity-40');
    elemento.classList.add('opacity-100', 'ring-2', 'ring-white');
}

function limparFormulario() {
    editandoID = null;

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
    
    document.querySelectorAll('input[type="checkbox"]').forEach(check => {
        check.checked = false;
    });
    
    const badgeFab = document.getElementById("badgeNomeFabricante");
    if(badgeFab) badgeFab.classList.add("hidden");
    
    if(document.getElementById("display_prox_recarga")) document.getElementById("display_prox_recarga").innerText = "--/--/----";
    if(document.getElementById("display_prox_reteste")) document.getElementById("display_prox_reteste").innerText = "----";
    
    // Reset para Nível 2 e Aprovado
    setLevel(2); 
    
    const btnApr = document.querySelector('.bg-emerald-900\\/20');
    if (btnApr) setStatus('APROVADO', btnApr);
    
    const btnRegistro = document.querySelector('button[onclick="registrarItem()"]');
    if (btnRegistro) {
        btnRegistro.innerHTML = '<i class="fa-solid fa-plus-circle"></i> REGISTRAR ITEM';
        btnRegistro.classList.remove("bg-emerald-500");
        btnRegistro.classList.add("bg-indigo-600");
    }

    const campoFoco = document.getElementById("cod_barras");
    if (campoFoco) campoFoco.focus();
}