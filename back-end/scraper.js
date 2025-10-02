const axios = require("axios");
const pool = require("./db");
const cron = require("node-cron");
require('dotenv').config({ path: '../.env' });

let cachedToken = null;
let tokenExpiry = null;

// Function to get an OAuth2 access token with caching
async function getAccessToken() {
  // If token exists and is not expired, return cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const auth = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString("base64");

  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", process.env.REDDIT_USERNAME);
  params.append("password", process.env.REDDIT_PASSWORD);

  const response = await axios.post("https://www.reddit.com/api/v1/access_token", params, {
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "meme-app/1.0 (by u/Lost-Concentrate-661)"
    }
  });

  // Cache token and set expiry (expires_in is in seconds)
  cachedToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 30) * 1000; // subtract 30s for safety

  return cachedToken;
}

// Function to scrape memes using Reddit's OAuth API
const scrapeMemes = async () => {
  try {
    console.log("🚀 Scraping memes from Reddit...");

    const token = await getAccessToken();

    const subreddits = ["memes", "dankmemes", "ProgrammerHumor"];
    for (const subreddit of subreddits) {
      const url = `https://oauth.reddit.com/r/${subreddit}/top?t=day&limit=20`;

      const { data } = await axios.get(url, {
        headers: {
          "Authorization": `bearer ${token}`,
          "User-Agent": "meme-app/1.0 (by u/Lost-Concentrate-661)"
        }
      });

      const memes = [];

      data.data.children.forEach(post => {
        const { title, url_overridden_by_dest: image_url } = post.data;

        if (title && image_url && (image_url.endsWith(".jpg") || image_url.endsWith(".png") || image_url.endsWith(".jpeg"))) {
          memes.push({ title, image_url, categories: subreddit });
        }
      });

      console.log(`✅ Found ${memes.length} memes in r/${subreddit}`);

      // Save memes to the database
      for (const meme of memes) {
        try {
          const insertQuery = `
            INSERT INTO scraped_memes (title, description, categories, image_url, created_at) 
            VALUES ($1, $2, $3, $4, NOW()) 
            ON CONFLICT (image_url) DO NOTHING RETURNING *;
          `;

          const res = await pool.query(insertQuery, [
            meme.title,
            "Scraped from Reddit",
            meme.categories,
            meme.image_url
          ]);

          if (res.rows.length) {
            console.log(`✅ Saved meme: ${meme.title}`);
          }
        } catch (dbError) {
          console.error("❌ Error saving meme to database:", dbError.message);
        }
      }
    }

    console.log("🎉 Scraping complete.");
  } catch (error) {
    console.error("❌ Error scraping memes:", error.message);
  }
};

// Schedule the scraper to run every 30 minutes
cron.schedule("*/30 * * * *", scrapeMemes, {
  scheduled: true,
  timezone: "UTC",
});

module.exports = scrapeMemes;
