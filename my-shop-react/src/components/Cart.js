// Author: Christian Gewehr
// Cart.js – Displays the user's current cart items, allows quantity updates
// and item removal, and shows the total price.
// If the user is not logged in, a prompt is shown instead of the cart,
// following industry practice (e.g. Amazon, ASOS) where browsing is public
// but purchasing requires an account.
// user is passed as a prop from App instead of reading localStorage directly,
// keeping state management consistent with the rest of the application.

import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Cart({ items, updateQuantity, removeItem, className, user }) {
  // Controls the checkout notification toast.
  // useState is used instead of useRef because showing/hiding the toast
  // must trigger a re-render.
  const [showToast, setShowToast] = useState(false);

  // Total is derived directly from the items array on every render.
  // No separate state is needed since total always depends on items.
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <aside className={`column-cart ${className || ""}`}>
      {/* Checkout notification – appears in centre of screen */}
      {showToast && (
        <div className="toast">
          Checkout is not available yet.
        </div>
      )}

      <div id="cart">
        <h3>Cart</h3>
        <div id="cart-items">
          {/* Show login prompt for guests instead of an empty cart */}
          {!user ? (
            <p className="cart-login-prompt">
              <Link to="/login">Login</Link> or <Link to="/register">register</Link> to start shopping.
            </p>
          ) : items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <span>{item.name}</span>
                {/* Quantity input: min=1 prevents invalid entries.
                    onChange immediately triggers a backend update via updateQuantity. */}
                <input
                  className="cart-quantity"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, parseInt(e.target.value))
                  }
                />
                <span>x ${item.price.toFixed(2)}</span>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="cart-footer">
        <p>Total: ${total.toFixed(2)}</p>
        <button
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={!user || items.length === 0}
        >
          Checkout
        </button>
      </div>
    </aside>
  );
}