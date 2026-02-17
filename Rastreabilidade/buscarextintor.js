
// Função para abrir o modal
function abrirModalBuscaRapida() {
    const modal = document.getElementById('modalBuscaRapida');
    if (!modal) {
        console.error("Modal não encontrado no HTML");
        return;
    }
    modal.classList.remove('hidden');
    
    // Sincroniza o valor do campo principal para o campo do modal
    const nrPrincipal = document.getElementById('nr_cilindro').value;
    if(nrPrincipal) {
        document.getElementById('inputBuscaGlobal').value = nrPrincipal;
        realizarBuscaRapida();
    }
}

function fecharModalBuscaRapida() {
    document.getElementById('modalBuscaRapida').classList.add('hidden');
}

// Função de Busca no Banco
async function realizarBuscaRapida() {
    const termo = document.getElementById('inputBuscaGlobal').value;
    const container = document.getElementById('resultadoBusca');
    const osAtual = document.getElementById('displayOS').innerText; // Pega a OS que você está trabalhando
    
    if (!termo) return;

    container.classList.remove('hidden');
    container.innerHTML = '<p class="text-[10px] text-slate-400 italic animate-pulse">Varrendo banco de dados...</p>';

    try {
        const { data, error } = await _supabase
            .from('itens_os') 
            .select('*')
            .eq('nr_cilindro', termo)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="text-[10px] text-red-500 font-bold p-3 bg-red-50 rounded-lg text-center">Cilindro nunca registrado no sistema.</p>';
            return;
        }

        const ultimoRegistro = data[0];
        const osDoRegistro = String(ultimoRegistro.os_number);

        // CASO 1: O cilindro já está na OS que você está aberto agora
        if (osDoRegistro === osAtual) {
            fecharModalBuscaRapida();
            destacarLinhaNaTabela(termo);
            return;
        }

        // CASO 2: O cilindro existe, mas em OUTRA OS
        container.innerHTML = `
            <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-3">
                <div class="flex items-center gap-2 text-amber-700 font-black text-[10px] uppercase mb-2">
                    <i class="fa-solid fa-circle-exclamation"></i> Item encontrado em outra OS
                </div>
                <p class="text-slate-600 text-xs mb-3">
                    Este cilindro foi registrado por último na <span class="font-bold text-slate-900 underline">OS: ${osDoRegistro}</span> em ${new Date(ultimoRegistro.created_at).toLocaleDateString()}.
                </p>
                <button onclick='importarDadosHistoricos(${JSON.stringify(ultimoRegistro)})' 
                        class="w-full bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white font-black py-2 rounded-xl text-[10px] uppercase transition-all">
                    <i class="fa-solid fa-download mr-1"></i> Trazer dados para OS Atual
                </button>
            </div>
        `;

    } catch (err) {
        container.innerHTML = `<p class="text-red-500 text-[10px]">Erro na busca: ${err.message}</p>`;
    }
}

// Função para dar destaque visual na tabela principal
function destacarLinhaNaTabela(nrCilindro) {
    // Procura na tabela de itens registrados (tbody #itensList)
    const linhas = document.querySelectorAll('#itensList tr');
    let encontrado = false;

    linhas.forEach(linha => {
        if (linha.innerText.includes(nrCilindro)) {
            encontrado = true;
            linha.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Aplica o sublinhado e destaque visual
            linha.classList.add('bg-indigo-50', 'ring-2', 'ring-indigo-500', 'transition-all', 'duration-500');
            linha.style.textDecoration = "underline";
            linha.style.textDecorationColor = "#6366f1";
            
            // Remove o destaque após 3 segundos
            setTimeout(() => {
                linha.classList.remove('bg-indigo-50', 'ring-2', 'ring-indigo-500');
                linha.style.textDecoration = "none";
            }, 4000);
        }
    });

    if (!encontrado) {
        alert("O item pertence a esta OS, mas não foi localizado na lista visual. Tente recarregar.");
    }
}
// Função para preencher o formulário
function importarDadosHistoricos(dados) {
    // Mapeamento exato das colunas do seu print para os IDs do seu HTML
    if(dados.nr_cilindro) document.getElementById('nr_cilindro').value = dados.nr_cilindro;
    if(dados.ano_fábrica) document.getElementById('ano_fab').value = dados.ano_fábrica;
    if(dados.ult_reteste) document.getElementById('ult_reteste').value = dados.ult_reteste;
    if(dados.tipo_carga)  document.getElementById('tipo_carga').value = dados.tipo_carga;
    if(dados.capacidade)  document.getElementById('capacidade').value = dados.capacidade;
    if(dados.selo_anterior) document.getElementById('selo_anterior').value = dados.selo_anterior;
    if(dados.pallet)        document.getElementById('pallet').value = dados.pallet;
    
    // Chama as funções de cálculo automático do seu sistema
    if(typeof definirNivelPeloReteste === "function") definirNivelPeloReteste();
    if(typeof calcularDatasAutomaticas === "function") calcularDatasAutomaticas();
    
    fecharModalBuscaRapida();
}