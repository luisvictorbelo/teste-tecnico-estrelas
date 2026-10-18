import type Database from "better-sqlite3";
import type { ValidRecord } from "../../../../../shared/types/valid-record.type.js";
import type { updatePlanoRepository } from "../../repositories/update-plano.repository.js";

export class UpdatePlanoAdapter implements updatePlanoRepository {
	constructor(private readonly db: Database.Database) {}
	updatePlanos(records: ValidRecord[]): void {
		const stmt = this.db.prepare(
			"UPDATE contratos SET plano_id = ? WHERE id = ?",
		);

		const updateBatch = this.db.transaction((items: ValidRecord[]) => {
			for (const { id, para_plano } of items) {
				stmt.run(para_plano, id);
			}
		});

		updateBatch(records);
	}
}
