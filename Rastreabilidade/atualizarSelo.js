/**
 * RASTREABILIDADE - YA SE PRO
 * atualizarSelo.js: Campo Amarelo Estático (Final do Lote) e Disponibilidade Regressiva
 */

async function monitorarLoteAtivo() {
    try {
        // 1. Busca o lote que está com status 'ABERTO'
        const { data: lote, error: errorLote } = await _supabase
            .from('rem_essas')
            .select('*')
            .eq('status_lote', 'ABERTO')
            .limit(1)
            .single();

        if (errorLote || !lote) {
            document.getElementById('lote_documento').innerText = "SEM LOTE ATIVO";
            document.getElementById('proximo_selo_num').innerText = "---";
            document.getElementById('qtd_restante_texto').innerText = "---";
            return;
        }

        // 2. Conta quantos selos deste lote já foram usados no banco de dados
        const { count: usados } = await _supabase
            .from('itens_os')
            .select('*', { count: 'exact', head: true })
            .gte('selo_inmetro', lote.selo_inicio)
            .lte('selo_inmetro', lote.selo_fim);

        // 3. Cálculos de Interface
        const totalLote = parseInt(lote.qtd_selos);
        const quantidadeUsada = usados || 0;
        const restante = totalLote - quantidadeUsada; // Lógica regressiva correta
        const porcentagem = (quantidadeUsada / totalLote) * 100;

        // 4. ATUALIZAÇÃO DA INTERFACE
        
        // Texto do Lote/NF
        document.getElementById('lote_documento').innerText = `LOTENF: ${lote.documento || 'S/N'}`;
        
        // CAMPO AMARELO: Agora fica ESTÁTICO exibindo o número final do lote
        document.getElementById('proximo_selo_num').innerText = lote.selo_fim;
        
        // TEXTO DISPONIBILIDADE: Exibe quanto ainda resta (ex: 9999)
        document.getElementById('qtd_restante_texto').innerText = `${restante}`;

        // Barra de progresso visual
        const barra = document.getElementById('barra_progresso_selo');
        if (barra) {
            barra.style.width = `${porcentagem}%`;
        }

    } catch (err) {
        console.error("Erro ao monitorar lote:", err);
    }
}

// Inicia ao carregar a página
document.addEventListener('DOMContentLoaded', monitorarLoteAtivo);