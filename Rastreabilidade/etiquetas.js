// ==========================================
// MÓDULO DE ETIQUETAS E GESTÃO DE LOTES (YASe PRO)
// ==========================================

// Função auxiliar para buscar os dados atualizados da empresa direto do Supabase
async function buscarDadosEmpresaSupabase() {
  let dadosEmpresa = {
    nome: "NOME DA EMPRESA LTDA",
    endereco: "ENDEREÇO COMPLETO",
    cidade: "CIDADE/UF",
    cnpj: "00.000.000/0000-00",
    fone: "(00) 0000-0000",
    logo: ""
  };

  try {
    let empresaIdLocal = localStorage.getItem('empresa_id');

    if (!empresaIdLocal) {
      const userJson = localStorage.getItem('yase_user') || localStorage.getItem('yase_colab');
      if (userJson) {
        const parsedUser = JSON.parse(userJson);
        empresaIdLocal = parsedUser.empresa_id || parsedUser.empresaId;
      }
    }

    if (empresaIdLocal && typeof window._supabase !== 'undefined') {
      const { data: empData, error } = await window._supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaIdLocal)
        .maybeSingle();

      if (!error && empData) {
        dadosEmpresa.nome = empData.nome_fantasia || empData.razao_social || dadosEmpresa.nome;
        dadosEmpresa.endereco = empData.endereco || dadosEmpresa.endereco;
        dadosEmpresa.cidade = empData.cidade || empData.cidade_uf || dadosEmpresa.cidade;
        dadosEmpresa.cnpj = empData.cnpj || dadosEmpresa.cnpj;
        dadosEmpresa.fone = empData.telefone || dadosEmpresa.fone;
        dadosEmpresa.logo = empData.logo || empData.logo_url || "";
      }
    }
  } catch (err) {
    console.error("Erro ao buscar dados da empresa no Supabase:", err);
  }

  // Fallback para o localStorage se necessário
  if (dadosEmpresa.nome === "NOME DA EMPRESA LTDA") {
    dadosEmpresa.nome = localStorage.getItem('nome_empresa') || dadosEmpresa.nome;
    dadosEmpresa.endereco = localStorage.getItem('endereco_empresa') || dadosEmpresa.endereco;
    dadosEmpresa.cidade = localStorage.getItem('cidade_empresa') || dadosEmpresa.cidade;
    dadosEmpresa.cnpj = localStorage.getItem('cnpj_empresa') || dadosEmpresa.cnpj;
    dadosEmpresa.fone = localStorage.getItem('telefone_empresa') || dadosEmpresa.fone;
    dadosEmpresa.logo = localStorage.getItem("empresa_logo") || dadosEmpresa.logo;
  }

  const enderecoFinal = `${dadosEmpresa.endereco} - ${dadosEmpresa.cidade}`;

  return {
    nome: dadosEmpresa.nome,
    endereco: enderecoFinal,
    cnpj: dadosEmpresa.cnpj,
    fone: dadosEmpresa.fone,
    logo: dadosEmpresa.logo
  };
}

