import React, { useState } from 'react';

const AddMemeForm = ({ onMemeAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [image, setImage] = useState(null); // State to store the selected file

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData to handle file uploads
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categories', categories);
    formData.append('image', image); // Attach the file

    try {
      const response = await fetch('http://localhost:5000/api/memes', {
        method: 'POST',
        body: formData, // No need to set headers for FormData
      });

      if (!response.ok) {
        throw new Error('Failed to upload meme');
      }

      const newMeme = await response.json();
      onMemeAdded(newMeme); // Update the meme list
      setTitle('');
      setDescription('');
      setCategories('');
      setImage(null);
    } catch (error) {
      console.error('Error uploading meme:', error);
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
          onChange={(e) => setImage(e.target.files[0])} // Update state with the selected file
          required
        />
        <button className="btn btn-primary" type="submit">
          Add Meme
        </button>
      </div>
    </form>
  );
};

export default AddMemeForm;
