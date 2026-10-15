import { parse } from "csv-parse/sync";
export class Parser {
	parseCsv(csvContent: string) {
		return parse(csvContent, {
			bom: true,
			columns: true,
		});
	}
}
