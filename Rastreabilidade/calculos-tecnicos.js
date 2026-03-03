// Variável global para memorizar o status selecionado nos botões
let statusSelecionadoManual = "APROVADO"; 

function selecionarStatusManual(status) {
    statusSelecionadoManual = status.toUpperCase();
    console.log("Status definido para o próximo registro:", statusSelecionadoManual);
    
    // Feedback visual opcional: destaca o botão clicado
    document.querySelectorAll('.btn-status-selector').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-white', 'border-white');
    });
    // Você pode adicionar uma classe de destaque se seus botões tiverem essa classe
}





// function calcularDatasAutomaticas() {
//   const campoDataSelagem = document.getElementById("data_selagem");
//   const ultReteste = document.getElementById("ult_reteste").value;
//   const displayRecarga = document.getElementById("display_prox_recarga");
//   const displayReteste = document.getElementById("display_prox_reteste");

//   // 1. Cálculo Próxima Recarga
//   let dataReferencia = campoDataSelagem.value ? new Date(campoDataSelagem.value) : new Date();
  
//   if (dataReferencia) {
//     if (campoDataSelagem.value) {
//         dataReferencia.setMinutes(dataReferencia.getMinutes() + dataReferencia.getTimezoneOffset());
//     }
//     const dataProx = new Date(dataReferencia);
//     dataProx.setFullYear(dataProx.getFullYear() + 1);
//     const dataFormatada = dataProx.toLocaleDateString("pt-BR");
//     if (displayRecarga) {
//         displayRecarga.innerText = dataFormatada;
//         // Criamos um atributo de dados para o sistema de salvamento ler depois
//         displayRecarga.dataset.valor = dataFormatada;
//     }
//   }

//   // 2. Cálculo Próximo Reteste (+5 anos)
//   if (ultReteste && ultReteste.length === 4) {
//     const proxRetesteAno = parseInt(ultReteste) + 5;
//     if (displayReteste) {
//         displayReteste.innerText = proxRetesteAno;
//         // IMPORTANTE: Guardamos o valor no dataset para o script de salvamento encontrar
//         displayReteste.dataset.valor = proxRetesteAno;
//     }
//   } else {
//     if (displayReteste) {
//         displayReteste.innerText = "----";
//         displayReteste.dataset.valor = "";
//     }
//   }
// }
// ... (mantenha as funções definirNivelPeloReteste e setLevel)

// Inicialização ao carregar a página


function calcularDatasAutomaticas() {
  const campoDataSelagem = document.getElementById("data_selagem");
  const ultReteste = document.getElementById("ult_reteste").value;
  const displayRecarga = document.getElementById("display_prox_recarga");
  const displayReteste = document.getElementById("display_prox_reteste");

  // 1. Cálculo Próxima Recarga (Mantido como Data)
  let dataReferencia = campoDataSelagem.value ? new Date(campoDataSelagem.value) : new Date();
  
  if (campoDataSelagem.value) {
      dataReferencia.setMinutes(dataReferencia.getMinutes() + dataReferencia.getTimezoneOffset());
  }

  const dataProxRecarga = new Date(dataReferencia);
  dataProxRecarga.setFullYear(dataProxRecarga.getFullYear() + 1);
  
  if (displayRecarga) {
      displayRecarga.innerText = dataProxRecarga.toLocaleDateString("pt-BR");
  }

  // 2. Cálculo Próximo Reteste (Ajustado para INTEIRO +5 anos)
  if (ultReteste && ultReteste.length === 4) {
      const anoBase = parseInt(ultReteste);
      const proximoReteste = anoBase + 5;
      
      if (displayReteste) {
          displayReteste.innerText = proximoReteste; // Exibe ex: 2026
      }
  } else {
      if (displayReteste) displayReteste.innerText = "----";
  }
}




window.addEventListener('DOMContentLoaded', () => {
    setLevel(2); // Define Nível 2 como padrão ao abrir
    
    // Define a data de hoje no input de selagem por padrão (Opcional, mas recomendado)
    const campoDataSelagem = document.getElementById("data_selagem");
    if (campoDataSelagem && !campoDataSelagem.value) {
        campoDataSelagem.value = new Date().toISOString().split('T')[0];
    }
    
    // Chama o cálculo para preencher o "Próxima Recarga" imediatamente
    calcularDatasAutomaticas();
});

