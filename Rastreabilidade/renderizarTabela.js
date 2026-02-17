// ATENÇÃO: Não declare SUPABASE_URL ou _supabase aqui.
// Eles já vêm do main.js automaticamente.

/**
 * RASTREABILIDADE - YA SE PRO
 * renderizarTabela.js: Gestão da lista e gravação de itens
 */

function renderItens(itens) {
  const list = document.getElementById("itensList");
  const counter = document.getElementById("itemCounter");
  if (counter) counter.innerText = itens.length;

  if (!itens || itens.length === 0) {
    list.innerHTML = `<tr><td colspan="13" class="p-10 text-center text-slate-400 italic">Nenhum item registrado.</td></tr>`;
    return;
  }

 list.innerHTML = itens.map((item) => {
    // Lógica para as 3 letras do Status
    const statusRaw = item.resultado || "APROVADO";
    const statusResumo = statusRaw.substring(0, 3).toUpperCase();
    const statusColor = statusResumo === 'REP' ? 'text-red-500' : 'text-emerald-500';

    return `
        <tr class="border-b hover:bg-slate-50 transition-colors text-[11px]">
            <td class="p-4 font-mono font-black text-indigo-700">${item.id ? item.id.toString().substring(0, 8).toUpperCase() : "-"}</td>
            <td class="p-4 font-bold text-slate-800">${item.fabricante || "-"}</td>
            <td class="p-4 font-bold text-slate-500">${item.nbr_id || "N/A"}</td>
            <td class="p-4 font-medium">${item.nr_cilindro || "-"}</td>
            
            <td class="p-4 text-indigo-600 font-bold">
                ${item.tipo_carga || "-"} / ${item.capacidade || "-"}
            </td>

            <td class="p-4 text-center">${item.ano_fab || "-"}</td>
            <td class="p-4 text-center">${item.ult_reteste || "-"}</td>
            <td class="p-4 text-red-600 font-black text-center bg-red-50/50">${item.prox_reteste || "---"}</td>
            <td class="p-4 text-center">${item.data_selagem ? new Date(item.data_selagem + "T12:00:00").toLocaleDateString("pt-BR") : "--/--/----"}</td>
            <td class="p-4 text-indigo-700 font-black text-center bg-indigo-50/50">${item.prox_recarga ? new Date(item.prox_recarga + "T12:00:00").toLocaleDateString("pt-BR") : "--/--/----"}</td>
            
            <td class="p-4 text-center italic text-slate-400">---</td> <td class="p-4 text-center font-medium text-slate-600">
                ${item.operador || "-"}
            </td>

            <td class="p-4 text-center">
                <div class="flex flex-col items-center gap-0.5">
                    <span class="bg-slate-100 px-2 py-0.5 rounded text-slate-500 text-[8px] font-black uppercase">
                        NV ${item.nivel || "1"}
                    </span>
                    <span class="${statusColor} text-[9px] font-black tracking-widest">
                        ${statusResumo}
                    </span>
                </div>
            </td>

            <td class="p-4 text-center pr-4">
                <div class="flex gap-2 justify-center">
                    <button onclick="prepararEdicao('${item.id}')" class="text-indigo-400 hover:scale-125 transition-all"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="deletarItem('${item.id}')" class="text-red-300 hover:scale-125 transition-all"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `;
}).join("");
}
async function registrarItem() {
  console.log("Iniciando gravação...");
  try {
    const fabId = document.getElementById("X_input_id").value;
    const nomeFab =
      document.getElementById("badgeNomeFabricante")?.innerText || "N/I";
    const nrCilindro = document.getElementById("nr_cilindro").value;
    const ultReteste = document.getElementById("ult_reteste").value;
    const dataSelagem = document.getElementById("data_selagem").value;

    // --- LOGICA PARA PEGAR APENAS O NÚMERO DA NBR ---
    const nbrSelect = document.getElementById("nbr_select");
    const nbrTextoCompleto = nbrSelect.options[nbrSelect.selectedIndex].text;
    // Se o texto for "15808 - PQS", o split pega só "15808"
    const nbrApenasNumero = nbrTextoCompleto.split(" - ")[0].trim();

    if (!fabId) {
      alert("Informe o fabricante!");
      return;
    }

    // CÁLCULOS AUTOMÁTICOS
    let vProxReteste = null;
    if (ultReteste && ultReteste.length === 4) {
      vProxReteste = parseInt(ultReteste) + 5;
    }

    let vProxRecarga = null;
    if (dataSelagem) {
      let d = new Date(dataSelagem + "T12:00:00");
      d.setFullYear(d.getFullYear() + 1);
      vProxRecarga = d.toISOString().split("T")[0];
    }

    const payload = {
      os_number: typeof currentOS !== "undefined" ? currentOS : null,
      fabricante: nomeFab.replace("- ", "").trim(),
      fabricante_id: parseInt(fabId),
      nr_cilindro: nrCilindro,
      ano_fab: document.getElementById("ano_fab").value,
      ult_reteste: ultReteste,
      prox_reteste: vProxReteste,
      data_selagem: dataSelagem,
      prox_recarga: vProxRecarga,
      tipo_carga: document.getElementById("tipo_carga").value,
      capacidade: document.getElementById("capacidade").value,
      nbr_id: nbrApenasNumero, // SALVANDO APENAS O NÚMERO (Ex: 15808)
      nivel: typeof selectedLevel !== "undefined" ? selectedLevel : 1,
      selo_anterior: document.getElementById("selo_anterior").value,
      resultado:
        document.getElementById("resultado_valor")?.value || "APROVADO",
      obs_ensaio: document.getElementById("obs_ensaio").value,
    };

    const { error } = await _supabase.from("itens_os").insert([payload]);
    if (error) throw error;

    // Limpeza
    document.getElementById("nr_cilindro").value = "";
    const cb = document.getElementById("cod_barras");
    if (cb) {
      cb.value = "";
      cb.focus();
    }

    if (typeof loadItens === "function") loadItens();
  } catch (err) {
    console.error("Erro no registro:", err);
    alert("Erro ao salvar: " + err.message);
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (event.target.tagName === "TEXTAREA") return;
    event.preventDefault();

    const campos = [
      "cod_barras",
      "X_input_id",
      "nr_cilindro",
      "ano_fab",
      "ult_reteste",
      "tipo_carga",
      "capacidade",
      "nbr_select",
    ];

    const index = campos.indexOf(event.target.id);
    if (index > -1 && index < campos.length - 1) {
      const proximo = document.getElementById(campos[index + 1]);
      if (proximo) proximo.focus();
    } else if (index === campos.length - 1) {
      registrarItem();
    }
  }
});
