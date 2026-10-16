import fs from "node:fs";
import { createConnection } from "./db/connection.js";
import { GetContratoByIdAdapter } from "./modules/contratos/domain/infra/adapters/get-by-id.adapter.js";
import { Parser } from "./modules/parser/Parser.js";
import { GetPlanoByIdAdapter } from "./modules/planos/domain/infra/adapters/get-by-id.adapter.js";
import { type MigrationRow, Validator } from "./modules/validator/Validator.js";

const DB_PATH = "./db/database.sqlite";
const CSV_PATH = "./docs/migracoes_planos (1).csv";

const db = createConnection(DB_PATH);
const parser = new Parser();

const content = fs.readFileSync(CSV_PATH, "utf8");

const data = parser.parseCsv(content);
console.log("Parsed CSV Data:", data);

const getContractById = new GetContratoByIdAdapter(db);
const getPlanById = new GetPlanoByIdAdapter(db);

const validator = new Validator(
	data as MigrationRow[],
	getContractById,
	getPlanById,
);
validator.validate();
