import React, { useState, useEffect } from 'react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://wmr-jk4d.onrender.com/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          setLoading(false);
        } else {
          console.error("Unexpected response from API:", data);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
      setLoading(false);
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
