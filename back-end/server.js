const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const scrapeMemes = require("./scraper");
const admin = require('firebase-admin');

require('dotenv').config({ path: '../.env' });

const app = express();
app.use(express.static(path.join(__dirname, '../front-end/build')));

app.use(cors());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
});

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error){
    res.status(403).json({ error: "Invalid token"});
  }
};

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: { rejectUnauthorized: false }
})

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
      cb(new Error("Only images jpg, jpeg, png, gif are allowed"));
    }
  }
});

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//Scrape meme Table
app.get("/api/scraped-memes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM scraped_memes ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Failed to fetch memes:", error);
    res.status(500).json({ error: "Failed to fetch scraped memes" });
  }
});

setInterval(async () => {
  console.log("⏳ Running meme scraper...");
  await scrapeMemes();
}, 60000); // Every 60 seconds


// Route to fetch products from Printify API

app.get('/api/products', async (req, res) => {
  try {
    const shopId = process.env.PRINTIFY_SHOP_ID; // Ensure this exists in .env
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Printify API error: ${response.statusText}`);
      return res.status(response.status).json({ error: `Printify API error: ${response.statusText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching from Printify:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});


//Routes for uploaded memes
app.post('/api/memes', upload.single("image"), verifyToken, async (req, res) => {
  try {
    const { title, description, categories } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }
    
    const targetPath = path.join(__dirname, "uploads", file.originalname);
    fs.renameSync(file.path, targetPath);

    const query = `
      INSERT INTO memes (title, description, categories, image_url, created_at) 
      VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING *;
    `;
    const values = [title, description, categories, `/uploads/${file.originalname}`];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Meme uploaded successfully",
      meme: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload meme" });
  }
});


app.get("/api/memes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM memes ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch memes" });
  }
});
 
app.delete("/api/memes/:id", verifyToken, async (req, res) => {
  try {
    const memeId = req.params.id;
    
    // Find the meme's image before deleting it
    const { rows } = await pool.query("SELECT image_url FROM memes WHERE id = $1", [memeId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Meme not found" });
    }

    const imagePath = path.join(__dirname, rows[0].image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Delete the file
    }

    await pool.query("DELETE FROM memes WHERE id = $1", [memeId]);
    res.status(200).json({ message: "Meme deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete meme" });
  }
});

// 🆕 EDIT (UPDATE) Meme by ID
app.put('/api/memes/:id', upload.single("image"), verifyToken, async (req, res) => {
  try {
    const memeId = req.params.id;
    const { title, description, categories } = req.body;
    let imageUrl = null;

    if (req.file) {
      // Delete the old image
      const { rows } = await pool.query("SELECT image_url FROM memes WHERE id = $1", [memeId]);
      if (rows.length > 0) {
        const oldImagePath = path.join(__dirname, rows[0].image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Save the new image
      const targetPath = path.join(__dirname, "uploads", req.file.originalname);
      fs.renameSync(req.file.path, targetPath);
      imageUrl = `/uploads/${req.file.originalname}`;
    }

    const query = `
      UPDATE memes SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        categories = COALESCE($3, categories),
        image_url = COALESCE($4, image_url)
      WHERE id = $5 
      RETURNING *;
    `;
    const values = [title, description, categories, imageUrl, memeId];
    const result = await pool.query(query, values);

    res.json({ message: "Meme updated successfully", meme: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update meme" });
  }
});


//Handling non-API routes in production
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../front-end/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on :${PORT}`);
});