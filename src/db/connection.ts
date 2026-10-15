import Database from "better-sqlite3";

export const createConnection = (filePath: string): Database.Database => {
    const db = new Database(filePath, { verbose: console.log });
    return db;
}
