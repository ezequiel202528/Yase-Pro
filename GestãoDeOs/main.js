// 1. Configuração e Inicialização
      const SUPABASE_URL = 'https://gzojpxgpgjapsegerscb.supabase.co'; 
      const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s'; 
      
      const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

      // 2. Funções de Carregamento
      async function fetchOrders() {
        try {
          const { data, error } = await _supabase
            .from('ordens_servico')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          renderOrders(data);
        } catch (error) {
          console.error("Erro Supabase:", error);
          let msg = "Erro ao carregar dados.";
          if (error.code === '42P01') msg = "Tabela 'ordens_servico' não encontrada.";
          if (error.message.includes('policy')) msg = "Erro de Permissão (RLS). Verifique as políticas no Supabase.";
          
          document.getElementById('osList').innerHTML = `
            <tr><td colspan="5" class="p-8 text-center text-red-500 font-bold">${msg}</td></tr>
          `;
        }
      }

      function renderOrders(orders) {
        const list = document.getElementById('osList');
        if (!orders || orders.length === 0) {
          list.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-400">Nenhuma OS encontrada.</td></tr>`;
          return;
        }

        list.innerHTML = orders.map(order => `
          <tr class="border-b hover:bg-slate-50 transition-colors">
            <td class="p-4 text-indigo-600 font-black">${order.os_number}</td>
            <td class="p-4 font-semibold text-slate-600">${order.cliente_nome || '-'}</td>
            <td class="p-4 text-xs">${order.data_abertura ? new Date(order.data_abertura).toLocaleDateString('pt-BR') : '-'}</td>
            <td class="p-4 text-xs text-amber-600 font-bold">${order.previsao_entrega ? new Date(order.previsao_entrega).toLocaleDateString('pt-BR') : '-'}</td>
            <td class="p-4 text-right">
              <button onclick="abrirOS('${order.os_number}')" class="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold uppercase text-[10px] hover:bg-indigo-600 hover:text-white transition-all">
                Acessar <i class="fa-solid fa-chevron-right ml-1"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }

      function abrirOS(osNumber) {
        sessionStorage.setItem('currentOS', osNumber);
        // Garante que o redirecionamento funcione mesmo se o arquivo estiver na mesma pasta
        window.location.href = `Rastreio_Full.html?os=${encodeURIComponent(osNumber)}`;
      }

      // 3. Funções do Modal e Formulário
      function openModal() {
        document.getElementById('modalOS').classList.add('active');
        document.getElementById('new_data_abertura').value = new Date().toISOString().split('T')[0];
      }

      function closeModal() {
        document.getElementById('modalOS').classList.remove('active');
        document.getElementById('formNovaOS').reset();
      }

      function closeModalExterno(e) {
        if (e.target.id === 'modalOS') closeModal();
      }

      // 4. Lógica de Submissão
      document.getElementById('formNovaOS').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSubmit');
        
        const formData = {
          os_number: document.getElementById('new_os_number').value.toUpperCase().trim(),
          cliente_nome: document.getElementById('new_cliente_nome').value.trim(),
          data_abertura: document.getElementById('new_data_abertura').value,
          previsao_entrega: document.getElementById('new_previsao_entrega').value,
          status: 'Aberto'
        };

        btn.disabled = true;
        btn.innerText = "PROCESSANDO...";

        try {
          // Verifica duplicidade
          const { data: existing } = await _supabase
            .from('ordens_servico')
            .select('os_number')
            .eq('os_number', formData.os_number)
            .maybeSingle();

          if (existing) throw new Error("Número de OS já existe!");

          // Insere
          const { error } = await _supabase.from('ordens_servico').insert([formData]);
          if (error) throw error;

          closeModal();
          await fetchOrders();
          alert("OS Criada com Sucesso!");
        } catch (error) {
          alert("Erro: " + error.message);
        } finally {
          btn.disabled = false;
          btn.innerText = "SALVAR E INICIAR";
        }
      });

      // Inicialização
      document.addEventListener('DOMContentLoaded', fetchOrders);