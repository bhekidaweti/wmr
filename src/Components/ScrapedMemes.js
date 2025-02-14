import React, { useState, useEffect } from "react";


const ScrapedMemes = () => {
  const [memes, setMemes] = useState([]);
  const [selectedMeme, setSelectedMeme] = useState(null);

  useEffect(() => {
    fetch("https://wmr-jk4d.onrender.com/api/scraped-memes")
      .then((res) => res.json())
      .then((data) => setMemes(data))
      .catch((err) => console.error("Error fetching memes:", err));
  }, []);

  return (
    <div>
        {selectedMeme ? (
          <div className="meme-details">
            <img
              src={selectedMeme}
              alt="Full Meme"
              className="meme-details-image"
            />
            <button className="btn btn-danger" onClick={() => setSelectedMeme(null)}>
              Close
            </button>
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
