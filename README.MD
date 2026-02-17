YaSe PRO - Sistema de Rastreabilidade de Extintores

Este documento detalha as funcionalidades e a conformidade técnica do sistema YaSe PRO, desenvolvido para atender aos requisitos rigorosos de manutenção de extintores de incêndio, com foco na norma NBR 12962 e inspirado em sistemas ERP de alta performance como o CADEX.

🚀 Funcionalidades Principais

O sistema foi estruturado para consolidar em uma única interface todas as etapas do processo de manutenção:

Cabeçalho de Ordem de Serviço (O.S.):

Vínculo direto com o número da O.S. e identificação do Proprietário/Cliente.

Controle de status do monitor ("Em Produção").

Identificação Completa do Equipamento:

Registro de Fabricante, Número de Série e Ano de Fabricação.

Histórico de Último Reteste (fundamental para cálculo automático do próximo ciclo).

Gestão de Conformidade Inmetro:

Campos para rastreio do Selo Anterior e geração do Selo Novo (NC).

Controle de lote do agente extintor (Pó PQS).

Ensaios Técnicos e Pesagem:

Cálculo de Massa: Diferenciação entre Peso Vazio (Tara) e Peso Cheio.

Registro de Pressão de Ensaio e resultado do teste hidrostático.

Checklist de Componentes:

Modal interativo para conferência de itens obrigatórios (Válvulas, Mangueiras, Manômetros, Lacres, etc).

📋 Conformidade com a NBR 12962

O sistema foi desenhado para assegurar que o registro de manutenção contenha os itens exigidos pela norma brasileira:

Item 5.1 (Identificação): Coleta todos os dados de marca, capacidade e carga.

Item 5.2 (Níveis de Manutenção): Permite a seleção clara entre Nível 1 (Inspeção), Nível 2 (Manutenção) e Nível 3 (Reteste).

Item 5.3 (Registros): Gera uma tabela de rastreabilidade que serve como base para o Relatório de Manutenção.

Cálculos Automáticos:

Próxima Recarga: Definida automaticamente para +1 ano a partir da data de execução.

Próximo Reteste: Calculado para +5 anos com base no ano do último ensaio hidrostático (conforme NBR 13485).

🛠 Estrutura Técnica

Interface: Desenvolvida com Tailwind CSS para um visual moderno, responsivo e de alta legibilidade (essencial para ambientes de oficina).

Lógica: JavaScript puro para manipulação de dados em tempo real na tabela de O.S. sem necessidade de recarregar a página.

Ícones: Utilização de FontAwesome 6 para facilitar a identificação visual dos campos técnicos.

💡 Como Utilizar

Início: Verifique os dados do cliente no cabeçalho.

Preenchimento: Insira os dados do cilindro no formulário. Caso realize a troca de peças, utilize o botão "Inspeção de Componentes".

Registro: Clique no botão "GRAVAR REGISTRO TÉCNICO". O item aparecerá instantaneamente na tabela inferior.

Gestão: A tabela exibirá em destaque (vermelho) o ano do próximo reteste e (verde) a data da próxima recarga.

Desenvolvido para garantir segurança, rastreabilidade e agilidade no processo de manutenção de equipamentos contra incêndio.





///////////////////////////////////////////////////////////////////

Roadmap de Produção: Gerador de Anexos YaSe PRO

Este documento detalha os requisitos necessários para transformar a interface atual em um sistema em conformidade com as normas brasileiras (INMETRO) e pronto para o ambiente de produção.

1. Conformidade Normativa (INMETRO)

Para que os anexos gerados sejam válidos, o sistema deve seguir a Portaria INMETRO nº 148/2022.

Anexo P (Relatório de Manutenção): Deve listar cronologicamente todos os serviços, selos aplicados, selos inutilizados e rastreabilidade dos componentes.

Anexo O (Registro de Selos): Deve focar no controle de estoque de selos (Lotes, Estoque Inicial, Consumo e Saldo).

Rastreabilidade: O banco de dados deve permitir a busca de qualquer extintor pelo número do selo ou número de série por um período mínimo de 5 anos.

2. Pilares Técnicos para Produção

A. Backend e Processamento

O arquivo index.html precisa de um servidor para processar os dados.

Tecnologia Sugerida: Node.js (Express), Python (Django/FastAPI) ou PHP (Laravel).

Geração de PDF: Utilizar bibliotecas como Puppeteer ou Playwright para renderizar o HTML exato das tabelas oficiais do INMETRO em PDF.

Validação: Implementar lógica para impedir que um selo seja usado em duas ordens de serviço diferentes.

B. Banco de Dados

Necessário para persistência e relatórios históricos.

Entidades Principais: - Empresa (Dados do prestador de serviço/IPEM).

Selo (Controle de lotes e status).

Manutencao (Registro completo do serviço).

Operador (Rastreabilidade de quem gerou o documento).

C. Segurança e LGPD

Criptografia: Todo o tráfego deve ser via HTTPS.

Autenticação: Sistema de login com níveis de acesso (Admin vs Operador).

Logs: Registrar quem gerou cada anexo e quando (importante para auditorias).

3. Próximos Passos (Checklist)

[ ] Mapeamento de Campos: Confirmar se todos os inputs do index.html cobrem as colunas exigidas pelo IPEM do seu estado.

[ ] Desenvolvimento da API: Criar o endpoint que recebe os dados do formulário.

[ ] Template de Impressão: Criar uma versão "limpa" (preto e branco) do HTML específica para a exportação do PDF, otimizada para papel A4.

[ ] Assinatura Digital: Avaliar a necessidade de integração com certificados ICP-Brasil para assinatura dos documentos.

Este documento é um guia de referência técnica baseado na estrutura atual do YaSe PRO.# Yase-Pro
# Yase-Pro
