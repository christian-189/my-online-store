// Author: Christian Gewehr
// App.js – Root component. Manages global auth state and client-side routing.
// React Router is used to implement SPA navigation: all route transitions
// happen in the browser without reloading the page from the server.
// Cart state is lifted to App so it can be cleared on logout without
// requiring a page reload.

import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import "./style.css";

import {
  getUser,
  isLoggedIn,
  loadCartBackend,
  addToCartBackend,
  updateCartQuantityBackend,
  removeFromCartBackend,
} from "./api/cart";

// PrivateRoute redirects unauthenticated users to /login.
// Used only for admin route – the shop is publicly browsable.
function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// ShopPage displays the product list and cart side by side.
// useState is used instead of useReducer because cart state is always fully
// replaced by the API response; no action-based reducer logic is needed.
function ShopPage({ cart, setCart }) {
  const [cartError, setCartError] = useState("");

  // Load the cart from the database when the shop page mounts,
  // but only if the user is logged in.
  React.useEffect(() => {
    if (isLoggedIn()) {
      loadCartBackend()
        .then(setCart)
        .catch(() => setCartError("Could not load your cart. Please refresh."));
    }
  }, []);

  // If user is not logged in, show a message instead of adding to cart.
  const addToCart = async (product, qty) => {
    if (!isLoggedIn()) {
      setCartError("Please login to add items to your cart.");
      return;
    }
    try {
      const newItems = await addToCartBackend({ ...product, quantity: qty });
      setCart(newItems);
      setCartError("");
    } catch {
      setCartError("Failed to add item. Please try again.");
    }
  };

  const updateQuantity = async (id, qty) => {
    try {
      const newItems = await updateCartQuantityBackend(id, qty);
      setCart(newItems);
    } catch {
      setCartError("Failed to update quantity. Please try again.");
    }
  };

  const removeItem = async (id) => {
    try {
      const newItems = await removeFromCartBackend(id);
      setCart(newItems);
    } catch {
      setCartError("Failed to remove item. Please try again.");
    }
  };

  return (
    <main className="grid-container">
      {/* Show a non-blocking error/info message instead of a blank page */}
      {cartError && <p className="api-error">{cartError}</p>}
      <ProductList addToCart={addToCart} />
      <Cart
        items={cart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        className="column-cart"
      />
    </main>
  );
}

// Global auth and cart state is lifted to App so Header can clear the cart
// on logout and all routes react to login/logout events.
// getUser() initialises state from localStorage so the session persists
// across page refreshes without a new login.
function App() {
  const [user, setUser] = useState(getUser);
  const [cart, setCart] = useState([]);

  const handleLogin = (userData) => setUser(userData);

  // Clear both auth data and cart state on logout so the next
  // user starts with a clean state without needing a page reload.
  const handleLogout = () => {
    setUser(null);
    setCart([]);
  };

  return (
    <BrowserRouter>
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        {/* Public routes – accessible without a token */}
        <Route path="/"         element={<ShopPage cart={cart} setCart={setCart} />} />
        <Route path="/login"    element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />

        {/* Admin route – requires valid JWT with isAdmin flag */}
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />

        {/* Catch-all: any unknown path falls back to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;