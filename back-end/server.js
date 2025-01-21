const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config({ path: '../.env' });


const app = express();
app.use(cors());
app.use(bodyParser.json());



const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get('/memes', async (req, res) => {
    const result = await pool.query('SELECT * FROM memes ORDER BY created_at DESC');
    res.json(result.rows);
});

app.post('/memes', async (req, res) => {
    const { title, description, categories, image_url } = req.body;
    const result = await pool.query(
      'INSERT INTO memes (title, description, categories, image_url, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [title, description, categories, image_url]
    );
    res.json(result.rows[0]);
  });
  
  app.listen(5000, () => console.log('Server running on http://localhost:5000'));