// 1. PREPARAR E ABRIR MODAL DE ETIQUETA UNITÁRIA
async function prepararModalEtiqueta(dados) {
  console.log("Preparando modal com os dados:", dados);

  if (!dados) {
    console.error("Nenhum dado foi passado para preparar a etiqueta.");
    return;
  }

  const setElementText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
    else console.warn(`Elemento com ID '${id}' não foi encontrado no HTML.`);
  };

  // Busca os dados reais da empresa atualizada
  const emp = await buscarDadosEmpresaSupabase();

  setElementText('etiqueta_empresa_nome', emp.nome);
  setElementText('etiqueta_empresa_endereco', emp.endereco);
  setElementText('etiqueta_empresa_cnpj', emp.cnpj);
  setElementText('etiqueta_empresa_fone', emp.fone);

  const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  
  const dataRecargaStr = dados.prox_recarga || new Date().toISOString().split('T')[0];
  const dRecarga = new Date(dataRecargaStr + "T12:00:00");
  const dataEtiqueta = `${meses[dRecarga.getMonth()]} ${dRecarga.getFullYear()}`;

  setElementText("etiqueta_val_manut", dataEtiqueta);
  setElementText("etiqueta_val_reteste", dados.prox_reteste || "---");
  setElementText("etiqueta_nivel", "NÍVEL " + (dados.nivel || 2));
  setElementText("etiqueta_tipo", dados.tipo_carga || "---");
  setElementText("etiqueta_cap", dados.capacidade || "---");
  setElementText("etiqueta_cilindro", dados.nr_cilindro || dados.cilindro || dados.numero_cilindro || "---");

  const elementoSelo = document.getElementById("etiqueta_selo");
  if (elementoSelo) {
    const prefixo = dados.prefixo_selo ? dados.prefixo_selo + "-" : "";
    const numeroSelo = dados.selo_inmetro || "---";
    elementoSelo.innerText = prefixo + numeroSelo;
  }

  const codigoBarrasReal = dados.cod_barras || dados.codigo_barras || dados.nr_cilindro || dados.cilindro || "---";

  if (typeof JsBarcode === "function") {
    try {
      JsBarcode("#barcode_preview", codigoBarrasReal, {
        format: "CODE128",
        width: 1.2,
        height: 25,
        displayValue: false,
        lineColor: "#000",
      });
    } catch (e) {
      console.error("Erro ao gerar código de barras no preview:", e);
    }
  } else {
    console.warn("Biblioteca JsBarcode não encontrada.");
  }

  setElementText("barcode_text_manual", codigoBarrasReal);

  // Logo da empresa
  const imgLogoCentral = document.getElementById("logo_central_etiqueta");

  if (emp.logo && imgLogoCentral) {
    imgLogoCentral.src = emp.logo;
    imgLogoCentral.style.display = "block";
  } else if (imgLogoCentral) {
    imgLogoCentral.style.display = "none";
  }

  // Exibir o modal
  const modalEtiqueta = document.getElementById("modalEtiqueta");
  if (modalEtiqueta) {
    modalEtiqueta.classList.remove("hidden");
    modalEtiqueta.classList.add("flex");
  } else {
    console.error("Modal com ID 'modalEtiqueta' não foi encontrado na página.");
  }
}

