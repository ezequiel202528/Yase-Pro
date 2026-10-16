// 

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
        estoque: "./estoquePecas.html",
        // Adicionadas as novas telas para o Vite compilar no Vercel:
        vendedores: "./Vendedores.html",
        loginVendedor: "./LoginVendedor.html",
      },
    },
  },
});