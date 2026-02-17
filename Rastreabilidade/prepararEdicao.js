



/**
 * PREPARAR EDIÇÃO: Carrega os dados no formulário
 */
/**
 * RESPONSABILIDADE: Preparar o formulário para edição.
 * - Busca os dados do item no Supabase.
 * - Preenche todos os campos da tela.
 * - Ajusta os botões visuais (Nível e Resultado) para o estado correto.
 */
async function prepararEdicao(id) {
    try {
        // 1. Busca os dados específicos do item
        const { data, error } = await _supabase
            .from("itens_os")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        // 2. Define o ID que estamos editando globalmente
        editandoID = id;

        // 3. Preenche os campos de texto e select
        document.getElementById("fabricante_id").value = data.fabricante_id || "";
        document.getElementById("nr_cilindro").value = data.nr_cilindro || "";
        document.getElementById("ano_fab").value = data.ano_fab || "";
        document.getElementById("ult_reteste").value = data.ult_reteste || "";
        document.getElementById("tipo_carga").value = data.tipo_carga || "";
        document.getElementById("capacidade").value = data.capacidade || "";
        document.getElementById("selo_anterior").value = data.selo_anterior || "";
        document.getElementById("data_selagem").value = data.data_selagem || "";
        document.getElementById("obs_ensaio").value = data.obs_ensaio || "";

        // 4. Ativa o botão de Nível correto usando a função que está no ui-updates.js
        if (data.nivel_manutencao) {
            setLevel(parseInt(data.nivel_manutencao));
        }

        // 5. Ativa o botão de Resultado correto
        if (data.resultado) {
            const btnParaAtivar = Array.from(document.querySelectorAll('#groupResultado .btn-level'))
                .find(btn => btn.innerText.trim() === data.resultado || btn.getAttribute('onclick').includes(data.resultado));
            
            if (btnParaAtivar) {
                setStatus(data.resultado, btnParaAtivar);
            }
        }

        // 6. Altera o visual do botão principal para "SALVAR ALTERAÇÕES"
        const btnRegistro = document.querySelector('button[onclick="registrarItem()"]');
        if (btnRegistro) {
            btnRegistro.innerHTML = '<i class="fa-solid fa-save"></i> SALVAR ALTERAÇÕES';
            btnRegistro.classList.replace("bg-indigo-600", "bg-emerald-500");
        }

        // 7. Sobe a tela para o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Dispara o cálculo de datas para atualizar os displays de validade
        calcularDatasAutomaticas();

    } catch (error) {
        console.error("Erro ao carregar dados para edição:", error);
        alert("Erro ao carregar dados do item.");
    }
}

function formatarDataBR(dataISO) {
  if (!dataISO || dataISO === "-") return "--/--/----";
  // Se a data já estiver no formato BR, retorna ela mesma
  if (dataISO.includes("/")) return dataISO;
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}







