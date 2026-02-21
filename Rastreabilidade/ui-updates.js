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

/**
 * Atualiza o Widget de Selos na tela de Rastreio
 */
async function atualizarWidgetSelo() {
    try {
        // 1. Busca o lote mais antigo que ainda esteja ABERTO (FIFO - First In, First Out)
        const { data: lote, error } = await _supabase
            .from('rem_essas')
            .select('*')
            .eq('status_lote', 'ABERTO')
            .order('selo_inicio', { ascending: true })
            .limit(1)
            .single();

        const container = document.getElementById('status-selo-container');

        if (error || !lote) {
            container.classList.add('hidden');
            return;
        }

        // 2. Conta quantos selos deste lote já foram usados na tabela itens_os
        const { count: usados } = await _supabase
            .from('itens_os')
            .select('*', { count: 'exact', head: true })
            .gte('selo_inmetro', lote.selo_inicio)
            .lte('selo_inmetro', lote.selo_fim);

        // 3. Cálculos
        const restante = lote.qtd_selos - usados;
        const proximoSelo = lote.selo_inicio + usados;
        const porcentagem = (restante / lote.qtd_selos) * 100;

        // 4. Atualiza a Interface
        container.classList.remove('hidden');
        document.getElementById('lote_documento').innerText = lote.documento || `Lote ${lote.selo_inicio}`;
        document.getElementById('proximo_selo_num').innerText = proximoSelo;
        document.getElementById('qtd_restante_texto').innerText = `${restante} / ${lote.qtd_selos}`;
        
        const barra = document.getElementById('barra_progresso_selo');
        barra.style.width = `${porcentagem}%`;

        // Muda a cor da barra se estiver acabando (menos de 10%)
        if (porcentagem < 10) {
            barra.classList.replace('bg-emerald-500', 'bg-red-500');
        } else {
            barra.classList.replace('bg-red-500', 'bg-emerald-500');
        }

        // AUTO-PREENCHIMENTO: Se o campo de selo estiver vazio, sugere o próximo
        const inputSelo = document.getElementById('selo_inmetro');
        if (inputSelo && !inputSelo.value) {
            inputSelo.placeholder = `Sugestão: ${proximoSelo}`;
        }

    } catch (err) {
        console.error("Erro ao atualizar widget de selos:", err);
    }
}

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', atualizarWidgetSelo);