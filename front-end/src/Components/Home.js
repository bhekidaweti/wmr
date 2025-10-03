import React, { useState, useEffect } from "react";
import logo from "../wiki-logo.png";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "./Footer";
import ScrapedMemes from "./ScrapedMemes";
//import Shop from "./Shop";
import MemeList from "./MemeList"; 
import axios from "axios";

const Home = () => {
  const [memes, setMemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const APIurl = "https://w-backend-0ij7.onrender.com";

  useEffect(() => {
  axios
    .get(`${APIurl}/api/memes`)
    .then((res) => {
      // Check what the API actually returns
      //console.log("API response:", res.data);

      // If API returns an object like { memes: [...] }, grab the array
      const memesArray = Array.isArray(res.data) ? res.data : res.data.memes || [];
      setMemes(memesArray);
    })
    .catch((err) => console.error("Error fetching memes:", err));
}, [APIurl]);

//Filtered memes for me search functionality on the uploaded memes section
const filteredMemes = Array.isArray(memes)
  ? memes.filter((meme) =>
      meme.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : [];

  return (
    <div className="App">
      <header className="App-header">
        <ul>
          <li>
            <img src={logo} className="App-logo" alt="logo" />
          </li>
          <li>Your encyclopedia of internet memes!</li>
          <li>
            <input
              type="text"
              placeholder="Search for a meme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-group"
            />
          </li>
        </ul>
      </header>
      
      <div className="container mt-4">
  <div className="row">
    {/* Scraped Memes Section */}
    <div className="col-md-6 mb-4">
      <div className="p-3 border rounded bg-light">
        <h5>Latest Memes</h5>
        <ScrapedMemes />
      </div>
    </div>

    {/* MemeList Section */}
    <div className="col-md-6 mb-4">
      <div className="p-3 border rounded bg-light">
        <h5>Meme List</h5>
        <MemeList memes={filteredMemes} APIurl={APIurl} />
      </div>
      </div>
    </div>
  </div>

      <Footer />
    </div>
  );
};

export default Home;
