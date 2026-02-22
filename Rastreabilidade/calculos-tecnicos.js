function calcularDatasAutomaticas() {
  const dataSelagem = document.getElementById("data_selagem").value;
  const ultReteste = document.getElementById("ult_reteste").value;

  // Cálculo Próxima Recarga (+1 ano)
  if (dataSelagem) {
    const data = new Date(dataSelagem);
    data.setFullYear(data.getFullYear() + 1);
    const dataFormatada = data.toLocaleDateString("pt-BR");
    const displayRecarga = document.getElementById("display_prox_recarga");
    if (displayRecarga) displayRecarga.innerText = dataFormatada;
  }

  // Cálculo Próximo Reteste (+5 anos)
  if (ultReteste && ultReteste.length === 4) {
    const proxReteste = parseInt(ultReteste) + 5;
    const displayReteste = document.getElementById("display_prox_reteste");
    if (displayReteste) displayReteste.innerText = proxReteste;
  }
}

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

    // Referência dos Checkboxes (Baseado nos textos do seu HTML)
    // Dica: Se puder, adicione IDs neles no HTML para ser mais preciso
    const checkboxes = document.querySelectorAll('.custom-checkbox');
    const getCheck = (texto) => Array.from(checkboxes).find(c => c.nextElementSibling?.textContent.includes(texto));

    const chkPneumMano = getCheck("Ens. Pneum. Manômetro");
    const chkPneumValv = getCheck("Ens. Pneum. Válvula");
    const chkHidroValv = getCheck("Ens. Hidrost. Válvula");
    const chkHidroMang = getCheck("Ens. Hidrost. Mangueira");

    if (valorInformado.length === 4) {
        const anoReteste = parseInt(valorInformado);
        const diferencaAnos = anoAtual - anoReteste;

        // RESET de todos antes de aplicar a regra
        [chkPneumMano, chkPneumValv, chkHidroValv, chkHidroMang].forEach(c => { if(c) c.checked = false; });

        // 1. Nível 3: Ano atual (2026) ou mais de 5 anos de atraso
        if (anoReteste === anoAtual || diferencaAnos >= 5) {
            setLevel(3);
            // Marca Pneumáticos + Hidrostáticos (Igual à Imagem 2)
            if(chkPneumMano) chkPneumMano.checked = true;
            if(chkPneumValv) chkPneumValv.checked = true;
            if(chkHidroValv) chkHidroValv.checked = true;
            if(chkHidroMang) chkHidroMang.checked = true;
        } 
        // 2. Nível 2: Abaixo do atual no prazo de 5 anos (Ex: 2022 a 2025)
        else if (diferencaAnos > 0 && diferencaAnos < 5) {
            setLevel(2);
            // Marca apenas Pneumáticos (Igual à Imagem 1)
            if(chkPneumMano) chkPneumMano.checked = true;
            if(chkPneumValv) chkPneumValv.checked = true;
        }
        // 3. Outros casos -> 1º Nível
        else {
            setLevel(1);
        }
    }
}

// Modifique sua função setLevel para garantir a consistência visual
function setLevel(lvl) {
    selectedLevel = lvl;
    
    // Controle Visual dos Botões
    document.querySelectorAll('[data-level]').forEach((btn) => {
        // Remove classes de ativo
        btn.classList.remove("active", "bg-indigo-600", "text-white");
        // Adiciona classes de inativo
        btn.classList.add("bg-slate-800/40", "text-slate-300");
        
        if (parseInt(btn.dataset.level) === lvl) {
            btn.classList.add("active", "bg-indigo-600", "text-white");
        }
    });

    // Lógica de bloqueio de campos do Teste Hidrostático (Nível 3)
    const grupoHidro = document.querySelector('.ensaios-group-red');
    const camposHidro = ["et_ensaio", "ep_ensaio", "ee_calculado", "ep_porcent_final"];

    if (lvl === 3) {
        if(grupoHidro) grupoHidro.style.opacity = "1";
        camposHidro.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.readOnly = false;
        });
    } else {
        // Níveis 1 e 2 desabilitam os campos de teste hidrostático
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

// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    setLevel(2); // Define Nível 2 como padrão ao abrir
});


