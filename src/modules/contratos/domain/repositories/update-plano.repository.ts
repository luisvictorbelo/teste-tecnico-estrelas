import type { ValidRecord } from "../../../../shared/types/valid-record.type.js";

export interface updatePlanoRepository {
	updatePlanos(records: ValidRecord[]): void;
}
