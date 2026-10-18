import Database from "better-sqlite3";

export const createConnection = (dbPath: string): Database.Database => {
	try {
		console.log("Criando conexão com o banco de dados:", dbPath);
		const db = new Database(dbPath);
		console.log("Conexão com o banco de dados estabelecida com sucesso.");
		return db;
	} catch (error) {
		console.error("Erro na criação da conexão com o banco de dados:", error);
		throw error;
	}
};
