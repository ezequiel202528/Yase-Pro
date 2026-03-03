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
    // 1. Salva o valor no campo que vai para o banco de dados
    document.getElementById("resultado_valor").value = valor;
    
    // 2. Limpa o estado visual de todos os botões no mesmo grupo
    const botoes = elemento.parentElement.querySelectorAll('div');
    botoes.forEach(btn => {
        btn.classList.add('opacity-40');
        btn.classList.remove('opacity-100', 'ring-2', 'ring-white', 'border-2');
    });

    // 3. Ativa o botão selecionado
    elemento.classList.remove('opacity-40');
    elemento.classList.add('opacity-100', 'border-2', 'border-white'); // Adicionei border-white para destacar
}



// modal de componentes subistituidos!
function abrirModalComponentes() {
    document.getElementById('modalComponentes').classList.remove('hidden');
}

function fecharModalComponentes() {
    document.getElementById('modalComponentes').classList.add('hidden');
    atualizarBadgeComponentes();
}

function atualizarBadgeComponentes() {
    const selecionados = document.querySelectorAll('#container_checks_componentes input[type="checkbox"]:checked').length;
    const badge = document.getElementById('badge-comp');
    if (badge) {
        badge.innerText = selecionados;
        badge.classList.toggle('hidden', selecionados === 0);
    }
}