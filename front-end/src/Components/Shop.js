import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState(null); // Track expanded image

  const APIurl = process.env.REACT_APP_API_URL;
  

  useEffect(() => {
    
    axios.get(`${APIurl}/api/products`)
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          setProducts(res.data.data);
        } else {
          console.error("Unexpected response from API:", res.data);
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [APIurl]);

  if (loading) return <div>Loading products...</div>;

  return (           
      <div className="product-container">
            {products.map((product) => {
              const productImage = product.images?.[0]?.src || 'default-placeholder.jpg';
              return (
               
                <div key={product.id} className="product-card">
                  <img
                    src={productImage}
                    alt={product.title}
                    className={`product-image ${expandedImage === product.id ? "expanded" : ""}`}
                    onClick={() => setExpandedImage(expandedImage === product.id ? null : product.id)}
                  />
                  <h3>{product.title}</h3>
                  <p>${product.price}</p>
                  <button className='btn btn-warning'> 
                    <a href={`https://donthememe.printify.me/product/${product.id}`} target="_blank" rel="noopener noreferrer">
                      Don This Meme
                    </a>
                  </button>
                  <div></div>
                </div>                
              );
            })}
      </div>
  );
};

export default Shop;
