// ==========================================
// CONTROLE DE MODO (BALCÃO / DEMANDA) E MODAL
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Controle de Abertura e Fechamento do Modal de Configurações
    const btnAbrir = document.getElementById('btnConfigRegistro');
    const modal = document.getElementById('modalConfiguracoes');
    const btnFechar = document.getElementById('fecharModalConfigBtn');
    const btnConcluir = document.getElementById('concluirModalConfigBtn');

    if (btnAbrir && modal) {
        btnAbrir.addEventListener('click', () => {
            console.log("Clique capturado com sucesso! Abrindo modal e sincronizando estados...");
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Sincroniza o switch e os textos na hora exata que abre o modal
            atualizarIndicadorModo();
        });
    } else {
        console.error("Aviso: Botão #btnConfigRegistro ou Modal #modalConfiguracoes não encontrados neste DOM.");
    }

    const fecharModal = () => {
        if (modal) {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }
    };

    if (btnFechar) btnFechar.addEventListener('click', fecharModal);
    if (btnConcluir) btnConcluir.addEventListener('click', fecharModal);

    // Fechar clicando fora do modal (no fundo escuro)
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) fecharModal();
        });
    }

    // 2. Inicialização dos estados ao carregar a página
    atualizarIndicadorModo();
});


// 3. Função Inteligente de Atualização e Sincronização Estrita dos Modos
async function atualizarIndicadorModo() {
    const isBalcao = localStorage.getItem('modo_balcao_ativo') === 'true';
    const activeCargaId = localStorage.getItem('active_carga_id');
    const nfAtiva = localStorage.getItem('active_nf');

    // Elementos da UI
    const badgeDiv = document.getElementById('badgeModoAtivo');
    const textoModo = document.getElementById('textoModoAtivo');
    const modalInfoDemanda = document.getElementById('modalInfoDemanda');
    const switchBalcao = document.getElementById('switchModoBalcao');
    const switchDemanda = document.getElementById('switchModoDemanda');
    const cardBalcao = document.getElementById('cardBalcaoContainer');
    const cardDemanda = document.getElementById('cardDemandaContainer');

    // 🔒 GARANTE RIGOROSAMENTE A EXCLUSIVIDADE VISUAL DOS SWITCHES
    if (switchBalcao) switchBalcao.checked = isBalcao;
    if (switchDemanda) switchDemanda.checked = !isBalcao; // Se balcão é true, demanda é false (e vice-versa)

    // Estilização visual em tempo real dos cards no modal
    if (cardBalcao && cardDemanda) {
        if (isBalcao) {
            cardBalcao.className = "p-6 bg-amber-950/20 border-2 border-amber-500/60 rounded-3xl flex items-center justify-between shadow-lg transition-all";
            cardDemanda.className = "p-6 bg-slate-800/30 border-2 border-slate-800/50 opacity-60 rounded-3xl flex items-center justify-between shadow-md transition-all";
        } else {
            cardBalcao.className = "p-6 bg-slate-800/30 border-2 border-slate-800/50 opacity-60 rounded-3xl flex items-center justify-between shadow-md transition-all";
            cardDemanda.className = "p-6 bg-indigo-950/25 border-2 border-indigo-500/60 rounded-3xl flex items-center justify-between shadow-lg transition-all";
        }
    }

    // Atualiza o Card da Barra Lateral
    if (badgeDiv && textoModo) {
        if (isBalcao) {
            textoModo.innerText = "Modo Balcão";
            badgeDiv.className = "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm animate-pulse";
            if (badgeDiv.querySelector('i')) badgeDiv.querySelector('i').className = "fa-solid fa-store text-[9px]";
        } else if (activeCargaId) {
            textoModo.innerText = "Modo Demanda";
            badgeDiv.className = "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm";
            if (badgeDiv.querySelector('i')) badgeDiv.querySelector('i').className = "fa-solid fa-box text-[9px]";
        } else {
            textoModo.innerText = "Sem Vínculo";
            badgeDiv.className = "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5 shadow-sm";
            if (badgeDiv.querySelector('i')) badgeDiv.querySelector('i').className = "fa-solid fa-triangle-exclamation text-[9px]";
        }
    }

    // Atualiza o texto descritivo do Card de Demanda
    if (modalInfoDemanda) {
        if (activeCargaId) {
            modalInfoDemanda.innerHTML = `
                <div class="text-indigo-300 font-bold text-xs mb-1">📦 Carga Vinculada (NF: ${nfAtiva || '---'})</div>
                <div class="text-slate-300 text-xs">Os lançamentos abatem diretamente o espelho de produção da demanda ativa.</div>
            `;
        } else {
            modalInfoDemanda.innerHTML = `
                <div class="text-slate-300 font-bold text-xs mb-1">Nenhuma carga vinculada</div>
                <div class="text-slate-400 text-xs">Vincule uma carga pelo painel de ordens de serviço para operar neste modo.</div>
            `;
        }
    }
}


