const { Pool } = require("pg");
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: { rejectUnauthorized: false }
})
pool.connect()
  .then(() => console.log("Connected to the scraper database"))
  .catch(err => console.error("Connection error", err.stack));

module.exports = pool;
