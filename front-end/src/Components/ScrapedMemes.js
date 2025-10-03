import React, { useState, useEffect } from "react";
import axios from "axios";
import '../App.css';

const ScrapedMemes = () => {
  const [memes, setMemes] = useState([]);
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const memesPerPage = 20;
  const APIurl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const res = await axios.get(`${APIurl}/api/scraped-memes`);
        console.log("Fetched memes:", res.data);
        console.log(res.data);

        // Handle both array and object-wrapped responses
        if (Array.isArray(res.data)) {
          setMemes(res.data);
        } else if (res.data && Array.isArray(res.data.memes)) {
          setMemes(res.data.memes);
        } else {
          console.warn("Unexpected response format, setting empty memes array.");
          setMemes([]);
        }
      } catch (err) {
        console.error("Error fetching memes:", err);
        setMemes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, [APIurl]);

  // Pagination logic
  const indexOfLastMeme = currentPage * memesPerPage;
  const indexOfFirstMeme = indexOfLastMeme - memesPerPage;
  const currentMemes = Array.isArray(memes) ? memes.slice(indexOfFirstMeme, indexOfLastMeme) : [];
  const totalPages = Array.isArray(memes) ? Math.ceil(memes.length / memesPerPage) : 1;

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) return <div>Loading Latest Memes ...</div>;

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