function fecharModalEtiqueta() {
  const modal = document.getElementById("modalEtiqueta");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function validarEImprimir() {
  const areaImpressao = document.getElementById("areaImpressaoEtiqueta");
  if (!areaImpressao) {
    alert("Área de impressão da etiqueta não encontrada.");
    return;
  }
  
  const conteudo = areaImpressao.innerHTML;
  
  // Pega o código de barras atual para replicar na janela de impressão
  const codigoBarasTexto = document.getElementById("barcode_text_manual") ? document.getElementById("barcode_text_manual").innerText : "---";

  const janela = window.open("", "", "width=800,height=600");

  janela.document.write(`
        <html>
            <head>
                <title>Imprimir Etiqueta</title>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @page { size: 100mm 50mm; margin: 0; }
                    body { margin: 0; padding: 0; background: white; }
                </style>
            </head>
            <body onload="setTimeout(() => { 
                try {
                    JsBarcode('#barcode_preview', '${codigoBarasTexto}', { format: 'CODE128', width: 1.2, height: 18, displayValue: false, lineColor: '#000' });
                } catch(e) { console.error(e); }
                window.print(); 
                window.close(); 
            }, 500)">
                <div style="width: 100mm; height: 50mm; padding: 2px; color: black; background: white; box-sizing: border-box;">
                    ${conteudo}
                </div>
            </body>
        </html>
    `);
  janela.document.close();
  fecharModalEtiqueta();
}

function verificarEImprimirUnitario(item) {
    const desativado = localStorage.getItem('desativar_funcoes_etiqueta') === 'true';
    if (desativado) {
        alert("As funções de impressão de etiquetas estão desativadas no sistema.");
        return;
    }
    prepararModalEtiqueta(item);
}


// ==========================================
// 2. FILA DE IMPRESSÃO E SUPABASE
// ==========================================

let filaEtiquetas = [];

async function adicionarFilaEtiquetaLote(loteId, extintoresArray) {
  const itensFila = [];

  extintoresArray.forEach(extintor => {
    const codigoBarrasReal = extintor.cod_barras || extintor.codigo_barras || extintor.nr_cilindro || "---";
    const numeroCilindro = extintor.nr_cilindro || extintor.cilindro || "---";
    const seloInmetro = extintor.selo_inmetro || "---";

    itensFila.push({
      lote_id: loteId,
      extintor_id: extintor.id || null,
      numero_cilindro: numeroCilindro,
      codigo_barras: codigoBarrasReal,
      selo_inmetro: seloInmetro,
      tipo: 'selo_inmetro',
      status: 'pendente'
    });

    itensFila.push({
      lote_id: loteId,
      extintor_id: extintor.id || null,
      numero_cilindro: numeroCilindro,
      codigo_barras: codigoBarrasReal,
      selo_inmetro: seloInmetro,
      tipo: 'nivel_manutencao',
      status: 'pendente'
    });
  });

  const { error } = await window._supabase.from('fila_impressao').insert(itensFila);

  if (error) {
    console.error('Erro ao inserir fila no Supabase:', error);
    alert('Erro ao salvar etiquetas na fila de impressão.');
  } else {
    if (typeof window.carregarFilaPendentesSupabase === "function") {
      window.carregarFilaPendentesSupabase();
    }
  }
}

window.carregarExtintoresPendentes = async function() {
    const inputQuantidadeLote = document.getElementById('quantidade_lote_input') || document.getElementById('inputQtdLote');
    const quantidadeDesejada = inputQuantidadeLote ? parseInt(inputQuantidadeLote.value) || 0 : 0;

    const containerTabela = document.getElementById('tabelaExtintoresPendentesBody');

    if (quantidadeDesejada <= 0) {
        if (containerTabela) {
            containerTabela.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-gray-400">Informe um número válido para carregar o lote.</td></tr>`;
        }
        return;
    }

    if (containerTabela) {
        containerTabela.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-white">Carregando os últimos ${quantidadeDesejada} registros...</td></tr>`;
    }

    if (!window._supabase) {
        console.error("Cliente Supabase não encontrado em window._supabase!");
        return;
    }

    try {
        const { data: lotesItens, error: errLotes } = await window._supabase
            .from('lotes_etiquetas_itens')
            .select('extintor_id');

        if (errLotes) {
            console.warn("Aviso ao buscar lotes anteriores:", errLotes);
        }

        const idsJaImpressos = (lotesItens || []).map(item => item.extintor_id).filter(Boolean);

        let query = window._supabase
            .from('itens_os') 
            .select('*')
            .order('id', { ascending: false });

        if (idsJaImpressos.length > 0) {
            query = query.not('id', 'in', `(${idsJaImpressos.join(',')})`);
        }

        const { data, error } = await query.limit(quantidadeDesejada);

        if (error) {
            console.error("Erro retornado pelo Supabase:", error);
            if (containerTabela) {
                containerTabela.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-red-400">Erro ao carregar: ${error.message}</td></tr>`;
            }
            return;
        }

        if (!data || data.length === 0) {
            if (containerTabela) {
                containerTabela.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-yellow-400">Nenhum extintor pendente encontrado.</td></tr>`;
            }
            window.extintoresPendentesCache = [];
            return;
        }

        window.extintoresPendentesCache = data;
        renderizarTabelaPendentes(data);

    } catch (err) {
        console.error("Erro inesperado ao carregar extintores:", err);
        if (containerTabela) {
            containerTabela.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-red-400">Erro inesperado. Veja o console (F12).</td></tr>`;
        }
    }
};

function renderizarTabelaPendentes(itens) {
    const tbody = document.getElementById('tabelaExtintoresPendentesBody');
    
    if (!tbody) {
        setTimeout(() => {
            const tbodyRetry = document.getElementById('tabelaExtintoresPendentesBody');
            if (tbodyRetry) renderizarTabelaPendentes(itens);
        }, 100);
        return;
    }

    if (!itens || itens.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-gray-400">Nenhum extintor encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = itens.map(item => {
        const idBruto = item.id !== undefined && item.id !== null ? String(item.id) : '';
        const idCurto = idBruto ? idBruto.substring(0, 8) + '...' : '---';
        const selo = item.selo_inmetro || item.n_selo || item.selo || '---';
        const cilindro = item.nr_cilindro || item.cilindro || item.numero_cilindro || '---';
        const nbr = item.nbr || item.norma_nbr || '---';
        const fabricante = item.fabricante || item.fabricante_nome || '---';
        const tipoCapacidade = `${item.tipo_carga || item.tipo || '---'} / ${item.capacidade || '---'}`;

        return `
            <tr class="border-b border-gray-700 hover:bg-gray-800/50">
                <td class="p-3 text-center">
                    <input type="checkbox" class="checkbox-item-extintor rounded bg-gray-700 border-gray-600 text-purple-600" value="${idBruto}">
                </td>
                <td class="p-3 text-gray-300">${idCurto}</td>
                <td class="p-3 text-gray-300">${selo}</td>
                <td class="p-3 font-bold text-white">${cilindro}</td>
                <td class="p-3 text-gray-300">${nbr}</td>
                <td class="p-3 text-gray-300">${fabricante}</td>
                <td class="p-3 text-gray-300">${tipoCapacidade}</td>
            </tr>
        `;
    }).join('');
}

