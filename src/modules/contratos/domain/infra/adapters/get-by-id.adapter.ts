import type Database from "better-sqlite3";
import type { Contrato } from "../../models/contrato.model.js";
import type { getByIdRepository } from "../../repositories/get-by-id.repository.js";

export class GetByIdAdapter implements getByIdRepository {
	constructor(private readonly db: Database.Database) {}

	getById(id: number): Contrato | null {
		const stmt = this.db.prepare("SELECT * FROM contratos WHERE id = ?");
		const row = stmt.get(id);

		if (!row) {
			return null;
		}

		const contrato = row as Contrato;

		return contrato;
	}
}
