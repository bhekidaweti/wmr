const axios = require("axios");
require("dotenv").config({ path: "../.env" });

let cachedToken = null;
let tokenExpiry = null;

// Function to get access token using password grant
async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const auth = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", process.env.REDDIT_USERNAME);
  params.append("password", process.env.REDDIT_PASSWORD);

  const response = await axios.post(
    "https://www.reddit.com/api/v1/access_token",
    params,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "meme-scraper/1.0 (by u/Lost-Concentrate-661)",
      },
    }
  );

  cachedToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 30) * 1000;

  return cachedToken;
}

// Test function to fetch memes
async function testScraper() {
  try {
    console.log("🚀 Testing Reddit scraper...");

    const token = await getAccessToken();
    const subreddit = "memes";
    const url = `https://oauth.reddit.com/r/${subreddit}/top?t=day&limit=5`;

    const { data } = await axios.get(url, {
      headers: {
        Authorization: `bearer ${token}`,
        "User-Agent": "meme-scraper/1.0 (by u/Lost-Concentrate-661)",
      },
    });

    console.log(`✅ Top posts in r/${subreddit}:`);
    data.data.children.forEach((post, i) => {
      console.log(`${i + 1}. ${post.data.title} -> ${post.data.url_overridden_by_dest}`);
    });

  } catch (err) {
    console.error("❌ Error testing scraper:", err.response?.data || err.message);
  }
}

testScraper();
