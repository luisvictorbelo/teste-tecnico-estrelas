import type { Contrato } from "../models/contrato.model.js";

export interface getByIdRepository {
	getById(id: number): Contrato | null;
}
