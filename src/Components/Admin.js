import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Admin= () => {
  const [memes, setMemes] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [image, setImage] = useState(null);
  const [editingMeme, setEditingMeme] = useState(null);

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/memes');
      const data = await response.json();
      setMemes(data);
    } catch (error) {
      console.error('Error fetching memes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categories', categories);
    if (image) formData.append('image', image);

    try {
      const response = await fetch(
        editingMeme ? `http://localhost:5000/api/memes/${editingMeme.id}` : 'http://localhost:5000/api/memes',
        {
          method: editingMeme ? 'PUT' : 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Failed to save meme');

      fetchMemes();
      setTitle('');
      setDescription('');
      setCategories('');
      setImage(null);
      setEditingMeme(null);
    } catch (error) {
      console.error('Error saving meme:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/memes/${id}`, { method: 'DELETE' });
      fetchMemes();
    } catch (error) {
      console.error('Error deleting meme:', error);
    }
  };

  const handleEdit = (meme) => {
    setTitle(meme.title);
    setDescription(meme.description);
    setCategories(meme.categories);
    setEditingMeme(meme);
  };

  return (
    <div className='App'>
     <Link to="/" >Home</Link>
      <h2>{editingMeme ? 'Edit Meme' : 'Add Meme'}</h2>
      <form onSubmit={handleSubmit}>
        <input className="form-control" type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea class="form-control" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input className="form-control" type="text" placeholder="Categories" value={categories} onChange={(e) => setCategories(e.target.value)} />
        <input className="form-control" type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button className='btn btn-primary' type="submit">{editingMeme ? 'Update' : 'Add'} Meme</button>
      </form>
      
      <h2>Meme List</h2>
      <div className="card">
      <ul>
        {memes.map((meme) => (
          <li key={meme.id}>
            <img src={`http://localhost:5000${meme.image_url}`} className="car" alt={meme.title} style={{width: "40", height:"40"}} />
            <div class="card-body">
            <h3 className='card-title'>{meme.title}</h3>
            <p className='card-text'>{meme.description}</p>
            <button className='btn btn-dark' onClick={() => handleEdit(meme)}>Edit</button>
            <button className='btn btn-danger' onClick={() => handleDelete(meme.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
};

export default Admin;