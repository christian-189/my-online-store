import { useState, useEffect } from "react";

const allProducts = [
  {
    id: 1,
    name: "Beach towel",
    price: 19.99,
    img: "/pics/beach/towel.jpg",
    features: [
      "Perfect towel for sunny beach days",
      "Keeps you sandfree",
      "100% cotton – softer than ever before",
      "Safe for kids; no chemicals used."
    ]
  },
  {
    id: 2,
    name: "Cowboy hat",
    price: 19.99,
    img: "/pics/beach/hat.jpg",
    features: ["A stylish must-have", "Keeps your head cool", "100% cowboy vibes", "Aussie made"]
  },
  {
    id: 3,
    name: "Drinking bottle",
    price: 9.99,
    img: "/pics/beach/bottle.jpg",
    features: ["Leak proof", "BPA free", "500ml capacity", "Lightweight"]
  },
  {
    id: 4,
    name: "Cutting board",
    price: 14.99,
    img: "/pics/kitchen/cutting_board.jpg",
    features: ["Durable bamboo", "Perfect size", "Easy to clean", "Eco-friendly"]
  },
  {
    id: 5,
    name: "Chef's knife",
    price: 29.99,
    img: "/pics/kitchen/knife.jpg",
    features: ["Razor sharp", "Ergonomic handle", "Stainless steel", "Dishwasher safe"]
  },
  {
    id: 6,
    name: "Kitchen pan",
    price: 39.99,
    img: "/pics/kitchen/pan.jpg",
    features: ["Stainless steel", "Anti-stick coating", "Oven safe", "Easy to clean"]
  },
  {
    id: 7,
    name: "Kitchen scale",
    price: 24.99,
    img: "/pics/kitchen/scale.jpg",
    features: ["Accurate measurements", "Tare function", "Retro design", "Your best kitchen mate"]
  },
  {
    id: 8,
    name: "Pepper mill",
    price: 12.99,
    img: "/pics/kitchen/pepper_mill.jpg",
    features: ["Grinds your pepper smoothly", "Ceramic grinder", "East to handle", "Adds flavor to your dishes"]
  },
  {
    id: 9,
    name: "Garden chair",
    price: 49.99,
    img: "/pics/garden/chair.jpg",
    features: ["Comfortable seating", "Weather resistant", "100% wood", "Perfect for outdoor relaxation"]
  },
  {
    id: 10,
    name: "Hammock",
    price: 59.99,
    img: "/pics/garden/hammock.jpg",
    features: ["Perfect for relaxing", "Durable fabric", "Easy to set up", "Your personal paradise"]
  }
];

export default function ProductList({ addToCart }) {
  const [quantities, setQuantities] = useState({});
  // ── Live search state ──────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  useEffect(() => {
    const initialQty = {};
    allProducts.forEach(p => (initialQty[p.id] = 1));
    setQuantities(initialQty);
  }, []);

  const handleQuantityChange = (id, value) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, value) }));
  };

  // Filter products in real-time as the user types
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="product-list-wrapper">
      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <div className="search-bar-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {/* ── No results message ──────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <p className="search-no-results">No products found for "{search}".</p>
      )}

      {/* ── Product grid ────────────────────────────────────────────────── */}
      <div className="product-grid">
        {filtered.map(item => (
          <div key={item.id} className="product-card">
            <div className="product-top">
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