window.imprimirFilaEtiquetas = async function(idsEspecificos = []) {
  const itensParaImprimir = idsEspecificos.length > 0 
    ? filaEtiquetas.filter(item => idsEspecificos.includes(item.id))
    : filaEtiquetas;

  if (!itensParaImprimir || itensParaImprimir.length === 0) {
    alert("A fila de etiquetas está vazia ou nenhum item foi selecionado!");
    return;
  }

  // Busca os dados reais atualizados da empresa do Supabase
  const emp = await buscarDadosEmpresaSupabase();

  const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  let htmlEtiquetas = "";

  itensParaImprimir.forEach((dados, idx) => {
    const dataRef = dados.prox_recarga || new Date().toISOString().split('T')[0];
    const dRecarga = new Date(dataRef + "T12:00:00");
    const dataEtiqueta = `${meses[dRecarga.getMonth()]} ${dRecarga.getFullYear()}`;
    const codigoBarrasReal = dados.codigo_barras || dados.numero_cilindro || "---";
    const numeroSelo = dados.selo_inmetro || "---";

    htmlEtiquetas += `
      <div class="etiqueta-pagina" style="width: 100mm; height: 50mm; padding: 3px; color: black; background: white; display: flex; justify-content: space-between; align-items: stretch; position: relative; overflow: hidden; box-sizing: border-box; page-break-after: always; break-after: page; font-family: Arial, sans-serif;">
          
          <!-- COLUNA ESQUERDA -->
          <div style="display: flex; flex-direction: column; justify-content: space-between; flex: 1; padding-right: 4px; box-sizing: border-box;">
              
              <!-- Cabeçalho -->
              <div style="display: flex; align-items: center; border-bottom: 1.5px solid black; padding-bottom: 2px; margin-bottom: 2px;">
                  <div style="width: 22mm; height: 10mm; display: flex; align-items: center; justify-content: center; margin-right: 4px; flex-shrink: 0;">
                      ${emp.logo ? `<img src="${emp.logo}" style="max-width: 22mm; max-height: 10mm; object-fit: contain;">` : ''}
                  </div>
                  <div style="text-align: left; flex: 1; overflow: hidden;">
                      <div style="font-size: 8.5px; font-weight: 900; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${emp.nome}</div>
                      <div style="font-size: 6px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${emp.endereco}</div>
                      <div style="font-size: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">CNPJ: ${emp.cnpj} | Tel: ${emp.fone}</div>
                  </div>
              </div>

              <!-- Aviso Inmetro -->
              <div style="font-size: 4.8px; text-align: center; font-weight: bold; text-transform: uppercase; line-height: 1.1; margin-bottom: 2px;">
                  PARA CONCESSÃO DE GARANTIA ESTE EXTINTOR DEVE SER VERIFICADO MENSALMENTE, GARANTIA DE 1 ANO, CONTRA A DESPRESSURIZAÇÃO. A VIOLAÇÃO DO LACRE INTERROMPE A GARANTIA.
              </div>

              <!-- Tabela de Prazos -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); border: 1.5px solid black; margin-bottom: 2px;">
                  <div style="border-right: 1.5px solid black; text-align: center; padding: 1px;">
                      <div style="font-size: 5px; font-weight: 900; text-transform: uppercase;">Próx. Manut. 2º Nível</div>
                      <div style="font-size: 8.5px; font-weight: bold;">${dataEtiqueta}</div>
                  </div>
                  <div style="border-right: 1.5px solid black; text-align: center; padding: 1px;">
                      <div style="font-size: 5px; font-weight: 900; text-transform: uppercase;">Próx. Manut. 3º Nível</div>
                      <div style="font-size: 8.5px; font-weight: bold;">${dados.prox_reteste || "---"}</div>
                  </div>
                  <div style="text-align: center; padding: 1px; background: black; color: white;">
                      <div style="font-size: 5px; font-weight: 900; text-transform: uppercase; color: white;">Manut. Realizada</div>
                      <div style="font-size: 8.5px; font-weight: bold; font-style: italic;">NÍVEL ${dados.nivel || 2}</div>
                  </div>
              </div>

              <!-- Rodapé -->
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #ccc; padding-top: 2px;">
                  <div style="font-size: 6.5px; font-weight: bold; font-style: italic; line-height: 1.2;">
                      Tipo: ${dados.tipo_carga || "---"} | Cap: ${dados.capacidade || "---"}<br>
                      Nº Cilindro: <span style="font-weight: 900;">${dados.numero_cilindro || "---"}</span>
                  </div>
              </div>
          </div>

          <!-- COLUNA DIREITA: Código de Barras Vertical + Selo -->
          <div style="width: 28px; border-left: 2px dashed black; display: flex; align-items: center; justify-content: space-between; background: #fff; position: relative; padding: 2px 0; box-sizing: border-box;">
              
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; width: 14px;">
                  <svg id="barcode_fila_${idx}" style="transform: rotate(90deg); max-height: 42mm;"></svg>
              </div>

              <span style="font-weight: 900; font-size: 10px; letter-spacing: 1px; writing-mode: vertical-rl; transform: rotate(180deg); text-align: center;">
                  ${numeroSelo}
              </span>
          </div>
      </div>
    `;
  });

  const janela = window.open("", "", "width=800,height=600");
  janela.document.write(`
        <html>
            <head>
                <title>Fila de Impressão de Etiquetas</title>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                <style>
                    @page { size: 100mm 50mm; margin: 0; }
                    body { margin: 0; padding: 0; background: white; }
                    .etiqueta-pagina { page-break-after: always; break-after: page; }
                </style>
            </head>
            <body>
                ${htmlEtiquetas}
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            ${itensParaImprimir.map((dados, idx) => {
                              const code = dados.codigo_barras || dados.numero_cilindro || "---";
                              return `JsBarcode("#barcode_fila_${idx}", "${code}", { format: "CODE128", width: 1.2, height: 25, displayValue: false, lineColor: "#000" });`;
                            }).join('\n')}
                            window.print();
                            window.setTimeout(() => { window.close(); }, 500);
                        }, 300);
                    };
                </script>
            </body>
        </html>
    `);
  janela.document.close();

  const idsParaAtualizar = itensParaImprimir.map(item => item.id);
  if (idsParaAtualizar.length > 0) {
    await window._supabase
      .from('fila_impressao')
      .update({ status: 'impresso', impresso_em: new Date().toISOString() })
      .in('id', idsParaAtualizar);
  }
};


