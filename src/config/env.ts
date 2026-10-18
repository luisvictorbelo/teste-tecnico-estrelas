import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	DB_PATH: z
		.string()
		.nonempty("DB_PATH não pode ser vazio")
		.default("./db/database.sqlite"),
	SEED_PATH: z
		.string()
		.nonempty("SEED_PATH não pode ser vazio")
		.default("./db/seed/seed.sql"),
});

export const env = envSchema.parse(process.env);
