import type { Plano } from "../models/plano.model.js";

export interface getByIdRepository {
	getById(id: number): Plano | null;
}
