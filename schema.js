const sqlite = require("better-sqlite3");
const DB = new sqlite("nepalijsdb.sqlite");
const schema = `

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thumbnail TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    topic TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_date DATE DEFAULT CURRENT_TIMESTAMP,
    updated_date DATE DEFAULT CURRENT_TIMESTAMP
);
`;

DB.exec(schema);

module.exports = DB;
