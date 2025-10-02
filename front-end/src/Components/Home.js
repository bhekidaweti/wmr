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

  const APIurl = process.env.REACT_APP_API_URL

  useEffect(() => {
    axios
      .get(`${APIurl}/api/memes`)
      .then((res) => setMemes(res.data))
      .catch((err) => console.error("Error fetching memes:", err));
  }, [APIurl]);

//Filtered memes for me search functionality on the uploaded memes section
 
  const filteredMemes = memes.filter((meme) =>
    meme.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="row d-flex justify-content-between">
              {/* Scraped Memes Section */}
              <div className="col-md-4">
                <h5>Latest Memes </h5>
                <ScrapedMemes />
              </div>

              {/* MemeList Section */}
              <div className="col-md-4">
                <MemeList memes={filteredMemes} APIurl={APIurl} />
              </div> 

              {/* Shop Section 
              <div className="col-md-4">
              <h2>Don-These-Memes</h2>
                <Shop />
              </div> */}
            </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
