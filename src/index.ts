import fs from "node:fs";
import { env } from "./config/env.js";
import { createConnection } from "./db/connection.js";
import { GetContratoByIdAdapter } from "./modules/contratos/domain/infra/adapters/get-by-id.adapter.js";
import { UpdatePlanoAdapter } from "./modules/contratos/domain/infra/adapters/update-plano.adapter.js";
import { Output } from "./modules/output/Output.js";
import { Parser } from "./modules/parser/Parser.js";
import { GetPlanoByIdAdapter } from "./modules/planos/domain/infra/adapters/get-by-id.adapter.js";
import { Validator } from "./modules/validator/Validator.js";
import type { MigrationRow } from "./shared/types/migration-row.type.js";

const DB_PATH = env.DB_PATH;
const CSV_PATH = process.argv[2];

if (!CSV_PATH) {
	console.error(
		"Por favor, forneça o caminho para o arquivo CSV como argumento.",
	);
	console.log('Exemplo de uso: npm start -- "./caminho/para/arquivo.csv"');
	console.log("Encerrando execução...");
	process.exit(1);
}

if (!fs.existsSync(DB_PATH)) {
	console.error(
		`Banco de dados não encontrado em "${DB_PATH}".\nPor favor, execute "npm run seed" antes de iniciar a automação.`,
	);
	process.exit(1);
}

const db = createConnection(DB_PATH);

let content = "";

try {
	content = fs.readFileSync(CSV_PATH, "utf8");
} catch (error) {
	console.error("Erro ao ler o arquivo CSV:", error);
	process.exit(1);
}

const parser = new Parser();
const data = parser.parseCsv(content);
console.log("Dados do CSV lidos:", data);

const getContractById = new GetContratoByIdAdapter(db);
const getPlanById = new GetPlanoByIdAdapter(db);
const updatePlanoRepository = new UpdatePlanoAdapter(db);

const validator = new Validator(getContractById, getPlanById);
const { validated, rejected } = validator.validate(data as MigrationRow[]);

const output = new Output(updatePlanoRepository);
output.generateInvalidsCsv(rejected);
output.updateDbWithValidRecords(validated);

console.log("Processamento concluído com sucesso.");
console.log(
	`Resumo da execução:\nTotal de linhas lidas: ${data.length}\nRegistros atualizados: ${validated.length}\nRegistros inválidos: ${rejected.length}`,
);

db.close();
