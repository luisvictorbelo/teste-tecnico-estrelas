# Teste técnico para vaga de Desenvolvedor de Automações - Estrelas Internet

CLI em Node.js e TypeScript desenvolvida para o teste técnico da Estrelas Internet. A ferramenta processa um arquivo CSV de migração de planos, valida as regras de negócio contra a base SQLite, atualiza os contratos válidos e gera o relatório `relatorio_nao_atualizados.csv` com as linhas rejeitadas e seus motivos.

---

## Como executar

### Pré-requisitos
* Node.js 18 ou superior
* npm

### 1. Instalação das dependências
```bash
npm install
```

### 2. Criação do banco de dados
Antes de rodar a automação pela primeira vez, inicialize a base SQLite a partir do script `seed.sql`:
```bash
npm run seed
```
> Esse script é idempotente. Ele apaga e recria as tabelas `planos` e `contratos` com os 15 registros iniciais, facilitando resetar o ambiente durante os testes.

### 3. Execução da automação
Passe o caminho do arquivo CSV como argumento na linha de comando:
```bash
npm start -- "./migracoes_planos (1).csv"
```
*(ou para qualquer outro CSV no mesmo formato: `npm start -- ./caminho/do/arquivo.csv`)*

Ao término da execução, o terminal exibe o resumo com o total de linhas lidas, atualizadas e rejeitadas, e o arquivo `relatorio_nao_atualizados.csv` é gerado na raiz do projeto.

### 4. Testes automatizados
Para rodar a suíte de testes unitários:
```bash
npm test
```

Para rodar a checagem de linter e formatação:
```bash
npm run check
```

---

## Decisões de Projeto e Arquitetura

Optei por uma estrutura limpa e modular em `src/`, separando bem as responsabilidades de cada etapa:

### Inversão de dependência no Validador
A classe `Validator` concentra toda a lógica das 8 regras do teste. Para não acoplá-la diretamente ao SQLite (o que dificultaria os testes), defini interfaces de repositório (`getContratoByIdRepository` e `getPlanoByIdRepository`). 
Dessa forma, a regra de negócio depende apenas do contrato da interface. No código de produção passo os adaptadores do SQLite, e nos testes unitários passo mocks puros, permitindo que a suíte de testes rode sem precisar encostar no disco.

### Ordem estrita das validações
Cada linha do CSV passa por verificações sequenciais. Com o uso de `if` com `continue` a validação interrompe no primeiro erro encontrado conforme exigido pelo teste:
1. Campos preenchidos e numéricos (`Linha inválida`)
2. Controle de duplicidade com `Set` em memória — a primeira ocorrência segue o fluxo normal e as seguintes são barradas (`Contrato duplicado no arquivo`)
3. Existência do contrato no banco (`Contrato não encontrado`)
4. Verificação de status (`Contrato cancelado`)
5. Correspondência do plano atual com a planilha (`Plano de origem não confere`)
6. Existência do novo plano (`Plano de destino não encontrado`)
7. Status do plano de destino (`Plano de destino inativo`)
8. Verificação se o plano de destino é diferente do atual (`Contrato já está no plano de destino`)

### Otimização de consultas e atualização com transaction
* **Consulta única:** Após passar as regras de formato e duplicidade, busco o contrato e o plano uma única vez por linha e reaproveito os dados nas checagens seguintes, evitando chamar repetidamente no SQLite.
* **Transação em lote:** No momento de atualizar os contratos válidos, utilizo `db.transaction()` do `better-sqlite3` para processar todos os updates dentro de uma única transação. Isso garante a completude da atualização (ACID) e melhora a performance de I/O em disco.

### Configuração e variáveis de ambiente
Criei um módulo de configuração validado com Zod (`src/config/env.ts`) para os caminhos do banco e do seed. O arquivo `.env.example` serve de referência, mas há valores padrão em código para que o projeto rode de primeira sem depender de configuração manual.

---

## Estrutura de Pastas

```text
src/
├── config/             # Configurações e validação de env com Zod
├── db/                 # Conexão SQLite e script de seed
├── modules/
│   ├── contratos/      # Modelos, interfaces de repositório e adaptadores SQLite de contratos
│   ├── planos/         # Modelos, interfaces de repositório e adaptadores SQLite de planos
│   ├── parser/         # Leitura e parse do CSV
│   ├── validator/      # Validador das 8 regras de negócio e testes unitários
│   └── output/         # Geração do relatório CSV e atualização em lote no banco
├── shared/             # Tipagens compartilhadas (MigrationRow, ValidRecord, etc.)
└── index.ts            # Ponto de entrada da CLI
```
