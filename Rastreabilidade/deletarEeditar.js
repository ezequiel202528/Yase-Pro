async function deletarItem(id) {
    solicitarConfirmacao({
        titulo: "Excluir Registro",
        mensagem: "Tem certeza que deseja remover este item da Ordem de Serviço? Esta ação não pode ser desfeita.",
        icone: "fa-fire-extinguisher", 
        corBtn: "bg-red-500 hover:bg-red-600 shadow-red-200",
        textoBtn: "Sim, Excluir",
        callback: async () => {
            try {
                const { error } = await _supabase.from("itens_os").delete().eq("id", id);
                if (error) throw error;
                await loadItens(); // Recarrega a tabela principal
            } catch (error) {
                alert("Erro ao excluir o item.");
                console.error(error);
            }
        }
    });
}
