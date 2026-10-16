import { stringify } from "csv-stringify/sync";
import fs from "node:fs";
import type { RejectedRecord } from "../../shared/types/rejected-record.type.js";
import type { ValidRecord } from "../../shared/types/valid-record.type.js";
import type { UpdatePlanoAdapter } from "../contratos/domain/infra/adapters/update-plano.adapter.js";

export class Output {
	constructor(private readonly updatePlanoRepository: UpdatePlanoAdapter) {}

	generateInvalidsCsv(
		invalidRecords: RejectedRecord[],
		outputPath = "relatorio_nao_atualizados.csv",
	): void {
		const csv = stringify(invalidRecords, {
			header: true,
			columns: {
				row: "linha",
				id: "id",
				name: "nome",
				de_plano: "de_plano",
				para_plano: "para_plano",
				motivo: "motivo",
			},
		});

		fs.writeFileSync(outputPath, csv, "utf8");
	}

	updateDbWithValidRecords(validRecords: ValidRecord[]): void {
		for (const record of validRecords) {
			const { id, para_plano } = record;
			this.updatePlanoRepository.updatePlano(id, para_plano);
		}
	}
}
