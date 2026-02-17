/**
         * CONFIGURAÇÕES GLOBAIS
         */
        const CONFIG = {
            tiposExtintores: ["Pó 4kg BC", "Pó 4kg ABC","Pó 6kg BC","Pó 6kg ABC", "Pó 8kg BC", "Pó 8kg ABC", "Pó 12kg BC", "Pó 12kg ABC", "CO2 4kg", "CO2 6kg", "CO2 10kg", "EP 10L", "AP 10L"],
            tempoExpiracaoAtraso: 120000, // 2 minutos
        };

        /**
         * MÓDULO DE PERSISTÊNCIA (STORAGE)
         */
        const Storage = {
            saveCargas: (data) => localStorage.setItem('cargas', JSON.stringify(data)),
            getCargas: () => JSON.parse(localStorage.getItem('cargas')) || [],
            saveVendedores: (data) => localStorage.setItem('vendedores', JSON.stringify(data)),
            getVendedores: () => JSON.parse(localStorage.getItem('vendedores')) || ["Vendedor Padrão"]
        };

        /**
         * MÓDULO DE LÓGICA DE NEGÓCIO (CARGA SERVICE)
         */
        const CargaService = {
            cargas: Storage.getCargas(),
            vendedores: Storage.getVendedores(),
            itensTemporarios: [],

            adicionarVendedor: function() {
                const input = document.getElementById('inputNovoVendedor');
                const nome = input.value.trim();
                if (nome && !this.vendedores.includes(nome)) {
                    this.vendedores.push(nome);
                    Storage.saveVendedores(this.vendedores);
                    input.value = '';
                    AppUI.atualizarInterfaceVendedores();
                }
            },

            excluirVendedor: function(nome) {
                this.vendedores = this.vendedores.filter(v => v !== nome);
                Storage.saveVendedores(this.vendedores);
                AppUI.atualizarInterfaceVendedores();
            },

            adicionarItemTemporario: function() {
                const selectTipo = document.getElementById('selectTipoExtintor');
                const inputQtd = document.getElementById('inputQtdItem');
                const tipo = selectTipo.value;
                const qtd = parseInt(inputQtd.value);

                if (!tipo || !qtd || qtd <= 0) return;
                
                this.itensTemporarios.push({ tipo, qtd });
                AppUI.atualizarListaTemporaria();

                // Limpa campos
                selectTipo.value = "";
                inputQtd.value = "";
            },

            gerarCardCarga: function() {
                const v = document.getElementById('selectVendedor').value;
                const l = document.getElementById('inputLocalDestino').value;
                const nf = document.getElementById('inputNF').value;
                if (!v || !this.itensTemporarios.length) return;

                const agora = new Date();
                const novaCarga = {
                    id: Date.now(),
                    vendedor: v,
                    nf: nf || '000',
                    cliente: l || 'Cliente não identificado',
                    itens: [...this.itensTemporarios],
                    status: 'pendente',
                    timestamp: agora.getTime(),
                    horaGerado: agora.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}),
                    dataGerado: agora.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})
                };

                this.cargas.unshift(novaCarga);
                Storage.saveCargas(this.cargas);
                AppUI.fecharModalCarga();
                AppUI.renderizarCards();
            },

            toggleStatus: function(id) {
                const c = this.cargas.find(x => x.id === id);
                if (!c) return;
                const agora = new Date();

                if (c.status === 'concluido') {
                    c.status = 'pendente'; 
                    c.timestamp = Date.now();
                    c.horaFinalizacao = null; 
                    c.dataFinalizacao = null;
                } else {
                    c.status = 'concluido';
                    c.horaFinalizacao = agora.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
                    c.dataFinalizacao = agora.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'});
                }
                Storage.saveCargas(this.cargas);
                AppUI.renderizarCards();
            },

            excluirCarga: function(id) {
                this.cargas = this.cargas.filter(x => x.id !== id);
                Storage.saveCargas(this.cargas);
                AppUI.renderizarCards();
            },

            verificarAtrasosAutomaticos: function() {
                const agora = Date.now();
                let mudou = false;
                this.cargas.forEach(c => {
                    if (c.status === 'pendente' && (agora - c.timestamp >= CONFIG.tempoExpiracaoAtraso)) {
                        c.status = 'atraso';
                        mudou = true;
                    }
                });
                if (mudou) {
                    Storage.saveCargas(this.cargas);
                    AppUI.renderizarCards();
                }
            }
        };

        /**
         * MÓDULO DE INTERFACE (UI)
         */
        const AppUI = {
            init: function() {
                this.popularTiposExtintores();
                this.atualizarInterfaceVendedores();
                this.renderizarCards();
                setInterval(() => CargaService.verificarAtrasosAutomaticos(), 10000);
                lucide.createIcons();
            },

            popularTiposExtintores: function() {
                const select = document.getElementById('selectTipoExtintor');
                CONFIG.tiposExtintores.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t; opt.textContent = t;
                    select.appendChild(opt);
                });
            },

            abrirModalCarga: () => document.getElementById('modalCarga').classList.remove('hidden'),
            
            fecharModalCarga: function() {
                document.getElementById('modalCarga').classList.add('hidden');
                CargaService.itensTemporarios = [];
                document.getElementById('inputLocalDestino').value = '';
                document.getElementById('inputNF').value = '';
                document.getElementById('selectTipoExtintor').value = "";
                document.getElementById('inputQtdItem').value = "";
                this.atualizarListaTemporaria();
            },

            toggleConfigVendedores: () => document.getElementById('secaoVendedores').classList.toggle('hidden'),

            atualizarInterfaceVendedores: function() {
                const lista = document.getElementById('listaVendedoresAtivos');
                const select = document.getElementById('selectVendedor');
                lista.innerHTML = CargaService.vendedores.map(v => `
                    <div class="bg-slate-700 text-slate-100 flex items-center gap-2 pl-4 pr-2 py-2 rounded-lg text-xs font-bold border border-slate-600">
                        ${v} <button onclick="CargaService.excluirVendedor('${v}')" class="p-1 hover:text-red-400"><i data-lucide="x" class="w-4 h-4"></i></button>
                    </div>
                `).join('');
                select.innerHTML = '<option value="">Selecione...</option>' + CargaService.vendedores.map(v => `<option value="${v}">${v}</option>`).join('');
                lucide.createIcons();
            },

            atualizarListaTemporaria: function() {
                const container = document.getElementById('containerResumo');
                const lista = document.getElementById('listaTemporaria');
                if (!CargaService.itensTemporarios.length) { container.classList.add('hidden'); return; }
                container.classList.remove('hidden');
                lista.innerHTML = CargaService.itensTemporarios.map((item, idx) => `
                    <li class="flex justify-between bg-white p-3 rounded-xl border border-slate-200">
                        <span class="text-sm font-medium"><strong>${item.qtd}x</strong> ${item.tipo}</span>
                        <button onclick="CargaService.itensTemporarios.splice(${idx},1);AppUI.atualizarListaTemporaria()" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                    </li>
                `).join('');
                lucide.createIcons();
            },

            scrollColumn: (id, direction) => {
                const el = document.getElementById(id);
                el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' });
            },

            showToast: function(mensagem) {
                const container = document.getElementById('toastContainer');
                const toast = document.createElement('div');
                toast.className = 'bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-fade-in border border-slate-700 flex items-center gap-3';
                toast.innerHTML = `<i data-lucide="info" class="text-blue-400 w-5 h-5"></i> ${mensagem}`;
                container.appendChild(toast);
                lucide.createIcons();
                setTimeout(() => {
                    toast.classList.add('opacity-0', 'translate-y-4');
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            },

            renderizarCards: function() {
                const termo = document.getElementById('inputBusca').value.toLowerCase();
                const cols = { 
                    atraso: document.getElementById('colunaAtraso'), 
                    pendente: document.getElementById('colunaPendente'), 
                    concluido: document.getElementById('colunaConcluido') 
                };
                const counts = { atraso: 0, pendente: 0, concluido: 0 };
                
                Object.values(cols).forEach(c => c.innerHTML = '');

                const filtradas = CargaService.cargas.filter(c => 
                    c.cliente.toLowerCase().includes(termo) || 
                    c.vendedor.toLowerCase().includes(termo) || 
                    String(c.nf).includes(termo)
                );
                
                filtradas.forEach(carga => {
                    counts[carga.status]++;
                    const totalItems = carga.itens.reduce((acc, i) => acc + i.qtd, 0);
                    const borderClass = carga.status === 'concluido' ? 'border-emerald-500' : (carga.status === 'atraso' ? 'border-red-500' : 'border-amber-400');
                    
                    const cardHTML = `
                        <div class="card-container animate-fade-in">
                            <div class="card-content bg-white rounded-2xl shadow-md border-l-4 ${borderClass} border border-slate-200 p-5 flex flex-col justify-between">
                                <div>
                                    <div class="flex justify-between items-start mb-3">
                                        <div class="truncate pr-4">
                                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Responsável</span>
                                            <h3 class="font-black text-base text-slate-800 uppercase truncate leading-tight">${carga.vendedor}</h3>
                                        </div>
                                        <button onclick="CargaService.excluirCarga(${carga.id})" class="text-slate-300 hover:text-red-500 transition-colors p-1"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                                    </div>
                                    
                                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 shadow-inner">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="text-[10px] font-black text-blue-400 uppercase">Destino / Cliente</span>
                                        </div>
                                        <div class="flex items-center justify-between gap-3">
                                            <p class="text-sm font-black text-blue-900 uppercase truncate flex-1">${carga.cliente}</p>
                                            <span class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-lg font-black tracking-tight shadow-md shadow-blue-200 whitespace-nowrap">
                                                NF ${carga.nf}
                                            </span>
                                        </div>
                                    </div>

                                    <div class="space-y-1.5 mb-4 max-h-32 overflow-y-auto custom-scroll pr-1">
                                        ${carga.itens.map(i => `<div class="card-item-row"><span class="text-[11px] font-bold text-slate-600 uppercase">${i.tipo}</span><span class="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">${i.qtd}</span></div>`).join('')}
                                    </div>
                                </div>
                                <div>
                                    <div class="grid grid-cols-2 gap-2 mb-4">
                                        <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                                            <span class="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Criado em</span>
                                            <p class="text-[10px] font-black text-slate-700">${carga.dataGerado}</p>
                                            <p class="text-[11px] font-black text-slate-800">${carga.horaGerado}</p>
                                        </div>
                                        <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                                            <span class="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Finalizado</span>
                                            <p class="text-[10px] font-black ${carga.dataFinalizacao?'text-emerald-500':'text-slate-300'}">${carga.dataFinalizacao || '--/--'}</p>
                                            <p class="text-[11px] font-black ${carga.horaFinalizacao?'text-emerald-600':'text-slate-300'}">${carga.horaFinalizacao || '--:--'}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between border-t border-slate-100 pt-4">
                                        <div class="flex items-center justify-center border-2 border-blue-600 rounded-xl px-4 py-2 bg-blue-50/30">
                                            <div class="flex flex-col items-center">
                                                <span class="text-[8px] font-black text-blue-600 uppercase leading-none mb-0.5">TOTAL</span>
                                                <span class="text-xl font-black text-red-600 leading-none">${totalItems}</span>
                                            </div>
                                        </div>
                                        
                                        <div class="flex gap-2">
                                           ${carga.status !== 'concluido' ? `
                                                <a href="Rastreio.html?nf=${carga.nf}" class="px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                                                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Demandar
                                                </a>
                                            ` : ''}
                                            <button onclick="CargaService.toggleStatus(${carga.id})" class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${carga.status==='concluido'?'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200':'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}">${carga.status==='concluido'?'Reabrir':'Concluir'}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    cols[carga.status].innerHTML += cardHTML;
                });
                
                this.renderizarEmptyStates(counts, cols);
                this.atualizarContadores(counts);
                lucide.createIcons();
            },

            renderizarEmptyStates: function(counts, cols) {
                const emptyConfigs = {
                    atraso: { icon: 'smile', text: 'Tudo sob controle. Nenhuma pendência crítica por aqui.' },
                    pendente: { icon: 'sparkles', text: 'Aguardando novos desafios. Que tal registrar uma carga?' },
                    concluido: { icon: 'rocket', text: 'O dia promete! Vamos começar as entregas?' }
                };

                Object.keys(cols).forEach(key => {
                    if (counts[key] === 0) {
                        cols[key].innerHTML = `
                            <div class="empty-state-card animate-fade-in">
                                <i data-lucide="${emptyConfigs[key].icon}" class="w-12 h-12 mb-4 opacity-20"></i>
                                <p class="text-sm font-medium leading-relaxed opacity-60">${emptyConfigs[key].text}</p>
                            </div>
                        `;
                    }
                });
            },

            atualizarContadores: function(counts) {
                document.getElementById('countAtraso').textContent = counts.atraso;
                document.getElementById('countPendente').textContent = counts.pendente;
                document.getElementById('countConcluido').textContent = counts.concluido;
            }
        };

        // Inicializa o sistema no carregamento
        window.onload = () => AppUI.init();