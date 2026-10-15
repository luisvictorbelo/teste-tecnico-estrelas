import { createConnection } from "./db/connection.js";

const DB_PATH = "./db/database.sqlite";

const db = createConnection(DB_PATH);