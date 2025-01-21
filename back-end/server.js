const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PORT = 5000;

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


const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLocaleLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images jpg, jpeg, png, gif are allowed"))
    }
  }

});

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post('/api/memes', upload.single("image"), async (req, res) => {
  try{
    const { title, description, categories } = req.body;
    const file = req.file;

    if (!file){
      return res.status(400).json({ error: "Image file is required" })
    }
    const targetPath = path.join(__dirname, "uploads", file.originalname);
    fs.renameSync(file.path, targetPath);

    const query = `
      INSERT INTO memes (title, description, categories, image_url, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *;
    `;
    const values = [title, description, categories, `/uploads/${file.originalname}`];
    const result = await pool.query(query, values);
    res.status(201).json({
      message: "Meme uploaded successfully",
      meme: result.rows[0],
    });
    } catch (err){
      console.error(err);
      res.status(500).json({ error: "Failed to upload meme" });
    }
  });
  
  app.get("/api/memes", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM memes");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch memes" });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });