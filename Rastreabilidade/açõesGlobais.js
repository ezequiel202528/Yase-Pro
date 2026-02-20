/**
 * Alterna a visibilidade do painel superior (Top Drawer)
 * Controla altura, bordas e animação do ícone.
 */
function toggleTopDrawer() {
    const drawer = document.getElementById('topDrawer');
    const icon = document.getElementById('drawerIcon');
    const text = document.getElementById('drawerBtnText');

    // Verifica se está fechado (maxHeight 0 ou vazio)
    if (drawer.style.maxHeight === "0px" || drawer.style.maxHeight === "") {
        // Abrir
        drawer.style.maxHeight = "600px";
        drawer.style.borderBottomWidth = "1px";
        drawer.style.borderBottomColor = "rgba(245, 158, 11, 0.3)";
        icon.style.transform = "rotate(180deg)";
        text.innerText = "Fechar Painel";
        text.style.color = "#f59e0b";
    } else {
        // Fechar
        drawer.style.maxHeight = "0px";
        drawer.style.borderBottomWidth = "0px";
        drawer.style.borderBottomColor = "transparent";
        icon.style.transform = "rotate(0deg)";
        text.innerText = "Opções Extras";
        text.style.color = "";
    }
}