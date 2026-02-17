import { supabase } from './BancoDeDados.js';

const form = document.getElementById('cadastroForm');
const statusMsg = document.getElementById('status-message');
const btnSubmit = document.getElementById('btnSubmit');

function showMessage(text, type) {
    statusMsg.innerText = text;
    statusMsg.classList.remove('hidden', 'bg-red-500/20', 'text-red-400', 'bg-green-500/20', 'text-green-400');
    
    if (type === 'error') {
        statusMsg.classList.add('bg-red-500/20', 'text-red-400');
    } else {
        statusMsg.classList.add('bg-green-500/20', 'text-green-400');
    }
    statusMsg.classList.remove('hidden');
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const codigo = document.getElementById('codigo').value;
        const senha = document.getElementById('senha').value;
        const confirmar = document.getElementById('confirmar_senha').value;
        const nivel = document.getElementById('nivel').value;

        if (senha !== confirmar) {
            showMessage('As senhas não coincidem!', 'error');
            return;
        }

        btnSubmit.disabled = true;
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<span>PROCESSANDO...</span> <i class="fa-solid fa-circle-notch animate-spin"></i>';

        try {
            const { data, error } = await supabase
                .from('usuarios')
                .insert([
                    { 
                        nome: nome, 
                        codigo_operador: codigo, 
                        senha: senha, 
                        nivel: nivel,
                        criado_em: new Date().toISOString()
                    }
                ]);

            if (error) throw error;

            showMessage('Usuário cadastrado com sucesso!', 'success');
            form.reset();
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error('Erro:', error.message);
            showMessage('Erro ao salvar: ' + error.message, 'error');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalText;
        }
    });
}