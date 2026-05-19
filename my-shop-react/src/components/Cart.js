// Author: Christian Gewehr
// Cart.js – Displays the user's current cart items, allows quantity updates
// and item removal, and shows the total price.
// If the user is not logged in, a prompt is shown instead of the cart,
// following industry practice (e.g. Amazon, ASOS) where browsing is public
// but purchasing requires an account.

import React from "react";
import { Link } from "react-router-dom";
import { isLoggedIn } from "../api/cart";

export default function Cart({ items, updateQuantity, removeItem, className }) {
  // Total is derived directly from the items array on every render.
  // No separate state is needed since total always depends on items.
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <aside className={`column-cart ${className || ""}`}>
      <div id="cart">
        <h3>Cart</h3>
        <div id="cart-items">
          {/* Show login prompt for guests instead of an empty cart */}
          {!isLoggedIn() ? (
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
        <button className="checkout-btn" disabled={!isLoggedIn() || items.length === 0}>
          Checkout
        </button>
      </div>
    </aside>
  );
}
