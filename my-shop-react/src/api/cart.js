// Author: Christian Gewehr
// api/cart.js – Central API layer for authentication and cart operations.
// All communication with the Express backend is handled here.
// Using a single BASE_URL constant avoids hardcoding the server address
// across multiple components.

export const BASE_URL = "http://localhost:3000";

// ── AUTH HELPERS ──────────────────────────────────────────────────────────────

// Persists token and user object in localStorage so the session survives
// a page refresh without requiring the user to log in again.
export function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

// Returns the stored JWT, used as a Bearer token in protected API requests.
export function getToken() {
  return localStorage.getItem("token");
}

// Returns the stored user object, or null if not logged in.
export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

// Clears all auth data from localStorage on logout.
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Quick check for whether a token exists in localStorage.
// Note: this does not verify the token server-side.
export function isLoggedIn() {
  return !!getToken();
}

// ── AUTH API CALLS ────────────────────────────────────────────────────────────

// POST /auth/register – creates a new user account.
export async function registerUser(username, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed.");
  return data;
}

// POST /auth/login – authenticates the user and stores the returned JWT.
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed.");
  saveAuth(data.token, data.user);
  return data.user;
}

// ── CART HELPERS ──────────────────────────────────────────────────────────────

// Builds the Authorization header required by all protected cart routes.
// JWT is sent as a Bearer token as per the RFC 6750 standard.
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// Retrieves the userId from the stored user object.
// Throws an error if no user is logged in, preventing unauthenticated requests.
function getUserId() {
  const user = getUser();
  if (!user) throw new Error("Not logged in.");
  return user.userId;
}

// ── CART API CALLS ────────────────────────────────────────────────────────────

// GET /cart/:userId – loads the current user's cart from the database.
export async function loadCartBackend() {
  const userId = getUserId();
  const res = await fetch(`${BASE_URL}/cart/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load cart.");
  const data = await res.json();
  return data.items || [];
}

// POST /cart – adds one or more items to the cart.
// The backend merges the new items with any existing ones.
export async function addToCartBackend(product) {
  const userId = getUserId();
  const res = await fetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ userId, items: [product] }),
  });
  if (!res.ok) throw new Error("Failed to add item to cart.");
  const data = await res.json();
  return data.items || [];
}

// PUT /cart/:userId/:id – updates the quantity of a specific cart item.
export async function updateCartQuantityBackend(id, quantity) {
  const userId = getUserId();
  const res = await fetch(`${BASE_URL}/cart/${userId}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Failed to update item quantity.");
  const data = await res.json();
  return data.items || [];
}

// DELETE /cart/:userId/:id – removes a specific item from the cart entirely.
export async function removeFromCartBackend(id) {
  const userId = getUserId();
  const res = await fetch(`${BASE_URL}/cart/${userId}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to remove item from cart.");
  const data = await res.json();
  return data.items || [];
}
