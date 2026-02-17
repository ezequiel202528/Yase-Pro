function renderItens(itens) {
  const list = document.getElementById("itensList");
  const counter = document.getElementById("itemCounter");
  counter.innerText = itens.length;

  if (!itens || itens.length === 0) {
    list.innerHTML = `<tr><td colspan="13" class="p-10 text-center text-slate-400 italic">Nenhum item registrado para esta OS.</td></tr>`;
    return;
  }

  list.innerHTML = itens
    .map(
      (item) => `
    <tr class="border-b hover:bg-slate-50 transition-colors">
      <td class="p-4">
        <div class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Cód. Rastreio</div>
        <div class="text-xs font-black text-indigo-700 font-mono">
          ${typeof item.id === "number" ? item.id.toString().padStart(8, "0") : item.id.substring(0, 8).toUpperCase()}
        </div>
      </td>
      <td class="p-4">
        <div class="font-bold text-slate-800">${item.fabricante || "-"}</div>
      </td>
      <td class="p-4">${item.nr_cilindro || "-"}</td>
      <td class="p-4 text-indigo-600 font-bold">${item.tipo_carga || "-"} / ${item.capacidade || "-"}</td>
      <td class="p-4">${item.ano_fab || "-"}</td>
      <td class="p-4">${item.ult_reteste || "-"}</td>
      
<td class="p-4 text-red-500 font-bold text-center">
    ${item.ult_reteste && item.ult_reteste.length === 4
      ? parseInt(item.ult_reteste) + 5
      : "---"}
</td>

      
      
     <td class="p-4 text-[10px] font-bold text-slate-700">
    ${item.data_selagem ? formatarDataBR(item.data_selagem) : "--/--/----"}
</td>

<td class="p-4 text-[10px] font-bold text-indigo-600 text-center">
    ${
      item.data_selagem
        ? (() => {
            const data = new Date(item.data_selagem);
            data.setFullYear(data.getFullYear() + 1);
            return data.toLocaleDateString("pt-BR");
          })()
        : "--/--/----"
    }
</td>


      <td class="p-4 text-slate-400 text-center">${item.selo_anterior || "-"}</td>
      <td class="p-4 text-slate-400 text-center">-</td>
      <td class="p-4 text-center">
        <div class="bg-slate-100 px-2 py-0.5 rounded text-[9px] font-black inline-block mb-1">NV ${item.nivel}</div>
        <div class="text-[9px] font-bold ${item.resultado === "REPROVADO" ? "text-red-500" : "text-emerald-500"}">
          ${item.resultado || "APROVADO"}
        </div>
      </td>
      <td class="p-4 text-center">
        <div class="flex items-center justify-center gap-2">
          <button onclick="prepararEdicao('${item.id}')" class="text-indigo-400 hover:text-indigo-600 transition-colors">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button onclick="deletarItem('${item.id}')" class="text-red-300 hover:text-red-600 transition-colors">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
`,
    )
    .join("");
}
async function registrarItem() {
  // 1. Pegar os valores básicos
  const dataSelagemVal = document.getElementById("data_selagem").value;
  const ultRetesteVal = document.getElementById("ult_reteste").value;
  const fabId = document.getElementById("fabricante_id").value;
  const nomeFabNoDisplay = document.getElementById("nomeFabricanteDisplay").innerText;

  // --- CORREÇÃO DA CAPACIDADE ---
  const selectCapacidade = document.getElementById("capacidade");
  // Tenta pegar o value, se estiver vazio, pega o texto da opção selecionada
  const valorCapacidade = selectCapacidade.value || (selectCapacidade.options[selectCapacidade.selectedIndex]?.text);
  // ------------------------------

  if (!fabId) {
    alert("Por favor, informe o fabricante.");
    return;
  }

  // 2. LÓGICA DE CÁLCULO
  let valorProxReteste = null;
  if (ultRetesteVal && ultRetesteVal.length === 4) {
    valorProxReteste = parseInt(ultRetesteVal) + 5; 
  }

  let valorProxRecarga = null;
  if (dataSelagemVal) {
    const dataObj = new Date(dataSelagemVal + "T00:00:00");
    dataObj.setFullYear(dataObj.getFullYear() + 1);
    valorProxRecarga = dataObj.toISOString().split("T")[0];
  }

  // Dentro de registrarItem
const payload = {
  os_number: currentOS,
  fabricante: nomeFabNoDisplay.replace("- ", ""),
  fabricante_id: parseInt(fabId),
  nr_cilindro: document.getElementById("nr_cilindro").value,
  ano_fab: document.getElementById("ano_fab").value, // Verifique se no banco é 'ano_fab' ou 'ano_fabrica'
  ult_reteste: ultRetesteVal,
  tipo_carga: document.getElementById("tipo_carga").value,
  capacidade: document.getElementById("capacidade").value,
  nivel: selectedLevel,
  data_selagem: dataSelagemVal,
  prox_reteste: valorProxReteste, 
  prox_recarga: valorProxRecarga,
  resultado: document.getElementById("resultado_valor")?.value || "APROVADO",
  selo_anterior: document.getElementById("selo_anterior")?.value || "",
  obs_ensaio: document.getElementById("obs_ensaio")?.value || ""
};

  console.log("Enviando para o banco:", payload);

  try {
    const { error } = await _supabase.from("itens_os").insert([payload]);
    if (error) throw error;

    console.log("✅ Salvo com sucesso!");
    
    // Limpar campos após sucesso
    if (typeof limparFormulario === "function") {
        limparFormulario();
    } else {
        // Fallback caso a função não exista
        document.getElementById("nr_cilindro").value = "";
        document.getElementById("cod_barras").value = "";
        document.getElementById("cod_barras").focus();
    }
    
    loadItens(); 
  } catch (error) {
    console.error("Erro técnico:", error);
    alert("Erro ao gravar no banco: " + error.message);
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (event.target.tagName === "TEXTAREA") return;
    event.preventDefault();

    // Lista a ordem dos campos para o Enter seguir
    const campos = [
      "cod_barras",
      "fabricante_id", // Campo novo do código
      "nr_cilindro",
      "ano_fab",
      "ult_reteste",
      "tipo_carga",
      "capacidade",
      "nbr_id"
    ];

    const index = campos.indexOf(event.target.id);
    if (index > -1 && index < campos.length - 1) {
      const proximo = document.getElementById(campos[index + 1]);
      if (proximo) proximo.focus();
    } else if (index === campos.length - 1) {
      registrarItem(); // No último campo, ele salva
    }
  }
});