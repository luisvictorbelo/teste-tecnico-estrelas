import type { GetContratoByIdAdapter } from "../contratos/domain/infra/adapters/get-by-id.adapter.js";
import type { GetPlanoByIdAdapter } from "../planos/domain/infra/adapters/get-by-id.adapter.js";

export interface MigrationRow {
	id: string;
	de_plano: string;
	para_plano: string;
}

export class Validator {
	private readonly data: MigrationRow[];

	constructor(
		data: MigrationRow[],
		private readonly contractsRepository: GetContratoByIdAdapter,
		private readonly plansRepository: GetPlanoByIdAdapter,
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

			if (this.isNotValidContract(item.id)) {
				console.log("Contrato não encontrado para o item:", item);
				continue;
			}

			if (this.isCancelledContract(item.id)) {
				console.log("Contrato cancelado para o item:", item);
				continue;
			}

			if (this.isNotSamePlan(item.id, item.de_plano)) {
				console.log("Plano de origem não confere para o item:", item);
				continue;
			}

			if (this.isNotExistingPlan(item.para_plano)) {
				console.log("Plano de destino não encontrado para o item:", item);
				continue;
			}

			if (this.isNotActivePlan(item.para_plano)) {
				console.log("Plano de destino não está ativo para o item:", item);
				continue;
			}

			if (this.isFromPlanNotEqualToToPlan(item.de_plano, item.para_plano)) {
				console.log(
					"Plano de origem é igual ao plano de destino para o item:",
					item,
				);
			}
		}
	}

	private isNumeric(
		contractId: string,
		de_plano: string,
		para_plano: string,
	): boolean {
		return (
			/^\d+$/.test(contractId) &&
			/^\d+$/.test(de_plano) &&
			/^\d+$/.test(para_plano)
		);
	}

	private isDuplicated(contractId: string, seen: Set<string>): boolean {
		if (seen.has(contractId)) {
			return true;
		}
		seen.add(contractId);
		return false;
	}

	private isNotValidContract(contractId: string): boolean {
		const contract = this.contractsRepository.getById(parseInt(contractId, 10));
		return !contract;
	}

	private isCancelledContract(contractId: string): boolean {
		const contract = this.contractsRepository.getById(parseInt(contractId, 10));
		return contract?.status === "cancelado";
	}

	private isNotSamePlan(contractId: string, de_plano: string): boolean {
		const contract = this.contractsRepository.getById(parseInt(contractId, 10));
		return contract?.plano_id !== parseInt(de_plano, 10);
	}

	private isNotExistingPlan(para_plano: string): boolean {
		const plan = this.plansRepository.getById(parseInt(para_plano, 10));
		return !plan;
	}

	private isNotActivePlan(para_plano: string): boolean {
		const plan = this.plansRepository.getById(parseInt(para_plano, 10));
		return plan?.status !== "ativo";
	}

	private isFromPlanNotEqualToToPlan(
		de_plano: string,
		para_plano: string,
	): boolean {
		return de_plano === para_plano;
	}
}
