import { stringify } from "csv-stringify/sync";
import fs from "node:fs";

export interface RejectedRecord {
	linha: number;
	id: string;
	nome: string;
	de_plano: string;
	para_plano: string;
	motivo: string;
}

export class Output {
	generate(
		records: RejectedRecord[],
		outputPath = "relatorio_nao_atualizados.csv",
	): void {
		const csv = stringify(records, {
			header: true,
			columns: {
				linha: "linha",
				id: "id",
				nome: "nome",
				de_plano: "de_plano",
				para_plano: "para_plano",
				motivo: "motivo",
			},
		});

		fs.writeFileSync(outputPath, csv, "utf8");
	}
}
