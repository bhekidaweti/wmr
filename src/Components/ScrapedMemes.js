import React, { useState, useEffect } from "react";
import axios from "axios";

const ScrapedMemes = () => {
  const [memes, setMemes] = useState([]);
  const [selectedMeme, setSelectedMeme] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "https://wmr-jk4d.onrender.com";

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/scraped-memes`)
      .then((res) => setMemes(res.data))
      .catch((err) => console.error("Error fetching memes:", err));
  }, []);

  return (
    <div>
      {selectedMeme ? (
        <div className="meme-details">
          <img src={selectedMeme} alt="Full Meme" className="meme-details-image" />
          <button className="btn btn-danger" onClick={() => setSelectedMeme(null)}>Close</button>
        </div>
      ) : (
        <div className="meme-grid">
          {memes.map((meme) => (
            <img
              key={meme.id}
              src={meme.image_url}
              alt="Scraped Meme"
              className="meme-thumbnail"
              onClick={() => setSelectedMeme(meme.image_url)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScrapedMemes;
