import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; 

const AddMemeForm = ({ onMemeAdded, onMemeUpdated, onMemeDeleted }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('You must be logged in to add a meme.');
            return;
        }
        
        const memeData = { title, description, imageUrl };
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/memes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memeData)
            });
            if (response.ok) {
                onMemeAdded();
                setTitle('');
                setDescription('');
                setImageUrl('');
            }
        } catch (error) {
            console.error('Error adding meme:', error);
        }
    };

    return (
        <div>
            <h2>Add Meme</h2>
            {user ? (
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                    <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
                    <button type="submit">Submit</button>
                </form>
            ) : (
                <p>Please log in to add memes.</p>
            )}
        </div>
    );
};

export default AddMemeForm;
