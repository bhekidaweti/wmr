import React, { useState, useEffect } from 'react';
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";

const AddMemeForm = ({ onMemeAdded, memeToEdit, onMemeUpdated, onMemeDeleted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [image, setImage] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (memeToEdit) {
      setTitle(memeToEdit.title);
      setDescription(memeToEdit.description);
      setCategories(memeToEdit.categories);
      setEditing(true);
    }
  }, [memeToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categories', categories);
    if (image) formData.append('image', image);

    const APIurl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    
    try {
      
      const url = editing ? `${APIurl}/api/memes/${memeToEdit.id}` : `${APIurl}/api/memes`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(editing ? 'Failed to update meme' : 'Failed to upload meme');
      }

      const newMeme = await response.json();
      editing ? onMemeUpdated(newMeme) : onMemeAdded(newMeme);

      setTitle('');
      setDescription('');
      setCategories('');
      setImage(null);
      setEditing(false);
    } catch (error) {
      console.error('Error submitting meme:', error);
    }
  };

  const handleDelete = async () => {
    if (!memeToEdit) return;
    try {
      const APIurl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${APIurl}/api/memes/${memeToEdit.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete meme');
      onMemeDeleted(memeToEdit.id);
      setTitle('');
      setDescription('');
      setCategories('');
      setImage(null);
      setEditing(false);
    } catch (error) {
      console.error('Error deleting meme:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          className="form-control"
          placeholder="Categories (comma-separated)"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
        />
        <input
          type="file"
          className="form-control"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button className="btn btn-primary" type="submit">
          {editing ? 'Update Meme' : 'Add Meme'}
        </button>
        {editing && (
          <button className="btn btn-danger ms-2" type="button" onClick={handleDelete}>
            Delete Meme
          </button>
        )}
      </div>
    </form>
  );
};

export default AddMemeForm;