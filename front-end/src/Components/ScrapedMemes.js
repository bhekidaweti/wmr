import React, { useState, useEffect } from "react";
import axios from "axios";
import '../App.css';

const ScrapedMemes = () => {
  const [memes, setMemes] = useState([]);
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const memesPerPage = 20;
  const APIurl = process.env.REACT_APP_API_URL

  useEffect(() => {
    axios.get(`${APIurl}/api/scraped-memes`)
      .then((res) => setMemes(res.data))
      .catch((err) => console.error("Error fetching memes:", err));
  }, [APIurl]);

  // Pagination logic
  const indexOfLastMeme = currentPage * memesPerPage;
  const indexOfFirstMeme = indexOfLastMeme - memesPerPage;
  const currentMemes = memes.slice(indexOfFirstMeme, indexOfLastMeme);
  const totalPages = Math.ceil(memes.length / memesPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container mt-4">
      {selectedMeme ? (
        <div className="meme-details">
          <img src={selectedMeme} alt="Full Meme" className="meme-details-image" />
          <button className="btn btn-danger mt-3" onClick={() => setSelectedMeme(null)}>Close</button>
        </div>
      ) : (
        <div>
          <div className="row">
            {currentMemes.map((meme) => (
              <div key={meme.id} className="col-md-3 mb-3">
                <img
                  src={meme.image_url}
                  alt="Scraped Meme"
                  className="img-fluid meme-thumbnail"
                  onClick={() => setSelectedMeme(meme.image_url)}
                />
              </div>
            ))}
          </div>

          {/* Bootstrap Pagination */}
          {memes.length > memesPerPage && (
            <nav className="d-flex justify-content-center mt-3">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={prevPage}>Previous</button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={nextPage}>Next</button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}
    </div>
  );
};

export default ScrapedMemes;
