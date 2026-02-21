// 1. Função para Abrir e Preencher o Modal
function prepararModalEtiqueta(dados) {
    const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const dRecarga = new Date(dados.prox_recarga + "T12:00:00");
    const dataEtiqueta = `${meses[dRecarga.getMonth()]} - ${dRecarga.getFullYear()}`;

    // Preenche dados técnicos no Modal
    document.getElementById('etiqueta_val_manut').innerText = dataEtiqueta;
    document.getElementById('etiqueta_val_reteste').innerText = dados.prox_reteste || "---";
    document.getElementById('etiqueta_nivel').innerText = "NÍVEL " + (dados.nivel || 2);
    document.getElementById('etiqueta_tipo').innerText = dados.tipo_carga || "---";
    document.getElementById('etiqueta_cap').innerText = dados.capacidade || "---";

    // Gerar Código de Barras (JsBarcode)
    JsBarcode("#barcode_preview", dados.nr_cilindro, {
        format: "CODE128",
        width: 1.5,
        height: 30,
        displayValue: true,
        fontSize: 8,
        lineColor: "#000"
    });

    // Gerenciar Logo Dinâmica
    const urlLogo = localStorage.getItem('empresa_logo'); 
    const imgLogo = document.getElementById('logo_empresa_etiqueta');
    const iconFallback = document.getElementById('fallback_icon');

    if (urlLogo && imgLogo) {
        imgLogo.src = urlLogo;
        imgLogo.classList.remove('hidden');
        if (iconFallback) iconFallback.classList.add('hidden');
    }

    // Exibe o Modal
    document.getElementById('modalEtiqueta').classList.remove('hidden');
    document.getElementById('modalEtiqueta').classList.add('flex');
}

// 2. Função para Fechar o Modal
function fecharModalEtiqueta() {
    const modal = document.getElementById('modalEtiqueta');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// 3. Função para Disparar a Impressão Real
function executarImpressao() {
    const conteudo = document.getElementById('areaImpressaoEtiqueta').innerHTML;
    const janela = window.open('', '', 'width=800,height=600');
    
    janela.document.write(`
        <html>
            <head>
                <title>Imprimir Etiqueta</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @page { size: 100mm 50mm; margin: 0; }
                    body { margin: 0; padding: 0; background: white; }
                </style>
            </head>
            <body onload="setTimeout(() => { window.print(); window.close(); }, 500)">
                <div style="width: 100mm; height: 50mm; padding: 5px; color: black; background: white;">
                    ${conteudo}
                </div>
            </body>
        </html>
    `);
    
    fecharModalEtiqueta();
}