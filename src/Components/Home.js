import React, { useState, useEffect } from "react";
import logo from "../wiki-logo.png";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "./Footer";
import ScrapedMemes from "./ScrapedMemes";
import Shop from "./Shop";


const Home = () => {
  const [memes, setMemes] = useState([]);
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("https://wmr-jk4d.onrender.com/api/memes")
      .then((res) => res.json())
      .then((data) => setMemes(data));
  }, []);

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
                  src={`${selectedMeme.image_url}`}
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
                      src={`https://wmr-jk4d.onrender.com${meme.image_url}`}
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
          <h5>Merch</h5>
          <Shop />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;