import React, { useState } from 'react';

const AddMemeForm = ({ onMemeAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/memes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, categories, image_url: imageUrl }),
    });
    const newMeme = await response.json();
    onMemeAdded(newMeme);
  };

  return (
    <form onSubmit={handleSubmit}>
        <div className='mb-3'>
        <input
            type="text"
            class="form-control"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
        />
        <textarea
            placeholder="Description"
            class="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
        />
        <input
            type="text"
            class="form-control"
            placeholder="Categories (comma-separated)"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
        />
        <input
            type="text"
            class="form-control"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
        />
        <button className='btn btn-primary' type="submit">Add Meme</button>
        </div>
    </form>
  );
};

export default AddMemeForm;
