function prepararModalEtiqueta(dados) {
  document.getElementById('etiqueta_empresa_nome').innerText = localStorage.getItem('nome_empresa') || "NOME DA EMPRESA LTDA";
  document.getElementById('etiqueta_empresa_endereco').innerText = (localStorage.getItem('endereco_empresa') || "ENDEREÇO COMPLETO") + " - " + (localStorage.getItem('cidade_empresa') || "CIDADE/UF");
  document.getElementById('etiqueta_empresa_cnpj').innerText = localStorage.getItem('cnpj_empresa') || "00.000.000/0000-00";
  document.getElementById('etiqueta_empresa_fone').innerText = localStorage.getItem('telefone_empresa') || "(00) 0000-0000";

  const meses = [
    "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", 
    "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
  ];
  
  const dRecarga = new Date(dados.prox_recarga + "T12:00:00");
  const dataEtiqueta = `${meses[dRecarga.getMonth()]} - ${dRecarga.getFullYear()}`;

  document.getElementById("etiqueta_val_manut").innerText = dataEtiqueta;
  document.getElementById("etiqueta_val_reteste").innerText = dados.prox_reteste || "---";
  document.getElementById("etiqueta_nivel").innerText = "NÍVEL " + (dados.nivel || 2);
  document.getElementById("etiqueta_tipo").innerText = dados.tipo_carga || "---";
  document.getElementById("etiqueta_cap").innerText = dados.capacidade || "---";

  document.getElementById("etiqueta_cilindro").innerText = dados.nr_cilindro || dados.cilindro || "---";

  const elementoSelo = document.getElementById("etiqueta_selo");
  if (elementoSelo) {
    const prefixo = dados.prefixo_selo ? dados.prefixo_selo + "-" : "";
    const numeroSelo = dados.selo_inmetro || "---";
    elementoSelo.innerText = prefixo + numeroSelo;
  }

  const codigoBarrasReal = dados.cod_barras || dados.codigo_barras || dados.nr_cilindro;

  JsBarcode("#barcode_preview", codigoBarrasReal, {
    format: "CODE128",
    width: 1.2,
    height: 25,
    displayValue: false,
    lineColor: "#000",
  });

  document.getElementById("barcode_text_manual").innerText = codigoBarrasReal;

  const urlLogo = localStorage.getItem("empresa_logo");
  const imgLogoCentral = document.getElementById("logo_central_etiqueta");

  if (urlLogo && imgLogoCentral) {
    imgLogoCentral.src = urlLogo;
    imgLogoCentral.classList.remove("hidden");
  } else if (imgLogoCentral) {
    imgLogoCentral.classList.add("hidden");
  }

  document.getElementById("modalEtiqueta").classList.remove("hidden");
  document.getElementById("modalEtiqueta").classList.add("flex");
}

function fecharModalEtiqueta() {
  const modal = document.getElementById("modalEtiqueta");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function validarEImprimir() {
  const conteudo = document.getElementById("areaImpressaoEtiqueta").innerHTML;
  const janela = window.open("", "", "width=800,height=600");

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
                <div style="width: 100mm; height: 50mm; padding: 5px; color: black; background: white; display: flex; justify-content: space-between; align-items: stretch; position: relative; overflow: hidden; box-sizing: border-box;">
                    ${conteudo}
                </div>
            </body>
        </html>
    `);

  fecharModalEtiqueta();
}

window.prepararModalEtiqueta = prepararModalEtiqueta;
window.fecharModalEtiqueta = fecharModalEtiqueta;
window.validarEImprimir = validarEImprimir;