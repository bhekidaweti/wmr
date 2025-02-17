import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import AddMemeForm from './AddMemeForm';
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Admin= () => {
  const [memes, setMemes] = useState([]);
  const [editingMeme, setEditingMeme] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(setUser);
    });
    fetchMemes();
    return () => unsubscribe();
  }, []);



  const fetchMemes = async () => {
    try {
      const response = await fetch('https://w-backend-0ij7.onrender.com/api/memes');
      const data = await response.json();
      setMemes(data);
    } catch (error) {
      console.error('Error fetching memes:', error);
    }
  };

  const handleMemeAdded = (newMeme) => {
    setMemes([...memes, newMeme]);
  };

  const handleMemeUpdated = (updatedMeme) => {
    setMemes(memes.map(meme => (meme.id === updatedMeme.id ? updatedMeme : meme)));
    setEditingMeme(null);
  };

  const handleMemeDeleted = (id) => {
    setMemes(memes.filter(meme => meme.id !== id));
    setEditingMeme(null);
  };

  const handleEdit = (meme) => {
    setEditingMeme(meme);
  };


  if (!user) {
    return <p>Please log in to access the admin panel.</p>;
  }

  return (
    <div className='App'>
      <Link to="/">Home</Link>
      <h2>{editingMeme ? 'Edit Meme' : 'Add Meme'}</h2>
      <AddMemeForm 
        onMemeAdded={handleMemeAdded} 
        memeToEdit={editingMeme} 
        onMemeUpdated={handleMemeUpdated} 
        onMemeDeleted={handleMemeDeleted} 
      />

      <h2>Meme List</h2>
      <div className="card">
        <ul>
          {memes.map((meme) => (
            <li key={meme.id}>
              <img src={`https://w-backend-0ij7.onrender.com${meme.image_url}`} className="car" alt={meme.title} style={{width: "40px", height:"40px"}} />
              <div className="card-body">
                <h3 className='card-title'>{meme.title}</h3>
                <p className='card-text'>{meme.description}</p>
                <button className='btn btn-dark' onClick={() => handleEdit(meme)}>Edit</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Admin;
