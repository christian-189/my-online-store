// Author: Christian Gewehr
// ProductList.js – Fetches the product catalogue from the backend and displays
// it as a grid of product cards. Live search filters the list in real-time
// using controlled input state without requiring additional backend calls,
// since all products are already loaded into memory on mount.
// useState is used for products, search, and loading state separately to keep
// each concern isolated and re-renders minimal.

import { useState, useEffect } from "react";
import { BASE_URL } from "../api/cart";

export default function ProductList({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all products from the database on mount.
  // useEffect with empty dependency array ensures this runs only once.
  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load products.");
        return res.json();
      })
      .then(data => {
        setProducts(data);
        const initialQty = {};
        data.forEach(p => (initialQty[p.id] = 1));
        setQuantities(initialQty);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleQuantityChange = (id, value) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, value) }));
  };

  // Filter products in real-time as the user types.
  // toLowerCase() on both sides makes the search case-insensitive.
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="product-status">Loading products...</p>;
  if (error)   return <p className="product-status api-error">{error}</p>;

  return (
    <div className="product-list-wrapper">
      {/* Live search bar */}
      <div className="search-bar-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Clear button only appears when the search field is non-empty */}
        {search && (
          <button className="search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="search-no-results">No products found for "{search}".</p>
      )}

      <div className="product-grid">
        {filtered.map(item => (
          <div key={item.id} className="product-card">
            <div className="product-top">
              {/* alt text provided for accessibility */}
              <img src={item.img} alt={item.name} className="product-img" />
              <div className="product-infos">
                <h3>{item.name}</h3>
                <ul className="product-features">
                  {item.features.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="product-footer">
              <div className="cart-controls">
                <p className="product-price">${item.price.toFixed(2)}</p>
                <input
                  className="quantity"
                  type="number"
                  min="1"
                  value={quantities[item.id] || 1}
                  onChange={(e) =>
                    handleQuantityChange(item.id, parseInt(e.target.value))
                  }
                />
                <button onClick={() => addToCart(item, quantities[item.id] || 1)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