// 4. Controle de Exclusividade Mútua em Tempo Real (Efeito Gangorra)
function selecionarModoRegistro(modo, ativar) {
    const switchBalcao = document.getElementById('switchModoBalcao');
    const switchDemanda = document.getElementById('switchModoDemanda');

    if (modo === 'balcao') {
        if (ativar) {
            // Ligou o Balcão -> Força a Demanda a desligar visualmente e no storage
            localStorage.setItem('modo_balcao_ativo', 'true');
            if (switchBalcao) switchBalcao.checked = true;
            if (switchDemanda) switchDemanda.checked = false;
            console.log("🛒 Modo Balcão ATIVADO. Modo Demanda puxado para desligado.");
        } else {
            // Se tentou desligar o balcão manualmente, força a demanda a ligar (nunca ficam os dois desligados)
            localStorage.removeItem('modo_balcao_ativo');
            if (switchBalcao) switchBalcao.checked = false;
            if (switchDemanda) switchDemanda.checked = true;
            console.log("🔒 Modo Balcão DESATIVADO. Retornando para Modo Demanda.");
        }
    } else if (modo === 'demanda') {
        if (ativar) {
            // Ligou a Demanda -> Força o Balcão a desligar visualmente e no storage
            localStorage.removeItem('modo_balcao_ativo');
            if (switchBalcao) switchBalcao.checked = false;
            if (switchDemanda) switchDemanda.checked = true;
            console.log("📦 Modo Demanda ATIVADO. Modo Balcão puxado para desligado.");
        } else {
            // Se tentou desligar a demanda manualmente, força o balcão a ligar
            localStorage.setItem('modo_balcao_ativo', 'true');
            if (switchBalcao) switchBalcao.checked = true;
            if (switchDemanda) switchDemanda.checked = false;
            console.log("🛒 Modo Demanda DESATIVADO. Alternado para Modo Balcão.");
        }
    }

    if (typeof renderizarCardDemandaAtivaAside === "function") {
        renderizarCardDemandaAtivaAside();
    }
    
    // Atualiza a tela, os textos e as cores dos cards em tempo real
    atualizarIndicadorModo();
}

window.selecionarModoRegistro = selecionarModoRegistro;

// 4. Controle Único do Switch de Modo Balcão (Persistente)
function toggleModoBalcao(checkbox) {
    if (checkbox.checked) {
        localStorage.setItem('modo_balcao_ativo', 'true');
        console.log("🛒 Modo Balcão ATIVADO.");
    } else {
        localStorage.removeItem('modo_balcao_ativo');
        console.log("🔒 Modo Balcão DESATIVADO.");
    }
    
    if (typeof renderizarCardDemandaAtivaAside === "function") {
        renderizarCardDemandaAtivaAside();
    }
    atualizarIndicadorModo();
}


// 5. EXPORTAÇÕES GLOBAIS
window.toggleModoBalcao = toggleModoBalcao;
window.atualizarIndicadorModo = atualizarIndicadorModo;


// 6. Função para alternar entre as abas do modal de configurações
function mudarAbaModal(aba) {
    const abaModo = document.getElementById('abaConteudoModo');
    const abaGeral = document.getElementById('abaConteudoGeral');
    const btnModo = document.getElementById('tabBtnModo');
    const btnGeral = document.getElementById('tabBtnGeral');

    if (aba === 'modo') {
        abaModo.classList.remove('hidden');
        abaGeral.classList.add('hidden');

        btnModo.className = "px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl border-t border-x border-amber-500/40 bg-slate-900 text-amber-400 transition-all flex items-center gap-2";
        btnGeral.className = "px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl border-t border-x border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all flex items-center gap-2";
    } else if (aba === 'geral') {
        abaGeral.classList.remove('hidden');
        abaModo.classList.add('hidden');

        btnGeral.className = "px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl border-t border-x border-amber-500/40 bg-slate-900 text-amber-400 transition-all flex items-center gap-2";
        btnModo.className = "px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl border-t border-x border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all flex items-center gap-2";
    }
}

window.mudarAbaModal = mudarAbaModal;