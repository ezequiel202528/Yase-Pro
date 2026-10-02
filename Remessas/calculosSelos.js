// /**
//  * calculosSelos.js - VERSÃO REVISADA E BLINDADA
//  */

// document.addEventListener('DOMContentLoaded', () => {
//     if (document.getElementById("data_rec")) {
//         document.getElementById("data_rec").value = new Date().toISOString().split("T")[0];
//     }

//     const inInicio = document.getElementById('selo_inicio');
//     const inFim = document.getElementById('selo_fim');
//     if (inInicio && inFim) {
//         const calcularInput = () => {
//             const ini = parseInt(inInicio.value) || 0;
//             const fim = parseInt(inFim.value) || 0;
//             const campoQtd = document.getElementById('qtd_selos');
//             if (campoQtd) campoQtd.value = (fim >= ini && ini > 0) ? (fim - ini) + 1 : 0;
//         };
//         inInicio.addEventListener('input', calcularInput);
//         inFim.addEventListener('input', calcularInput);
//     }

//     carregarHistorico();
// });

// async function carregarHistorico() {
//     try {
//         const { data: todasRemessas, error } = await _supabase
//             .from('rem_essas')
//             .select('*')
//             .order('created_at', { ascending: false });

//         if (error) throw error;

//         const tabela = document.getElementById('lista-remessas');
//         if (tabela) {
//             tabela.innerHTML = '';
//             todasRemessas.forEach(lote => {
//                 const tr = document.createElement('tr');
//                 // Adicionado border-slate-800/50 para sutileza
//                 tr.className = "border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors";

//                 // Mapeamento corrigido: 7 colunas para bater com o <thead>
//                 tr.innerHTML = `
//                     <td class="p-5">${new Date(lote.data_rec).toLocaleDateString('pt-BR')}</td>
//                     <td class="p-5 text-amber-500 font-bold">${lote.selo_inicio}</td>
//                     <td class="p-5">${lote.selo_fim}</td>
//                     <td class="p-5 text-center font-black">${lote.qtd_selos}</td>
//                     <td class="p-5 text-slate-400 font-medium">${lote.documento || '---'}</td>
//                     <td class="p-5 text-center">
//                         <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
//                             lote.status_lote === 'ABERTO'
//                             ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
//                             : 'bg-slate-800 text-slate-500 border border-slate-700'
//                         }">${lote.status_lote}</span>
//                     </td>
//                     <td class="p-5 text-center">
//                         <div class="flex justify-center gap-3">
//                             <button onclick='prepararEdicao(${JSON.stringify(lote)})' class="text-blue-400 hover:text-blue-200 transition-colors">
//                                 <i class="fa-solid fa-pen-to-square text-sm"></i>
//                             </button>
//                             <button onclick="deletarLote('${lote.id}')" class="text-red-400 hover:text-red-300 transition-colors">
//                                 <i class="fa-solid fa-trash text-sm"></i>
//                             </button>
//                         </div>
//                     </td>`;
//                 tabela.appendChild(tr);
//             });
//         }

//         await atualizarResumoLotes();

//     } catch (err) {
//         console.error("Erro ao carregar histórico:", err);
//     }
// }

// async function salvarLote() {
//     const btn = document.querySelector('button[onclick="salvarLote()"]');
//     const docInput = document.getElementById('documento');
//     const numNota = docInput ? docInput.value.trim() : "";

//     if (!numNota || !document.getElementById('selo_inicio').value) {
//         alert("Preencha a NF-e e o intervalo de selos!");
//         return;
//     }

//     try {
//         btn.disabled = true;
//         btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Gravando...';

//         const dados = {
//             data_rec: document.getElementById('data_rec').value,
//             selo_inicio: parseInt(document.getElementById('selo_inicio').value),
//             selo_fim: parseInt(document.getElementById('selo_fim').value),
//             qtd_selos: parseInt(document.getElementById('qtd_selos').value),
//             documento: numNota,
//             status_lote: document.getElementById('status_lote').value
//         };

//         // Regra de Ouro: Se for abrir este, fecha todos os outros
//         if (dados.status_lote === 'ABERTO') {
//             await _supabase.from('rem_essas').update({ status_lote: 'FECHADO' }).eq('status_lote', 'ABERTO');
//         }

