import React, {useState, useEffect} from 'react';
import logo from './wiki-logo.png';
import './App.css';
import AddMemeForm from './Components/AddMemeForm';
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [memes, setMemes] = useState([]);
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/memes')
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
          <li><img src={logo} className="App-logo" alt="logo" /></li>
          <li>Your encyclopedia of internet memes!</li>
          <li><input 
                type="text"
                placeholder="Search for a meme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-group"
              />
          </li> 
        </ul>
      </header>
      <div className='row align-items-start'>
        <div className='col'>
            <h3>Add meme to WikiMemes</h3>
            <AddMemeForm />
        </div>
        <div className='col'>
              <main>

              {selectedMeme ? (
                  <div className="meme-details">
                    <h2>{selectedMeme.title}</h2>
                    <img
                      src={selectedMeme.image_url}
                      alt={selectedMeme.title}
                      className="meme-details-image"
                    />
                    <p>{selectedMeme.description}</p>
                    <p>
                      <strong>Categories:</strong> {selectedMeme.categories.join(", ")}
                    </p>
                    <button className='btn btn-danger' onClick={() => setSelectedMeme(null)}>Close</button>
                  </div>
                ) : (

                <div className="meme-list">
                  {filteredMemes.map((meme) => (
                    <div
                      key={meme.id}
                      className="meme-card"
                      onClick={() => setSelectedMeme(meme)}
                    >
                      <img src={meme.image_url} alt={meme.title} className="meme-image" />
                      <p style={{color: "whitesmoke"}}>See meme details..</p>
                      <h3 className="meme-title">{meme.title}</h3>
                      <hr style={{color: "orange"}} ></hr>
                    </div>
                  ))}
                </div>
                )};
              </main>
        </div>
          <div className='col'>
          
          </div>
      </div>
    </div>
  );
}

export default App;
