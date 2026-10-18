import type Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";
import { createConnection } from "./connection.js";

const seedDatabase = (dbPath: string, seedPath: string): Database.Database => {
	try {
		const seedFile = path.join(process.cwd(), seedPath);
		const dbFile = path.join(process.cwd(), dbPath);

		const seedData = fs.readFileSync(seedFile, "utf8");

		const db = createConnection(dbFile);
		db.exec(seedData);

		console.log("Dados seed executados com sucesso.");
		console.log("DB criado @", dbFile);

		return db;
	} catch (error) {
		console.error("Erro ao gerar seed do banco de dados:", error);
		throw error;
	}
};

const db = seedDatabase(env.DB_PATH, env.SEED_PATH);
db.close();
