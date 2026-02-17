
async function gerarRelatorioSaida() {
  // Busca os dados atualizados do banco, incluindo a nova coluna nbr_id
  const { data: itens, error } = await _supabase
    .from("itens_os")
    .select("*")
    .eq("os_number", currentOS);

  if (error || !itens || itens.length === 0) {
    alert("Nenhum item encontrado para esta OS.");
    return;
  }

  const janelaImpressao = window.open('', '', 'width=1200,height=800');
  
  const html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <title>Relatório Técnico de Manutenção - OS ${currentOS}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @page { size: landscape; margin: 8mm; }
        @media print { .no-print { display: none; } }
        body { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 8.5px; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #94a3b8; padding: 4px; text-align: center; }
        th { background-color: #f8fafc; font-weight: 800; text-transform: uppercase; color: #475569; font-size: 8px; }
        .header-box { border: 2px solid #1e293b; padding: 12px; margin-bottom: 10px; }
        .footer-sign { margin-top: 40px; display: flex; justify-content: space-around; }
        .sign-box { border-top: 1px solid #1e293b; width: 220px; text-align: center; padding-top: 5px; font-weight: bold; }
        .highlight { background-color: #f1f5f9; font-weight: bold; }
      </style>
    </head>
    <body class="bg-white p-2">
      
      <div class="header-box">
        <div class="flex justify-between items-center border-b-2 border-slate-900 pb-3 mb-3">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-slate-900 rounded flex items-center justify-center text-white font-black text-xl">EXT</div>
            <div>
              <div class="text-lg font-black uppercase tracking-tighter">Sua Empresa de Extintores Ltda</div>
              <div class="text-[9px] font-bold text-slate-500">RELATÓRIO DE ENSAIO HIDROSTÁTICO E MANUTENÇÃO - PORTARIA 005/2011</div>
            </div>
          </div>
          <div class="text-right">
            <div class="bg-slate-900 text-white px-3 py-1 text-sm font-black rounded mb-1">OS: ${currentOS}</div>
            <div class="text-[9px] font-bold">Emitido em: ${new Date().toLocaleString('pt-BR')}</div>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-4 font-bold uppercase text-[9px]">
          <div class="bg-slate-50 p-2 rounded border border-slate-200">
            <span class="text-slate-400 block text-[7px]">Responsável pela OS:</span>
            ${document.getElementById("userName")?.innerText || 'Técnico Autorizado'}
          </div>
          <div class="bg-slate-50 p-2 rounded border border-slate-200 text-center">
            <span class="text-slate-400 block text-[7px]">Normas Aplicadas:</span>
            NBR 12962 / 13485 / 15808
          </div>
          <div class="bg-slate-50 p-2 rounded border border-slate-200 text-right">
            <span class="text-slate-400 block text-[7px]">Status do Relatório:</span>
            FINALIZADO / REGISTRADO
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th colspan="5" class="bg-indigo-50 text-indigo-700">Identificação do Equipamento</th>
            <th colspan="3" class="bg-amber-50 text-amber-700">Manutenção</th>
            <th colspan="3" class="bg-emerald-50 text-emerald-700">Datas e Prazos</th>
            <th colspan="2" class="bg-slate-100">Controle</th>
          </tr>
          <tr>
            <th>Cilindro</th>
            <th>Fabricante</th>
            <th>Tipo</th>
            <th>Capac.</th>
            <th class="highlight">NBR</th> <th>Ano Fab.</th>
            <th>NV</th>
            <th>Selo Inmetro</th>
            <th>Últ. Reteste</th>
            <th>Próx. Reteste</th>
            <th>Próx. Recarga</th>
            <th>Obs</th>
            <th>Res.</th>
          </tr>
        </thead>
        <tbody>
          ${itens.map(item => `
            <tr class="hover:bg-slate-50">
              <td class="font-black text-slate-900">${item.nr_cilindro || '-'}</td>
              <td>${item.fabricante || '-'}</td>
              <td>${item.tipo_carga || '-'}</td>
              <td>${item.capacidade || '-'}</td>
              <td class="highlight">${item.nbr_id || '-'}</td> <td>${item.ano_fab || '-'}</td>
              <td class="font-bold">NV ${item.nivel || '-'}</td>
              <td class="text-[7px]">${item.selo_anterior || '-'}</td>
              <td>${item.ult_reteste || '-'}</td>
              <td class="text-red-600 font-extrabold">${item.prox_reteste || '-'}</td>
              <td class="text-indigo-600 font-bold">
                ${item.prox_recarga ? new Date(item.prox_recarga).toLocaleDateString('pt-BR') : '-'}
              </td>
              <td class="text-[7px] italic">${item.obs_ensaio || '-'}</td>
              <td class="font-black ${item.resultado === 'REPROVADO' ? 'text-red-600' : 'text-emerald-600'}">
                ${item.resultado === 'REPROVADO' ? 'REP' : 'APR'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer-sign">
        <div class="sign-box">
          <div class="text-[9px] font-black">${document.getElementById("userName")?.innerText || 'TÉCNICO RESPONSÁVEL'}</div>
          <p class="text-[7px] text-slate-500 uppercase">Responsável Técnico / CFT</p>
        </div>
        <div class="sign-box">
          <div class="text-[9px] font-black">CONTROLE DE QUALIDADE</div>
          <p class="text-[7px] text-slate-500 uppercase">Carimbo da Empresa Certificada</p>
        </div>
      </div>

      <div class="no-print fixed bottom-8 right-8 flex gap-3">
        <button onclick="window.close()" class="bg-slate-500 text-white px-6 py-3 rounded-xl shadow-xl font-bold uppercase text-xs">
           Fechar
        </button>
        <button onclick="window.print()" class="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-xl hover:bg-indigo-700 transition-all font-black uppercase text-xs flex items-center gap-2">
           <i class="fa-solid fa-print"></i> Imprimir Relatório Técnico
        </button>
      </div>
    </body>
    </html>
  `;

  janelaImpressao.document.write(html);
  janelaImpressao.document.close();
}