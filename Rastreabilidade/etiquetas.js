function prepararModalEtiqueta(dados) {
    // 1. Formata a data para exibir na etiqueta (ex: JAN-2027)
    const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const dRecarga = new Date(dados.prox_recarga + "T12:00:00");
    const dataFormatada = `${meses[dRecarga.getMonth()]} - ${dRecarga.getFullYear()}`;

    // 2. Preenche os campos do Modal
    document.getElementById('etiqueta_val_manut').innerText = dataFormatada;
    document.getElementById('etiqueta_val_reteste').innerText = dados.prox_reteste || "---";
    document.getElementById('etiqueta_nivel').innerText = "NÍVEL " + dados.nivel;

    // 3. Gera o Código de Barras (Usando o número do cilindro)
    JsBarcode("#barcode_preview", dados.nr_cilindro, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 40,
        displayValue: true
    });

    // 4. Mostra o Modal
    document.getElementById('modalEtiqueta').classList.remove('hidden');
    document.getElementById('modalEtiqueta').classList.add('flex');
}


// Fecha o modal
function fecharModalEtiqueta() {
    document.getElementById('modalEtiqueta').classList.add('hidden');
    document.getElementById('modalEtiqueta').classList.remove('flex');
}

// Preenche e exibe o modal (Esta função deve ser chamada dentro do registrarItem)
function prepararModalEtiqueta(dados) {
    const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const dRecarga = new Date(dados.prox_recarga + "T12:00:00");
    const dataFormatada = `${meses[dRecarga.getMonth()]} - ${dRecarga.getFullYear()}`;

    // Preenche textos
    document.getElementById('etiqueta_val_manut').innerText = dataFormatada;
    document.getElementById('etiqueta_val_reteste').innerText = dados.prox_reteste || "---";
    document.getElementById('etiqueta_nivel').innerText = "NÍVEL " + dados.nivel;
    document.getElementById('etiqueta_tipo').innerText = dados.tipo_carga;
    document.getElementById('etiqueta_cap').innerText = dados.capacidade;

    // Gera o Código de Barras
    JsBarcode("#barcode_preview", dados.nr_cilindro, {
        format: "CODE128",
        width: 1.5,
        height: 30,
        displayValue: true,
        fontSize: 8,
        margin: 0
    });

    // Mostra o Modal
    document.getElementById('modalEtiqueta').classList.remove('hidden');
    document.getElementById('modalEtiqueta').classList.add('flex');
}

// Função que manda para a impressora
function executarImpressao() {
    const conteudo = document.getElementById('areaImpressaoEtiqueta').innerHTML;
    const janelaImpressao = window.open('', '', 'width=800,height=600');
    
    janelaImpressao.document.write(`
        <html>
            <head>
                <title>Imprimir Etiqueta</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @page { size: 100mm 50mm; margin: 0; }
                    body { margin: 0; padding: 0; }
                    #etiqueta { width: 100mm; height: 50mm; padding: 5px; border: none; }
                </style>
            </head>
            <body>
                <div id="etiqueta">${conteudo}</div>
                <script>
                    setTimeout(() => { window.print(); window.close(); }, 500);
                </script>
            </body>
        </html>
    `);
    
    fecharModalEtiqueta();
}