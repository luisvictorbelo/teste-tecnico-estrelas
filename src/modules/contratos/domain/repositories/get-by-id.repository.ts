import type { Contrato } from "../models/contrato.model.js";

export interface getContratoByIdRepository {
	getById(id: number): Contrato | null;
}
