import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebase';
import AddMemeForm from './AddMemeForm';
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Admin = () => {
  console.log('Admin component loaded');
  const [memes, setMemes] = useState([]);
  const [editingMeme, setEditingMeme] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);  // Correctly set the user state
      if (currentUser) {
        fetchMemes(); // Fetch memes only if the user is logged in
      }
    });

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

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <div>
        <p>Please log in to access the admin panel.</p>
        <button onClick={handleLogin} className="btn btn-primary">Log in with Google</button>
      </div>
    );
  }

  return (
    <div className='App'>
      <Link to="/">Home</Link>
      <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      <h2>{editingMeme ? 'Edit Meme' : 'Add Meme'}</h2>
      <AddMemeForm 
        onMemeAdded={(newMeme) => setMemes([...memes, newMeme])}
        memeToEdit={editingMeme} 
        onMemeUpdated={(updatedMeme) => {
          setMemes(memes.map(meme => (meme.id === updatedMeme.id ? updatedMeme : meme)));
          setEditingMeme(null);
        }}
        onMemeDeleted={(id) => {
          setMemes(memes.filter(meme => meme.id !== id));
          setEditingMeme(null);
        }}
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
                <button className='btn btn-dark' onClick={() => setEditingMeme(meme)}>Edit</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Admin;
