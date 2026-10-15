import type { Contrato } from "../models/contrato.model.js";

export interface updatePlanoRepository {
	updatePlano(id: number, planoId: number): Contrato | null;
}
