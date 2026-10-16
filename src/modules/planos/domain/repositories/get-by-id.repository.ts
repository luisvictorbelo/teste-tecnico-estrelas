import type { Plano } from "../models/plano.model.js";

export interface getPlanoByIdRepository {
	getById(id: number): Plano | null;
}
