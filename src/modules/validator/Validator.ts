import type { GetByIdAdapter } from "../contratos/domain/infra/adapters/get-by-id.adapter.js";

export interface MigrationRow {
	id: string;
	de_plano: string;
	para_plano: string;
}

export class Validator {
	private readonly data: MigrationRow[];

	constructor(
		data: MigrationRow[],
		private readonly contractsRepository: GetByIdAdapter,
	) {
		this.data = data;
	}

	public validate(): void {
		const seenIds = new Set<string>();

		for (const item of this.data) {
			if (!this.isNumeric(item.id, item.de_plano, item.para_plano)) {
				console.log("Item inválido:", item);
				continue;
			}

			if (this.isDuplicated(item.id, seenIds)) {
				console.log("Item duplicado:", item);
				continue;
			}

			if (!this.isValidContract(item.id)) {
				console.log("Contrato não encontrado para o item:", item);
			}
		}
	}

	private isNumeric(id: string, de_plano: string, para_plano: string): boolean {
		return (
			/^\d+$/.test(id) && /^\d+$/.test(de_plano) && /^\d+$/.test(para_plano)
		);
	}

	private isDuplicated(id: string, seen: Set<string>): boolean {
		if (seen.has(id)) {
			return true;
		}
		seen.add(id);
		return false;
	}

	private isValidContract(id: string): boolean {
		const contract = this.contractsRepository.getById(parseInt(id, 10));
		return !!contract;
	}
}