//         let query;
//         if (window.editandoLoteId) {
//             query = await _supabase.from('rem_essas').update(dados).eq('id', window.editandoLoteId);
//         } else {
//             query = await _supabase.from('rem_essas').insert([dados]);
//         }

//         if (query.error) throw query.error;

//         alert("Lote Processado!");
//         limparFormulario();
//         carregarHistorico();

//     } catch (err) {
//         console.error("Erro técnico:", err);
//         alert("Erro ao salvar. Verifique se as colunas no Supabase estão corretas.");
//     } finally {
//         btn.disabled = false;
//         btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Gravar Lote';
//     }
// }

// async function atualizarResumoLotes() {
//     try {
//         // Busca apenas a nota que manda no sistema
//         const { data: loteAtivo } = await _supabase
//             .from('rem_essas')
//             .select('*')
//             .eq('status_lote', 'ABERTO')
//             .maybeSingle();

//         const inTotal = document.getElementById('resumo_total');
//         const inUtilizados = document.getElementById('resumo_utilizados');
//         const inEstoque = document.getElementById('resumo_estoque');

//         if (!loteAtivo) {
//             if (inTotal) inTotal.value = 0;
//             if (inUtilizados) inUtilizados.value = 0;
//             if (inEstoque) inEstoque.value = 0;
//             return;
//         }

//         // Conta selos usados NO INTERVALO desta NF-e
//         const { count: usados } = await _supabase
//             .from('itens_os')
//             .select('*', { count: 'exact', head: true })
//             .gte('selo_inmetro', loteAtivo.selo_inicio)
//             .lte('selo_inmetro', loteAtivo.selo_fim);

//         const totalNota = parseInt(loteAtivo.qtd_selos) || 0;
//         const utilizadoNota = usados || 0;
//         const estoqueNota = totalNota - utilizadoNota;

//         if (inTotal) inTotal.value = totalNota;
//         if (inUtilizados) inUtilizados.value = utilizadoNota;
//         if (inEstoque) {
//             inEstoque.value = estoqueNota;
//             inEstoque.style.backgroundColor = estoqueNota <= 0 ? '#ef4444' : '#10b981';
//             inEstoque.style.color = '#fff';
//         }
//     } catch (err) {
//         console.error("Erro no resumo:", err);
//     }
// }

// function limparFormulario() {
//     window.editandoLoteId = null;
//     document.getElementById('selo_inicio').value = '';
//     document.getElementById('selo_fim').value = '';
//     document.getElementById('qtd_selos').value = '';
//     document.getElementById('documento').value = '';
//     document.getElementById('status_lote').value = 'ABERTO';
//     const btn = document.querySelector('button[onclick="salvarLote()"]');
//     if (btn) btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Gravar Lote';
// }

// function prepararEdicao(lote) {
//     window.editandoLoteId = lote.id;
//     document.getElementById('data_rec').value = lote.data_rec;
//     document.getElementById('selo_inicio').value = lote.selo_inicio;
//     document.getElementById('selo_fim').value = lote.selo_fim;
//     document.getElementById('qtd_selos').value = lote.qtd_selos;
//     document.getElementById('documento').value = lote.documento || '';
//     document.getElementById('status_lote').value = lote.status_lote;
//     const btn = document.querySelector('button[onclick="salvarLote()"]');
//     if (btn) btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Atualizar Lote';
// }

// async function deletarLote(id) {
//     if (confirm("Excluir esta remessa?")) {
//         await _supabase.from('rem_essas').delete().eq('id', id);
//         carregarHistorico();
//     }
// }

import { _supabase } from "./main.js";

/**
 * calculosSelos.js - VERSÃO OTIMIZADA PARA CONTROLE PARTICULAR (CADEX)
 * Lógica: Prefixo + Numeração (1 a 500.000)
 */

const TETO_MAXIMO = 500000;

