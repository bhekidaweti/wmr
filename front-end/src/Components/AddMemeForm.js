import React, { useState, useEffect } from "react";
import { auth } from "./firebase";

const AddMemeForm = ({ onMemeAdded, memeToEdit, onMemeUpdated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // When a meme is selected for editing, populate fields
  useEffect(() => {
    if (memeToEdit) {
      setTitle(memeToEdit.title);
      setDescription(memeToEdit.description);
      setImageUrl(memeToEdit.image_url || ""); // Set existing URL if available
      setImageFile(null); // Reset file input
    }
  }, [memeToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to add or edit a meme.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (imageFile) {
      formData.append("image", imageFile); // Attach file if selected
    } else if (imageUrl) {
      formData.append("image_url", imageUrl); // Use URL if no file is uploaded
    }

    try {
      let response;
      if (memeToEdit) {
        // Editing existing meme
        response = await fetch(`https://w-backend-0ij7.onrender.com/api/memes/${memeToEdit.id}`, {
          method: "PUT",
          body: formData,
        });

        if (response.ok) {
          const updatedMeme = await response.json();
          onMemeUpdated(updatedMeme);
        }
      } else {
        // Adding new meme
        response = await fetch("https://w-backend-0ij7.onrender.com/api/memes", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const newMeme = await response.json();
          onMemeAdded(newMeme);
        }
      }

      // Reset fields after submission
      setTitle("");
      setDescription("");
      setImageUrl("");
      setImageFile(null);
    } catch (error) {
      console.error("Error saving meme:", error);
    }
  };

  return (
    <div>
      <h2>{memeToEdit ? "Edit Meme" : "Add Meme"}</h2>
      {user ? (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input type="text" className="form-control form-control-lg" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="text" className="form-control form-control-lg" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />

          {/* Image Upload or URL */}
          <input type="text" className="form-control form-control-lg"  placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={!!imageFile} />
          <input type="file" className="form-control form-control-lg"  accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} disabled={!!imageUrl} />

          <button className="btn btn-primary" type="submit">{memeToEdit ? "Update" : "Submit"}</button>
        </form>
      ) : (
        <p>Please log in to add or edit memes.</p>
      )}
    </div>
  );
};

export default AddMemeForm;
