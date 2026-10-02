Configuração mínima do Vite para o app "Rastreio de Extintores".

Comandos úteis:

```bash
npm install
npm run dev:vite    # roda o servidor Vite em minhaApp-win32-x64/resources/app
npm run build:vite  # gera os arquivos em dist/app
npm run preview:vite # serve a build gerada
```

Observações:

- Em desenvolvimento, rode `npm run dev:vite` e abra o navegador em http://localhost:5173.
- Para integrar com Electron em dev, é preciso carregar a URL do Vite no `BrowserWindow`.
