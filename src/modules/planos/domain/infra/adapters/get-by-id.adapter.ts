import type Database from "better-sqlite3";
import type { Plano } from "../../models/plano.model.js";
import type { getPlanoByIdRepository } from "../../repositories/get-by-id.repository.js";

export class GetPlanoByIdAdapter implements getPlanoByIdRepository {
	constructor(private readonly db: Database.Database) {}

	getById(id: number): Plano | null {
		const stmt = this.db.prepare("SELECT * FROM planos WHERE id = ?");
		const row = stmt.get(id);

		if (!row) {
			return null;
		}

		const plano = row as Plano;

		return plano;
	}
}
