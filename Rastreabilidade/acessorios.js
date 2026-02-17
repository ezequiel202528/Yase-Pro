function openAcessoriosModal() {
        const modal = document.getElementById('modalAcessorios');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    function closeAcessoriosModal() {
        const modal = document.getElementById('modalAcessorios');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }

    function updateCount() {
        const marcados = document.querySelectorAll('#modalAcessorios .check-item:checked').length;
        const badge = document.getElementById('count_acessorios');
        
        if (marcados > 0) {
            badge.innerText = `${marcados} ${marcados === 1 ? 'ITEM' : 'ITENS'}`;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }