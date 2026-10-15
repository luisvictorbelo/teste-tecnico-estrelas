import fs from "node:fs";
import path from "node:path";
import { createConnection } from "./connection.js";

const DB_PATH = "./db/database.sqlite";
const SEED_PATH = "./db/seed/seed.sql";

const seedFile = path.join(process.cwd(), SEED_PATH);

const seedData = fs.readFileSync(seedFile, "utf8");
const db = createConnection(DB_PATH);
try {
    db.exec(seedData);
    console.log("Seed data executed successfully.");
    console.log("Database created @", DB_PATH);
} catch (error) {
    console.error("Error executing seed data:", error);
} finally {
    console.log("Closing database connection...");
    db.close();
    console.log("Database connection closed.");
}