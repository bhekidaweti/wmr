import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  //const API_BASE_URL = process.env.REACT_APP_API_URL || "https://wmr-jk4d.onrender.com";
  
  useEffect(() => {
    axios.get("https://wmr-jk4d.onrender.com/api/products")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          console.error("Unexpected response from API:", res.data);
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false)); // Ensure loading is set to false after fetching
  }, []);

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="shop-container">
      <h2>DonTheMemes Merch</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.images[0]?.url || 'default-placeholder.jpg'}
              alt={product.title}
              className="product-image"
            />
            <h3>{product.title}</h3>
            <p>{product.price}</p>
            <a
              href={`https://printify.com/products/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="buy-button"
            >
              Buy Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
