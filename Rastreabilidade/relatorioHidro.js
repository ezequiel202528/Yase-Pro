async function gerarRelatorioSaida() {
  const { data: itens, error } = await _supabase
    .from("itens_os")
    .select("*")
    .eq("os_number", currentOS);

  if (error || !itens || itens.length === 0) {
    alert("Nenhum item encontrado para esta OS.");
    return;
  }

  const janelaImpressao = window.open('', '', 'width=1400,height=900');
  
  const html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <title>Relatório Técnico - OS ${currentOS}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
      <style>
        @page { size: landscape; margin: 8mm; }
        body { font-family: 'Inter', sans-serif; color: #1e293b; background-color: white; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; table-layout: fixed; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        th { background-color: #f8fafc; color: #64748b; font-size: 6.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 4px; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
        td { padding: 6px 4px; font-size: 7.5px; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; text-align: center; }
        .mono { font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 7px; color: #0f172a; }
        .group-tag { font-size: 9px; font-weight: 800; padding: 10px; border-bottom: 2px solid #334155; }
        .badge-apr { background-color: #dcfce7; color: #166534; padding: 2px 4px; border-radius: 4px; font-weight: 800; }
        .badge-rep { background-color: #fee2e2; color: #991b1b; padding: 2px 4px; border-radius: 4px; font-weight: 800; }
        .highlight-red { color: #ef4444; font-weight: 700; }
      </style>
    </head>
    <body class="p-4">
      
      <div class="flex justify-between items-end mb-6 pb-4 border-b-2 border-slate-100">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">E</div>
          <div>
            <h1 class="text-lg font-black tracking-tight text-slate-900">SUA EMPRESA DE EXTINTORES LTDA</h1>
            <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Relatório de Ensaio Hidrostático (NBR 13485)</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-[10px] font-bold text-slate-400 uppercase">Ordem de Serviço</div>
          <div class="text-2xl font-black text-slate-900">#${currentOS}</div>
          <div class="text-[8px] text-slate-500 font-medium">${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr class="bg-slate-50">
            <th colspan="3" class="group-tag text-slate-500">Geral</th>
            <th colspan="7" class="group-tag text-blue-600 bg-blue-50/30">Equipamento</th>
            <th colspan="7" class="group-tag text-emerald-600 bg-emerald-50/30">Ensaios & Pesagem</th>
            <th colspan="4" class="group-tag text-rose-600 bg-rose-50/30">Deformação Volumétrica</th>
          </tr>
          <tr>
            <th width="3%">OS</th>
            <th width="5%">Data</th>
            <th width="12%">Cliente</th>
            <th width="5%">Cilindro</th>
            <th width="3%">Tipo</th>
            <th width="3%">Cap.</th>
            <th width="3%">Nív.</th>
            <th width="5%">Selo</th>
            <th width="4%">Últ.</th>
            <th width="4%">Próx.</th>
            <th width="4%">Res.</th>
            <th width="3%">Tara</th>
            <th width="3%">Vazio</th>
            <th width="3%">Cheio</th>
            <th width="4%">Perda %</th>
            <th width="4%">C. Máx</th>
            <th width="3%">Vol (L)</th>
            <th width="3%">PNC</th>
            <th width="3%">Teste</th>
            <th width="3%">ET</th>
            <th width="3%">EP/ET%</th>
          </tr>
        </thead>
        <tbody>
          ${itens.map(item => {
            const volume = parseFloat(item.vol_litros) || 0;
            const pVazio = parseFloat(item.p_cil_vazio_kg) || 0;
            const tara = parseFloat(item.tara_cilindro) || 0;
            const perdaMassa = (tara > 0) ? (((tara - pVazio) / tara) * 100).toFixed(2) : "0.00";
            const capMax = (volume > 0) ? (volume * 0.68).toFixed(2) : "-";

            return `
            <tr>
              <td class="mono text-slate-400">${item.os_number || currentOS}</td>
              <td class="font-medium">${item.data_abertura || '-'}</td>
              <td class="text-left font-bold text-slate-700 truncate">${item.razao_social || 'CLIENTE NÃO IDENTIFICADO'}</td>
              <td class="font-black text-slate-900 bg-slate-50/50">${item.nr_cilindro || '-'}</td>
              <td>${item.tipo_carga || '-'}</td>
              <td>${item.capacidade || '-'}</td>
              <td class="font-bold">3</td>
              <td class="mono text-blue-600">${item.num_selo || '-'}</td>
              <td>${item.ult_reteste || '-'}</td>
              <td class="highlight-red">${item.prox_reteste || '-'}</td>
              <td><span class="badge-apr">APR</span></td>
              <td class="mono">${item.tara_cilindro || '-'}</td>
              <td class="mono">${item.p_cil_vazio_kg || '-'}</td>
              <td class="mono">${item.peso_cheio || '-'}</td>
              <td class="mono ${parseFloat(perdaMassa) > 10 ? 'highlight-red' : ''}">${perdaMassa}%</td>
              <td class="mono font-bold">${capMax}</td>
              <td class="mono">${item.vol_litros || '-'}</td>
              <td class="font-bold text-slate-400">${item.p_trabalho_pnc || '1.0'}</td>
              <td class="font-bold text-rose-600">${item.ep_ensaio || '-'}</td>
              <td class="mono">${item.et_ensaio || '-'}</td>
              <td class="font-black text-blue-600">${item.ep_porcent_final || '-'}%</td>
            </tr>
          `}).join('')}
        </tbody>
      </table>

      <div class="mt-12 flex justify-between items-center px-10">
        <div class="text-center">
          <div class="w-48 border-b border-slate-300 mb-2"></div>
          <p class="text-[8px] font-black uppercase text-slate-900">${document.getElementById("userName")?.innerText || 'RESPONSÁVEL TÉCNICO'}</p>
          <p class="text-[6px] font-bold text-slate-400 tracking-widest uppercase">Assinatura Digitalizada</p>
        </div>
        <div class="flex flex-col items-center opacity-30">
          <div class="w-10 h-10 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black italic">INM</div>
          <p class="text-[6px] font-bold mt-1">Selo de Qualidade</p>
        </div>
      </div>

      <div class="no-print fixed bottom-8 right-8 flex gap-3">
        <button onclick="window.close()" class="bg-white text-slate-500 border border-slate-200 px-6 py-2 rounded-xl font-bold uppercase text-[10px] hover:bg-slate-50 transition-all">Cancelar</button>
        <button onclick="window.print()" class="bg-slate-900 text-white px-8 py-2 rounded-xl font-black uppercase text-[10px] shadow-2xl hover:scale-105 transition-all">Imprimir Laudo</button>
      </div>
    </body>
    </html>
  `;

  janelaImpressao.document.write(html);
  janelaImpressao.document.close();
}