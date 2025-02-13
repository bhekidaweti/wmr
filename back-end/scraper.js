const axios = require("axios");
const pool = require("./db"); // Import database connection
const cron = require("node-cron");
require('dotenv').config({ path: '../.env' });




// Function to scrape memes using Reddit's JSON API
const scrapeMemes = async () => {
  try {
    console.log("🚀 Scraping memes from Reddit...");

    const subreddits = ["memes", "dankmemes", "ProgrammerHumor"];
    for (const subreddit of subreddits) {
      const url = `https://www.reddit.com/r/${subreddit}/top.json?t=day&limit=20`;

      const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
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
  
          const res = await pool.query(insertQuery, [meme.title, "Scraped from Reddit", meme.categories, meme.image_url]);

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

// Export scraper function
module.exports = scrapeMemes;
