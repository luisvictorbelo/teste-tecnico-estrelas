import type { MigrationRow } from "../../shared/types/migration-row.type.js";
import type { RejectedRecord } from "../../shared/types/rejected-record.type.js";
import type { ValidRecord } from "../../shared/types/valid-record.type.js";
import type { getContratoByIdRepository } from "../contratos/domain/repositories/get-by-id.repository.js";
import type { getPlanoByIdRepository } from "../planos/domain/repositories/get-by-id.repository.js";

export interface ValidationResult {
	validated: ValidRecord[];
	rejected: RejectedRecord[];
}

export class Validator {
	constructor(
		private readonly contractsRepository: getContratoByIdRepository,
		private readonly plansRepository: getPlanoByIdRepository,
	) {}

	public validate(data: MigrationRow[]): ValidationResult {
		const seenIds = new Set<string>();
		const validated: ValidRecord[] = [];
		const rejected: RejectedRecord[] = [];

		for (const [index, item] of data.entries()) {
			const row = index + 2;

			// Mudar isso aqui para um switch case se der tempo, para ficar mais organizado e legível.

			if (!this.isNumeric(item.id, item.de_plano, item.para_plano)) {
				rejected.push({
					row,
					id: item.id,
					name:
						this.contractsRepository.getById(parseInt(item.id, 10))?.nome || "",
					de_plano: item.de_plano,
					para_plano: item.para_plano,
					motivo: "Linha inválida",
				});
				continue;
			}

			if (this.isDuplicated(item.id, seenIds)) {
				rejected.push({
					row,
					id: item.id,
					name:
						this.contractsRepository.getById(parseInt(item.id, 10))?.nome || "",
					de_plano: item.de_plano,
					para_plano: item.para_plano,
					motivo: "Contrato duplicado no arquivo",
				});
				continue;
			}

			// Se der tempo chamar o repositório aqui para evitar chamar o repositorio toda vez dentro de cada função.

			if (this.isNotValidContract(item.id)) {
				rejected.push({
					row,
					id: item.id,
					name:
						this.contractsRepository.getById(parseInt(item.id, 10))?.nome || "",
					de_plano: item.de_plano,
					para_plano: item.para_plano,
					motivo: "Contrato não encontrado",
				});
				continue;
			}

			if (this.isCancelledContract(item.id)) {
				rejected.push({
					row,
					id: item.id,
					name:
						this.contractsRepository.getById(parseInt(item.id, 10))?.nome || "",
					de_plano: item.de_plano,
					para_plano: item.para_plano,
					motivo: "Contrato cancelado",
				});
				continue;
			}

			if (this.isDePlanoNotSamePlanInDb(item.id, item.de_plano)) {
				rejected.push({
					row,
					id: item.id,
					name:
						this.contractsRepository.getById(parseInt(item.id, 10))?.nome || "",
					de_plano: item.de_plano,
					para_plano: item.para_plano,
					motivo: "Plano de origem não confere",
				});
				continue;
			}

			if (this.isParaPlanoNotExist(item.para_plano)) {
				rejected.push({
					row,
					id: item.id,
					name:
						this.contractsRepository.getById(parseInt(item.id, 10))?.nome || "",
					de_plano: item.de_plano,
					para_plano: item.para_plano,
					motivo: "Plano de destino não encontrado",
				});
				continue;
			}

			if (this.isNotActivePlan(item.para_plano)) {
				rejected.push({
					row,
					id: item.id,
					name:
						this.contractsRepository.getById(parseInt(item.id, 10))?.nome || "",
					de_plano: item.de_plano,
					para_plano: item.para_plano,
					motivo: "Plano de destino inativo",
				});
				continue;
			}

			if (this.isDePlanoNotEqualToParaPlano(item.de_plano, item.para_plano)) {
				rejected.push({
					row,
					id: item.id,
					name:
						this.contractsRepository.getById(parseInt(item.id, 10))?.nome || "",
					de_plano: item.de_plano,
					para_plano: item.para_plano,
					motivo: "Contrato já está no plano de destino",
				});
				continue;
			}

			validated.push({
				id: parseInt(item.id, 10),
				para_plano: parseInt(item.para_plano, 10),
			});
		}

		return { validated, rejected };
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

	private isDePlanoNotSamePlanInDb(
		contractId: string,
		de_plano: string,
	): boolean {
		const contract = this.contractsRepository.getById(parseInt(contractId, 10));
		return contract?.plano_id !== parseInt(de_plano, 10);
	}

	private isParaPlanoNotExist(para_plano: string): boolean {
		const plan = this.plansRepository.getById(parseInt(para_plano, 10));
		return !plan;
	}

	private isNotActivePlan(para_plano: string): boolean {
		const plan = this.plansRepository.getById(parseInt(para_plano, 10));
		return plan?.status !== "ativo";
	}

	private isDePlanoNotEqualToParaPlano(
		de_plano: string,
		para_plano: string,
	): boolean {
		return de_plano === para_plano;
	}
}
