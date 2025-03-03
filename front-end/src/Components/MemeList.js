import React, { useState } from "react";
import '../App.css';

const MemeList = ({ memes, APIurl }) => {
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const memesPerPage = 20;

  // Pagination logic
  const indexOfLastMeme = currentPage * memesPerPage;
  const indexOfFirstMeme = indexOfLastMeme - memesPerPage;
  const currentMemes = memes.slice(indexOfFirstMeme, indexOfLastMeme);
  const totalPages = Math.ceil(memes.length / memesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      {selectedMeme ? (
        <div className="meme-details">
          <h2>{selectedMeme.title}</h2>
          <img
            src={selectedMeme.image_url.startsWith("http") ? selectedMeme.image_url : `${APIurl}${selectedMeme.image_url}`}
            alt={selectedMeme.title}
            className="meme-details-image"
          />
          <p>{selectedMeme.description}</p>
          <p>
            <strong>Categories:</strong> {selectedMeme.categories}
          </p>
          <button className="btn btn-danger" onClick={() => setSelectedMeme(null)}>
            Close
          </button>
        </div>
      ) : (
        <div>
          <div className="meme-grid">
            {currentMemes.map((meme) => (
              <div key={meme.id} className="meme-card" onClick={() => setSelectedMeme(meme)}>
                <img
                  src={`${APIurl}${meme.image_url}`}
                  alt={meme.title}
                  className="meme-image"
                />
                <h3 className="meme-title">{meme.title}</h3>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {memes.length > memesPerPage && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemeList;
