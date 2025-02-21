const { Pool } = require("pg");
require('dotenv').config({ path: '../.env' });

// PostgreSQL connection settings
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT,            
});
pool.connect()
  .then(() => console.log("Connected to the shop database"))
  .catch(err => console.error("Connection error", err.stack));

module.exports = pool;
