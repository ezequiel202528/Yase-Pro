// main.js - Atualizado para garantir a renderização de todos os campos
import { supabaseClient } from './bancoVincula.js';

const tableBody = document.getElementById('tableBody');
const loadingOverlay = document.getElementById('loadingOverlay');
const headerCheckbox = document.getElementById('headerCheckbox');

// Função para formatar data (PT-BR)
const formatarData = (data) => {
    if (!data) return '-';
    try {
        const d = new Date(data);
        if (isNaN(d.getTime())) return data;
        return d.toLocaleDateString('pt-BR');
    } catch (e) {
        return data || '-';
    }
};

// Função para carregar dados do Supabase
async function carregarExtintores() {
    if (!loadingOverlay || !tableBody) return;
    
    loadingOverlay.style.display = 'flex';
    tableBody.innerHTML = '';

    try {
        // Captura valores dos filtros
        const nrOs = document.getElementById('filtroOS')?.value.trim();
        const nrCilindro = document.getElementById('filtroCilindro')?.value.trim();
        const selo = document.getElementById('filtroSelo')?.value.trim();
        const patrimonio = document.getElementById('filtroPatrimonio')?.value.trim();

        // Inicia a query
        let query = supabaseClient.from('itens_os').select('*');

        // Filtros dinâmicos (ajustados para os nomes de coluna prováveis)
        if (nrOs) query = query.ilike('nr_os', `%${nrOs}%`);
        if (nrCilindro) query = query.ilike('nr_cilindro', `%${nrCilindro}%`);
        if (selo) query = query.ilike('selo', `%${selo}%`);
        if (patrimonio) query = query.ilike('patrimonio', `%${patrimonio}%`);

        const { data, error } = await query;

        if (error) throw error;

        if (data && data.length > 0) {
            data.forEach(item => {
                const row = document.createElement('tr');
                row.className = "border-b border-slate-100 hover:bg-indigo-50/30 transition-colors text-[11px]";
                
                // Mapeamento defensivo: Caso o banco use nomes diferentes, tentamos alternativas
                const nr_os = item.nr_os || item.os || '-';
                const nr_cilindro = item.nr_cilindro || item.cilindro || '-';
                const fabricante = item.fabricante || '-';
                const tipo_capac = item.tipo_capac || item.tipo || '-';
                const prox_reteste = item.prox_reteste || item.reteste || '-';
                const selo_val = item.selo || '-';
                const carga = item.carga || '-';
                const capacidade = item.capacidade || '-';
                const nivel = item.nivel || '-';
                const fabricacao = item.fabricacao || '-';
                const vencimento = item.vencimento || '-';
                const criado = item.created_at || item.lancado_em || '-';

                row.innerHTML = `
                    <td class="p-3 text-center">
                        <input type="checkbox" class="row-checkbox w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" data-id="${item.id}">
                    </td>
                    <td class="p-3 font-medium text-slate-900">${nr_os}</td>
                    <td class="p-3 text-slate-600">${nr_cilindro}</td>
                    <td class="p-3 text-slate-600">${fabricante}</td>
                    <td class="p-3 text-slate-600">${tipo_capac}</td>
                    <td class="p-3 text-slate-600">${prox_reteste}</td>
                    <td class="p-3 text-slate-600 font-bold">${selo_val}</td>
                    <td class="p-3 text-center">
                        <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-bold">${carga}</span>
                    </td>
                    <td class="p-3 text-center">
                        <span class="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-bold">${capacidade}</span>
                    </td>
                    <td class="p-3 text-slate-600">${nivel}</td>
                    <td class="p-3 text-slate-600">${fabricacao}</td>
                    <td class="p-3 font-semibold text-slate-700">${formatarData(vencimento)}</td>
                    <td class="p-3 text-slate-500">${formatarData(criado)}</td>
                `;
                tableBody.appendChild(row);
            });
            
            // Atualiza contador se houver o elemento
            const totalFound = document.getElementById('totalEncontrado');
            if (totalFound) totalFound.textContent = data.length;

        } else {
            tableBody.innerHTML = '<tr><td colspan="13" class="p-8 text-center text-slate-400">Nenhum dado encontrado no banco de dados.</td></tr>';
        }

    } catch (err) {
        console.error("Erro ao carregar:", err.message);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="13" class="p-8 text-center text-red-500">Erro de conexão: ${err.message}</td></tr>`;
        }
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const btnBuscar = document.getElementById('btnBuscar');
    if (btnBuscar) {
        btnBuscar.onclick = (e) => {
            e.preventDefault();
            carregarExtintores();
        };
    }

    // Lógica do Checkbox Global
    if (headerCheckbox) {
        headerCheckbox.addEventListener('change', () => {
            const checkboxes = document.querySelectorAll('.row-checkbox');
            checkboxes.forEach(cb => cb.checked = headerCheckbox.checked);
        });
    }

    // Carregar inicialmente
    carregarExtintores();
});