document.addEventListener("DOMContentLoaded", () => {
  // Define a data atual por padrão
  if (document.getElementById("data_rec")) {
    document.getElementById("data_rec").value = new Date()
      .toISOString()
      .split("T")[0];
  }

  // Seletores dos inputs
  const inInicio = document.getElementById("selo_inicio");
  const inFim = document.getElementById("selo_fim");
  const inPrefixo = document.getElementById("prefixo");
  const campoQtd = document.getElementById("qtd_selos");

  const calcularIntervalo = () => {
    const ini = parseInt(inInicio.value) || 0;
    const fim = parseInt(inFim.value) || 0;

    // Validação de Teto (Bloqueia se passar de 500k)
    if (ini > TETO_MAXIMO || fim > TETO_MAXIMO) {
      alert(
        `Atenção: A numeração particular para cada prefixo deve ir até ${TETO_MAXIMO.toLocaleString()}.`,
      );
      if (ini > TETO_MAXIMO) inInicio.value = TETO_MAXIMO;
      if (fim > TETO_MAXIMO) inFim.value = TETO_MAXIMO;
      return;
    }

    if (campoQtd) {
      campoQtd.value = fim >= ini && ini > 0 ? fim - ini + 1 : 0;
    }
  };

  if (inInicio && inFim) {
    inInicio.addEventListener("input", calcularIntervalo);
    inFim.addEventListener("input", calcularIntervalo);
  }

  carregarHistorico();
});

