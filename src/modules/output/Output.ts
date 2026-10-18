import fs from "node:fs";
import path from "node:path";
import { stringify } from "csv-stringify/sync";
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
		console.log(
			`Arquivo CSV de registros inválidos gerado em: ${path.join(process.cwd(), outputPath)}`,
		);
	}

	updateDbWithValidRecords(validRecords: ValidRecord[]): void {
		this.updatePlanoRepository.updatePlanos(validRecords);
		console.log(
			`Banco de dados atualizado com sucesso para ${validRecords.length} registros válidos.`,
		);
	}
}