/**
 * Define o nível de manutenção dinamicamente com base no ano do último reteste.
 * Regras:
 * - Ano Atual: Nível 3 (Ensaio Hidrostático)
 * - Até 5 anos atrás: Nível 2 (Manutenção de 2º Grau)
 * - Acima de 5 anos: Nível 1 (Inspeção)
 */
function definirNivelPeloReteste() {
    const campoReteste = document.getElementById("ult_reteste");
    const valorInformado = campoReteste.value;
    const anoAtual = new Date().getFullYear(); // 2026

    // 1. Referências dos Checkboxes de Inspeção
    const checkboxes = document.querySelectorAll('.custom-checkbox');
    const getCheck = (texto) => Array.from(checkboxes).find(c => c.nextElementSibling?.textContent.includes(texto));

    const chkPneumMano = getCheck("Ens. Pneum. Manômetro");
    const chkPneumValv = getCheck("Ens. Pneum. Válvula");
    const chkHidroValv = getCheck("Ens. Hidrost. Válvula");
    const chkHidroMang = getCheck("Ens. Hidrost. Mangueira");
    
    // 2. Referência FIXA do Checkbox de Pintura (que agora está na tela principal)
    const chkPintura = document.getElementById('comp_pintura');

    if (valorInformado.length === 4) {
        const anoReteste = parseInt(valorInformado);
        const diferencaAnos = anoAtual - anoReteste;

        // RESET GERAL antes de aplicar a nova regra
        [chkPneumMano, chkPneumValv, chkHidroValv, chkHidroMang, chkPintura].forEach(c => { 
            if(c) c.checked = false; 
        });

        // REGRA NÍVEL 3: Ano atual (2026) ou mais de 5 anos de atraso
        if (anoReteste === anoAtual || diferencaAnos >= 5) {
            setLevel(3);
            
            // Marca Inspeções
            if(chkPneumMano) chkPneumMano.checked = true;
            if(chkPneumValv) chkPneumValv.checked = true;
            if(chkHidroValv) chkHidroValv.checked = true;
            if(chkHidroMang) chkHidroMang.checked = true;
            
            // MARCA PINTURA AUTOMATICAMENTE
            if(chkPintura) chkPintura.checked = true; 
        } 
        
        // REGRA NÍVEL 2: Entre 1 e 4 anos de diferença
        else if (diferencaAnos > 0 && diferencaAnos < 5) {
            setLevel(2);
            if(chkPneumMano) chkPneumMano.checked = true;
            if(chkPneumValv) chkPneumValv.checked = true;
        }
        
        // REGRA NÍVEL 1
        else {
            setLevel(1);
        }
    }
}
// Função setLevel atualizada com automação de Pintura e Badge
function setLevel(lvl) {
    selectedLevel = lvl; // Variável global
    
    // Atualiza visual dos botões NV1, NV2, NV3
    document.querySelectorAll('[data-level]').forEach((btn) => {
        btn.classList.remove("active", "bg-indigo-600", "text-white");
        if (parseInt(btn.dataset.level) === lvl) {
            btn.classList.add("active", "bg-indigo-600", "text-white");
        }
    });

    // --- LÓGICA DA PINTURA AUTOMÁTICA ---
    const checkPintura = document.getElementById('comp_pintura');
    if (checkPintura) {
        // Se for nível 3, marca. Se não, desmarca.
        checkPintura.checked = (lvl === 3);
    }

    // Lógica do Teste Hidrostático (Habilitar/Desabilitar campos)
    const grupoHidro = document.querySelector('.ensaios-group-red');
    if (lvl === 3) {
        if(grupoHidro) grupoHidro.style.opacity = "1";
        // ... habilita campos de ensaio
    } else {
        if(grupoHidro) grupoHidro.style.opacity = "0.4";
        // ... limpa e desabilita campos de ensaio
    }
}
// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    setLevel(2); // Define Nível 2 como padrão ao abrir
});


function atualizarBadgeComponentes() {
    // Conta quantos checkboxes estão marcados dentro do modal
    const totalMarcados = document.querySelectorAll('#container_checks_componentes input[type=\"checkbox\"]:checked').length;
    const badge = document.getElementById('badge-comp');
    
    if (badge) {
        badge.innerText = totalMarcados;
        if (totalMarcados > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}