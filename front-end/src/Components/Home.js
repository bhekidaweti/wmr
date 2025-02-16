import React, { useState, useEffect } from "react";
import logo from "../wiki-logo.png";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "./Footer";
import ScrapedMemes from "./ScrapedMemes";
import Shop from "./Shop";
import axios from 'axios';

const Home = () => {
  const [memes, setMemes] = useState([]);
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const APIurl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    axios.get(`${APIurl}/api/memes`)
      .then((res) => setMemes(res.data))
      .catch((err) => console.error("Error fetching memes:", err));
  }, [APIurl]);

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
      <div className="row align-items-start">
        <div className="col">
          <h5>Latest memes...</h5>
          <ScrapedMemes />
        </div>
    
        <div className="col">
          <main>
            {selectedMeme ? (
              <div className="meme-details">
                <h2>{selectedMeme.title}</h2>
                <img
                  src={selectedMeme.image_url.startsWith('http') ? selectedMeme.image_url : `${APIurl}${selectedMeme.image_url}`}
                  alt={selectedMeme.title}
                  className="meme-details-image"
                />
                <p>{selectedMeme.description}</p>
                <p>
                  <strong>Categories:</strong> {selectedMeme.categories}
                </p>
                <button
                  className="btn btn-danger"
                  onClick={() => setSelectedMeme(null)}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="meme-list">
                {filteredMemes.map((meme) => (
                  
                  <div
                    key={meme.id}
                    className="meme-card"
                    onClick={() => setSelectedMeme(meme)}
                  >
                    <img
                      src={`${APIurl}${meme.image_url}`}
                      alt={meme.title}
                      className="meme-image"
                    />
                    <p style={{ color: "whitesmoke" }}>Click the meme to see details..</p>
                    <h3 className="meme-title">{meme.title}</h3>
                    <hr style={{ color: "orange" }}></hr>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
        <div className="col">
          <Shop />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;