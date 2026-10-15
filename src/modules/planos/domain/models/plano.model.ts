const STATUS = ["ativo", "inativo"] as const;

export type Plano = {
	id: number;
	nome: string;
	status: (typeof STATUS)[number];
};
