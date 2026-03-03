/**
 * RASTREABILIDADE - YA SE PRO
 * atualizarSelo.js: Lógica Corrigida para Selo Sequencial
 */

async function monitorarLoteAtivo() {
    try {
        // 1. Busca o lote que está com status 'ABERTO'
        const { data: lote, error: errorLote } = await _supabase
            .from('rem_essas')
            .select('*')
            .eq('status_lote', 'ABERTO')
            .maybeSingle();

        if (errorLote || !lote) {
            document.getElementById('lote_documento').innerText = "SEM LOTE ATIVO";
            document.getElementById('proximo_selo_num').innerText = "---";
            document.getElementById('qtd_restante_texto').innerText = "---";
            return;
        }

        // 2. Conta quantos itens já foram registrados dentro do intervalo deste lote
        // Dentro da função monitorarLoteAtivo, substitua a parte da contagem (Passo 2) por esta:
const { count: usados, error: errCount } = await _supabase
    .from('itens_os')
    .select('*', { count: 'exact', head: true })
    .gte('selo_inmetro', lote.selo_inicio)
    .lte('selo_inmetro', lote.selo_fim);

// Adicione um console.log para debugar no navegador (F12)
console.log("Selos encontrados no banco para este lote:", usados);

        const quantidadeUsada = usados || 0;
        const totalLote = parseInt(lote.qtd_selos);
        
        // --- LÓGICA CORRIGIDA ---
        // O próximo selo é o inicial do lote + quantos já usamos
        const proximoSelo = parseInt(lote.selo_inicio) + quantidadeUsada;
        const restante = totalLote - quantidadeUsada;
        const porcentagem = (quantidadeUsada / totalLote) * 100;

        // 3. ATUALIZAÇÃO DA INTERFACE
        document.getElementById('lote_documento').innerText = `LOTENF: ${lote.documento || 'S/N'}`;
        
        // Agora exibe o PRÓXIMO selo a ser usado, não o final
        document.getElementById('proximo_selo_num').innerText = proximoSelo;
        
        // Exibe quanto ainda resta
        document.getElementById('qtd_restante_texto').innerText = `${restante}`;

        // Barra de progresso
        const barra = document.getElementById('barra_progresso_selo');
        if (barra) {
            barra.style.width = `${porcentagem}%`;
        }

        // Retornamos o número para caso a função registrarItem precise capturá-lo
        return proximoSelo;

    } catch (err) {
        console.error("Erro ao monitorar lote:", err);
    }
}

document.addEventListener('DOMContentLoaded', monitorarLoteAtivo);


