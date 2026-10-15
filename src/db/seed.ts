import fs from "node:fs";
import path from "node:path";
import { createConnection } from "./connection.js";

const DB_PATH = "./db/database.sqlite";
const SEED_PATH = "./db/seed/seed.sql";

const seedFile = path.join(process.cwd(), SEED_PATH);

const seedData = fs.readFileSync(seedFile, "utf8");
const db = createConnection(DB_PATH);
db.exec(seedData);
db.close();