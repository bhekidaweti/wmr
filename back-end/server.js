const express = require('express');
require('dotenv').config({ path: '../front-end/.env' });
const { Client } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const scrapeMemes = require("./scraper");
const admin = require('firebase-admin');
const axios = require('axios');


const app = express();
//app.use(express.static(path.join(__dirname, '../front-end/build')));

app.use(cors());
app.use(bodyParser.json());

// Attempt to parse the JSON string
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
  console.error('Error: Failed to parse the FIREBASE_SERVICE_ACCOUNT JSON string.');
  console.error(error); // Log the specific error
  process.exit(1); // Exit the process if the JSON is invalid
}

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin Initialized Successfully!");
} catch (error) {
  console.error('Error: Failed to initialize Firebase Admin.');
  console.error(error); 
  process.exit(1);
}


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

const client = new Client({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD ? process.env.DATABASE_PASSWORD.trim() : '',
  ssl: { rejectUnauthorized: false }
})
process.env.PGDEBUG = 'true';

client.connect()
.then(() => {
  console.log('client connected')
})
.catch(err => console.error('Connection error', err));

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
    const result = await client.query("SELECT * FROM scraped_memes ORDER BY created_at DESC");
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

// Printify API Route
app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products.json`, 
      {
        headers: { Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}` }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching Printify products:", error?.response?.status, error?.response?.data);
    res.status(500).json({ error: "Failed to fetch products" });
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
    const result = await client.query(query, values);

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
    const result = await client.query("SELECT * FROM memes ORDER BY created_at DESC");
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
    const { rows } = await client.query("SELECT image_url FROM memes WHERE id = $1", [memeId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Meme not found" });
    }

    const imagePath = path.join(__dirname, rows[0].image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Delete the file
    }

    await client.query("DELETE FROM memes WHERE id = $1", [memeId]);
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
      const { rows } = await client.query("SELECT image_url FROM memes WHERE id = $1", [memeId]);
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
    const result = await client.query(query, values);

    res.json({ message: "Meme updated successfully", meme: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update meme" });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on :${PORT}`);
});