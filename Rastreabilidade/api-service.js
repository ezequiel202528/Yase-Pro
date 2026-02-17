/**
 * RESPONSABILIDADE: Comunicação com a API (Supabase).
 * - Inicializa o cliente do banco de dados.
 * - Realiza consultas (SELECT) e exclusões (DELETE).
 */

// const SUPABASE_URL = "https://gzojpxgpgjapsegerscb.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Sua chave completa aqui
// const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadItens() {
    try {
        const { data, error } = await _supabase
            .from("itens_os")
            .select("*")
            .eq("os_number", currentOS)
            .order("created_at", { ascending: false });

        if (error) throw error;
        renderItens(data); // Chama a função do renderizarTabela.js
    } catch (error) {
        console.error("Erro ao carregar itens:", error);
    }
}

async function deletarItem(id) {
    try {
        const { error } = await _supabase.from("itens_os").delete().eq("id", id);
        if (error) throw error;
        loadItens();
    } catch (error) {
        alert("Erro ao excluir item.");
    }
}