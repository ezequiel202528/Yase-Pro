// 

// import { defineConfig } from "vite";

// export default defineConfig({
//   build: {
//     rollupOptions: {
//       input: {
//         main: "./index.html",
//         dashboard: "./Dashboard.html",
//         cadastro: "./CadastroUsuario.html",
//         gestao: "./GestaoOS.html",
//         rastreio: "./Rastreio_Full.html",
//         configuracao: "./configuracoes.html",
//         anexoOeP: "./AnexoOeP.html",
//         remessas: "./Remessa.html",
//         controleDeCargas: "./ControleDeCargas.html",
//         vinculacao: "./Vinculacao.html",
//         estoque: "./estoquePecas.html",
//         vendedores: "./Vendedores.html",
//         loginVendedor: "./LoginVendedor.html",
//         painelVendedor: "./PainelVendedor.html", 
//       },
//     },
//   },
// });

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        dashboard: "./Dashboard.html",
        cadastro: "./CadastroUsuario.html",
        gestao: "./GestaoOS.html",
        rastreio: "./Rastreio_Full.html",
        configuracao: "./configuracoes.html",
        anexoOeP: "./AnexoOeP.html",
        remessas: "./Remessa.html",
        controleDeCargas: "./ControleDeCargas.html",
        vinculacao: "./Vinculacao.html",
        vendedores: "./Vendedores.html",
        loginVendedor: "./LoginVendedor.html",
        painelVendedor: "./PainelVendedor.html",
        historicoDemandas: "./HistoricoDemandas.html",
      },
    },
  },
});