async function carregarHistorico() {
  try {
    const { data: todasRemessas, error } = await _supabase
      .from("rem_essas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const tabela = document.getElementById("lista-remessas");
    if (tabela) {
      tabela.innerHTML = "";
      todasRemessas.forEach((lote) => {
        const tr = document.createElement("tr");
        tr.className =
          "border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors";

        // Mapeamento de 7 colunas alinhadas
        tr.innerHTML = `
                    <td class="p-5">${new Date(lote.data_rec).toLocaleDateString("pt-BR")}</td>
                    <td class="p-5 text-amber-500 font-bold">
                        <span class="text-slate-500 text-[9px] mr-1">${lote.prefixo || ""}</span>${lote.selo_inicio}
                    </td>
                    <td class="p-5 font-medium">
                        <span class="text-slate-500 text-[9px] mr-1">${lote.prefixo || ""}</span>${lote.selo_fim}
                    </td>
                    <td class="p-5 text-center font-black">${lote.qtd_selos}</td>
                    <td class="p-5 text-slate-400">${lote.documento || "---"}</td>
                    <td class="p-5 text-center">
                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          lote.status_lote === "ABERTO"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }">${lote.status_lote}</span>
                    </td>
                    <td class="p-5 text-center">
                        <div class="flex justify-center gap-3">
                            <button onclick='prepararEdicao(${JSON.stringify(lote)})' class="text-blue-400 hover:text-blue-200">
                                <i class="fa-solid fa-pen-to-square text-sm"></i>
                            </button>
                            <button onclick="deletarLote('${lote.id}')" class="text-red-400 hover:text-red-200">
                                <i class="fa-solid fa-trash text-sm"></i>
                            </button>
                        </div>
                    </td>`;
        tabela.appendChild(tr);
      });
    }

    await atualizarResumoLotes();
  } catch (err) {
    console.error("Erro ao carregar histórico:", err);
  }
}

async function salvarLote() {
  const btn = document.querySelector('button[onclick="salvarLote()"]');
  const docInput = document.getElementById("documento");
  const prefixoInput = document.getElementById("prefixo");

  const numNota = docInput ? docInput.value.trim() : "";
  const prefixo = prefixoInput ? prefixoInput.value.toUpperCase().trim() : "";

  if (!numNota || !prefixo || !document.getElementById("selo_inicio").value) {
    alert("Preencha o Prefixo, a NF-e e o intervalo de selos!");
    return;
  }

  try {
    btn.disabled = true;
    btn.innerHTML =
      '<i class="fa-solid fa-spinner animate-spin"></i> Gravando...';

    const dados = {
      data_rec: document.getElementById("data_rec").value,
      prefixo: prefixo,
      selo_inicio: parseInt(document.getElementById("selo_inicio").value),
      selo_fim: parseInt(document.getElementById("selo_fim").value),
      qtd_selos: parseInt(document.getElementById("qtd_selos").value),
      documento: numNota,
      status_lote: document.getElementById("status_lote").value,
    };

    // Se o novo lote for ABERTO, fecha os outros no Supabase
    if (dados.status_lote === "ABERTO") {
      const { error: erroAoFechar } = await _supabase
        .from("rem_essas")
        .update({ status_lote: "FECHADO" })
        .eq("status_lote", "ABERTO");
      if (erroAoFechar) throw erroAoFechar;
    }

    let query;
    if (window.editandoLoteId) {
      query = await _supabase
        .from("rem_essas")
        .update(dados)
        .eq("id", window.editandoLoteId);
    } else {
      query = await _supabase.from("rem_essas").insert([dados]);
    }

    if (query.error) throw query.error;

    alert("Lote Processado com Sucesso!");
    limparFormulario();
    carregarHistorico();
  } catch (err) {
    console.error("Erro técnico:", err);
    const erro = err && typeof err === "object" ? err : {};
    const detalhes = [
      erro.message,
      erro.details,
      erro.hint,
      erro.code ? `Código: ${erro.code}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    alert(
      `Erro ao salvar a remessa${detalhes ? `:\n${detalhes}` : ". Verifique o console do navegador para mais detalhes."}`,
    );
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Gravar Lote';
  }
}

async function atualizarResumoLotes() {
  try {
    // Puxa o lote que está atualmente em uso
    const { data: loteAtivo } = await _supabase
      .from("rem_essas")
      .select("*")
      .eq("status_lote", "ABERTO")
      .maybeSingle();

    const inTotal = document.getElementById("resumo_total");
    const inUtilizados = document.getElementById("resumo_utilizados");
    const inEstoque = document.getElementById("resumo_estoque");

    if (!loteAtivo) {
      if (inTotal) inTotal.value = 0;
      if (inUtilizados) inUtilizados.value = 0;
      if (inEstoque) inEstoque.value = 0;
      return;
    }

    // Busca selos usados que pertençam ao mesmo prefixo e intervalo
    const { count: usados } = await _supabase
      .from("itens_os")
      .select("*", { count: "exact", head: true })
      .eq("prefixo_selo", loteAtivo.prefixo) // Filtra pelo prefixo (A, B, C...)
      .gte("selo_inmetro", loteAtivo.selo_inicio)
      .lte("selo_inmetro", loteAtivo.selo_fim);

    const totalNota = parseInt(loteAtivo.qtd_selos) || 0;
    const utilizadoNota = usados || 0;
    const estoqueNota = totalNota - utilizadoNota;

    if (inTotal) inTotal.value = totalNota;
    if (inUtilizados) inUtilizados.value = utilizadoNota;
    if (inEstoque) {
      inEstoque.value = estoqueNota;
      inEstoque.style.backgroundColor =
        estoqueNota <= 10 ? "#ef4444" : "#10b981";
      inEstoque.style.color = "#fff";
    }
  } catch (err) {
    console.error("Erro ao atualizar resumo:", err);
  }
}

function limparFormulario() {
  window.editandoLoteId = null;
  document.getElementById("prefixo").value = "";
  document.getElementById("selo_inicio").value = "";
  document.getElementById("selo_fim").value = "";
  document.getElementById("qtd_selos").value = "";
  document.getElementById("documento").value = "";
  document.getElementById("status_lote").value = "ABERTO";
  const btn = document.querySelector('button[onclick="salvarLote()"]');
  if (btn)
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Gravar Lote';
}

function prepararEdicao(lote) {
  window.editandoLoteId = lote.id;
  document.getElementById("data_rec").value = lote.data_rec;
  document.getElementById("prefixo").value = lote.prefixo || "";
  document.getElementById("selo_inicio").value = lote.selo_inicio;
  document.getElementById("selo_fim").value = lote.selo_fim;
  document.getElementById("qtd_selos").value = lote.qtd_selos;
  document.getElementById("documento").value = lote.documento || "";
  document.getElementById("status_lote").value = lote.status_lote;
  const btn = document.querySelector('button[onclick="salvarLote()"]');
  if (btn)
    btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Atualizar Lote';
}

async function deletarLote(id) {
  if (confirm("Tem certeza que deseja excluir esta remessa?")) {
    const { error } = await _supabase.from("rem_essas").delete().eq("id", id);
    if (!error) carregarHistorico();
  }
}

window.carregarHistorico = carregarHistorico;
window.salvarLote = salvarLote;
window.atualizarResumoLotes = atualizarResumoLotes;
window.limparCampos = limparFormulario;
window.limparFormulario = limparFormulario;
window.prepararEdicao = prepararEdicao;
window.deletarLote = deletarLote;
