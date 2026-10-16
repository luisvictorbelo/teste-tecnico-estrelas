import type Database from "better-sqlite3";
import type { updatePlanoRepository } from "../../repositories/update-plano.repository.js";

export class UpdatePlanoAdapter implements updatePlanoRepository {
	constructor(private readonly db: Database.Database) {}
	updatePlano(contractId: number, planoId: number): void {
		const stmt = this.db.prepare(
			"UPDATE contratos SET plano_id = ? WHERE id = ?",
		);

		const updatePlanTransaction = this.db.transaction(
			(contractId: number, planoId: number) => {
				stmt.run(planoId, contractId);
			},
		);

		updatePlanTransaction(contractId, planoId);
	}
}
