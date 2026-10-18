import { describe, expect, it, vi } from "vitest";
import type { getContratoByIdRepository } from "../../contratos/domain/repositories/get-by-id.repository.js";
import type { getPlanoByIdRepository } from "../../planos/domain/repositories/get-by-id.repository.js";
import { Validator } from "../Validator.js";

describe("Validator", () => {
	it("deve rejeitar linhas com campos não numéricos com 'Linha inválida'", () => {
		const mockContractsRepo: getContratoByIdRepository = { getById: vi.fn() };
		const mockPlansRepo: getPlanoByIdRepository = { getById: vi.fn() };
		const validator = new Validator(mockContractsRepo, mockPlansRepo);

		const data = [{ id: "1", de_plano: "abc", para_plano: "2" }];
		const data2 = [{ id: "1", de_plano: "1", para_plano: "" }];

		const { rejected } = validator.validate(data);
		expect(rejected).toHaveLength(1);
		expect(rejected[0]?.motivo).toBe("Linha inválida");

		const { rejected: rejected2 } = validator.validate(data2);
		expect(rejected2).toHaveLength(1);
		expect(rejected2[0]?.motivo).toBe("Linha inválida");
	});

	it("deve rejeitar linhas duplicadas com 'Contrato duplicado no arquivo'", () => {
		const mockContractsRepo: getContratoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 1,
				nome: "Contrato Teste",
				telefone: "123456",
				plano_id: 1,
				status: "ativo",
				data_instalacao: new Date(),
			}),
		};
		const mockPlansRepo: getPlanoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 3,
				nome: "Plano Teste",
				status: "ativo",
			}),
		};
		const validator = new Validator(mockContractsRepo, mockPlansRepo);

		const data = [
			{ id: "1", de_plano: "1", para_plano: "3" },
			{ id: "1", de_plano: "3", para_plano: "2" },
		];

		const { validated, rejected } = validator.validate(data);
		expect(validated).toHaveLength(1);
		expect(rejected).toHaveLength(1);
		expect(rejected[0]?.motivo).toBe("Contrato duplicado no arquivo");
	});

	it("deve rejeitar contrato não existente com 'Contrato não encontrado'", () => {
		const mockContractsRepo: getContratoByIdRepository = {
			getById: vi.fn().mockReturnValue(null),
		};
		const mockPlansRepo: getPlanoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 3,
				nome: "Plano Teste",
				status: "ativo",
			}),
		};
		const validator = new Validator(mockContractsRepo, mockPlansRepo);

		const data = [{ id: "1", de_plano: "1", para_plano: "3" }];

		const { rejected } = validator.validate(data);
		expect(rejected).toHaveLength(1);
		expect(rejected[0]?.motivo).toBe("Contrato não encontrado");
	});

	it("deve rejeitar contrato cancelado com 'Contrato cancelado'", () => {
		const mockContractsRepo: getContratoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 1,
				nome: "Contrato Teste",
				telefone: "123456",
				plano_id: 1,
				status: "cancelado",
				data_instalacao: new Date(),
			}),
		};
		const mockPlansRepo: getPlanoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 3,
				nome: "Plano Teste",
				status: "ativo",
			}),
		};

		const validator = new Validator(mockContractsRepo, mockPlansRepo);
		const data = [{ id: "1", de_plano: "1", para_plano: "3" }];

		const { rejected } = validator.validate(data);
		expect(rejected).toHaveLength(1);
		expect(rejected[0]?.motivo).toBe("Contrato cancelado");
	});

	it("deve rejeitar de_plano diferente do plano_id com 'Plano de origem não confere'", () => {
		const mockContractsRepo: getContratoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 1,
				nome: "Contrato Teste",
				telefone: "123456",
				plano_id: 1,
				status: "ativo",
				data_instalacao: new Date(),
			}),
		};
		const mockPlansRepo: getPlanoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 3,
				nome: "Plano Teste",
				status: "ativo",
			}),
		};

		const validator = new Validator(mockContractsRepo, mockPlansRepo);
		const data = [{ id: "1", de_plano: "2", para_plano: "3" }];

		const { rejected } = validator.validate(data);
		expect(rejected).toHaveLength(1);
		expect(rejected[0]?.motivo).toBe("Plano de origem não confere");
	});

	it("deve rejeitar para_plano não existente com 'Plano de destino não encontrado'", () => {
		const mockContractsRepo: getContratoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 1,
				nome: "Contrato Teste",
				telefone: "123456",
				plano_id: 1,
				status: "ativo",
				data_instalacao: new Date(),
			}),
		};
		const mockPlansRepo: getPlanoByIdRepository = {
			getById: vi.fn().mockReturnValue(null),
		};

		const validator = new Validator(mockContractsRepo, mockPlansRepo);
		const data = [{ id: "1", de_plano: "1", para_plano: "3" }];

		const { rejected } = validator.validate(data);
		expect(rejected).toHaveLength(1);
		expect(rejected[0]?.motivo).toBe("Plano de destino não encontrado");
	});

	it("deve rejeitar para_plano inativo com 'Plano de destino inativo'", () => {
		const mockContractsRepo: getContratoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 1,
				nome: "Contrato Teste",
				telefone: "123456",
				plano_id: 1,
				status: "ativo",
				data_instalacao: new Date(),
			}),
		};
		const mockPlansRepo: getPlanoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 3,
				nome: "Plano Teste",
				status: "inativo",
			}),
		};

		const validator = new Validator(mockContractsRepo, mockPlansRepo);
		const data = [{ id: "1", de_plano: "1", para_plano: "3" }];

		const { rejected } = validator.validate(data);
		expect(rejected).toHaveLength(1);
		expect(rejected[0]?.motivo).toBe("Plano de destino inativo");
	});

	it("deve rejeitar para_plano igual a de_plano com 'Contrato já está no plano de destino'", () => {
		const mockContractsRepo: getContratoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 1,
				nome: "Contrato Teste",
				telefone: "123456",
				plano_id: 1,
				status: "ativo",
				data_instalacao: new Date(),
			}),
		};
		const mockPlansRepo: getPlanoByIdRepository = {
			getById: vi.fn().mockReturnValue({
				id: 1,
				nome: "Plano Teste",
				status: "ativo",
			}),
		};

		const validator = new Validator(mockContractsRepo, mockPlansRepo);
		const data = [{ id: "1", de_plano: "1", para_plano: "1" }];

		const { rejected } = validator.validate(data);
		expect(rejected).toHaveLength(1);
		expect(rejected[0]?.motivo).toBe("Contrato já está no plano de destino");
	});
});