// ==========================================
// 3. GESTÃO DE LOTES
// ==========================================

window.abrirModalLotes = function() {
    const modal = document.getElementById('modalLotesEtiquetas');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        window.carregarExtintoresPendentes();
    }
};

window.fecharModalLotes = function() {
    const modal = document.getElementById('modalLotesEtiquetas');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.toggleSelecionarTodos = function(masterCheckbox) {
    document.querySelectorAll('.checkbox-item-extintor').forEach(cb => cb.checked = masterCheckbox.checked);
};

window.gerarLoteEImprimir = async function() {
    const checkboxesSelecionados = document.querySelectorAll('.checkbox-item-extintor:checked');
    if (checkboxesSelecionados.length === 0) {
        alert("Selecione pelo menos um extintor para gerar o lote!");
        return;
    }

    const idsSelecionados = Array.from(checkboxesSelecionados).map(cb => cb.value);
    const extintoresParaLote = (window.extintoresPendentesCache || []).filter(item => idsSelecionados.includes(String(item.id)));

    try {
        const payloadLote = { 
            quantidade_extintores: extintoresParaLote.length, 
            status: 'gerado'
        };

        const { data: loteData, error: loteError } = await window._supabase
            .from('lotes_etiquetas')
            .insert([payloadLote])
            .select()
            .single();

        if (loteError) throw loteError;

        const loteId = loteData.id;
        const itensLigacao = extintoresParaLote.map(ext => ({ lote_id: loteId, extintor_id: ext.id }));

        const { error: ligacaoError } = await window._supabase.from('lotes_etiquetas_itens').insert(itensLigacao);
        if (ligacaoError) throw ligacaoError;

        await adicionarFilaEtiquetaLote(loteId, extintoresParaLote);

        alert(`Lote gerado com sucesso! ${extintoresParaLote.length} itens adicionados à fila.`);

        const inputQuantidadeLote = document.getElementById('quantidade_lote_input') || document.getElementById('inputQtdLote');
        if (inputQuantidadeLote) {
            inputQuantidadeLote.value = ''; 
        }

        window.extintoresPendentesCache = []; 
        window.fecharModalLotes();

    } catch (err) {
        console.error("Erro ao gerar lote:", err);
        alert("Erro ao processar o lote: " + (err.message || "Erro desconhecido."));
    }
};


// ==========================================
// 4. EXPORTAÇÕES GLOBAIS
// ==========================================
window.prepararModalEtiqueta = prepararModalEtiqueta;
window.fecharModalEtiqueta = fecharModalEtiqueta;
window.validarEImprimir = validarEImprimir;
window.verificarEImprimirUnitario = verificarEImprimirUnitario;
window.adicionarFilaEtiquetaLote = adicionarFilaEtiquetaLote;
window.renderizarTabelaPendentes = renderizarTabelaPendentes;