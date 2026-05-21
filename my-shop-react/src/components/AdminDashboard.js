// Author: Christian Gewehr
// AdminDashboard.js – Admin-only view with two tabs:
// 1) Users: shows all registered users and their cart contents
// 2) Products: full CRUD interface for the product catalogue
// Access is restricted on both frontend (redirect) and backend (verifyToken + isAdmin).
// useState is used for tab switching instead of React Router since both views
// are part of the same page and do not need separate URLs.

import { useState, useEffect } from "react";
import { getToken, getUser, BASE_URL } from "../api/cart";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  // ── Users state ────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);

  // ── Products state ─────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  // Form state for adding/editing a product
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", img: "", features: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser?.isAdmin) {
      navigate("/");
      return;
    }
    fetchUsers();
    fetchProducts();
  }, []);

  // ── Auth header helper ─────────────────────────────────────────────────────
  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    };
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/carts`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load users.");
      setUsers(await res.json());
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const toggleUser = (id) => setExpandedUser(prev => (prev === id ? null : id));

  // ── Products ───────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/products`);
      if (!res.ok) throw new Error("Failed to load products.");
      setProducts(await res.json());
    } catch (err) {
      setProductsError(err.message);
    } finally {
      setProductsLoading(false);
    }
  };

  // Populate the form when editing an existing product.
  // features are stored as an array in DB but edited as a comma-separated string.
  const startEdit = (product) => {
    setEditingProduct(product.id);
    setForm({
      name: product.name,
      price: product.price,
      img: product.img,
      features: product.features.join(", "),
    });
    setFormError("");
    setFormSuccess("");
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm({ name: "", price: "", img: "", features: "" });
    setFormError("");
    setFormSuccess("");
  };

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // CREATE – POST /products
  const handleCreate = async () => {
    setFormError("");
    setFormSuccess("");
    if (!form.name || !form.price) {
      setFormError("Name and price are required.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          features: form.features.split(",").map(f => f.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to create product.");
      setFormSuccess("Product created.");
      cancelEdit();
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
    }
  };

  // UPDATE – PUT /products/:id
  const handleUpdate = async () => {
    setFormError("");
    setFormSuccess("");
    if (!form.name || !form.price) {
      setFormError("Name and price are required.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/products/${editingProduct}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          features: form.features.split(",").map(f => f.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to update product.");
      setFormSuccess("Product updated.");
      cancelEdit();
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
    }
  };

  // DELETE – DELETE /products/:id
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete product.");
      fetchProducts();
    } catch (err) {
      setProductsError(err.message);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="admin-container">
      <h2 className="admin-title">Admin Dashboard</h2>

      {/* Tab navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
      </div>

      {/* ── USERS TAB ── */}
      {activeTab === "users" && (
        <>
          {usersLoading && <p>Loading...</p>}
          {usersError && <p className="auth-error">{usersError}</p>}
          {!usersLoading && !usersError && (
            <>
              <p className="admin-subtitle">
                {users.length} registered user{users.length !== 1 ? "s" : ""}
              </p>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Cart Items</th>
                      <th>Cart Total</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <>
                        <tr key={user._id} className="admin-row">
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.isAdmin ? "admin" : "user"}`}>
                              {user.isAdmin ? "Admin" : "User"}
                            </span>
                          </td>
                          <td>{user.cartItems.length}</td>
                          <td>${user.cartTotal.toFixed(2)}</td>
                          <td>
                            <button
                              className="admin-expand-btn"
                              onClick={() => toggleUser(user._id)}
                              disabled={user.cartItems.length === 0}
                            >
                              {expandedUser === user._id ? "Hide" : "Show"} Cart
                            </button>
                          </td>
                        </tr>
                        {expandedUser === user._id && (
                          <tr key={`${user._id}-cart`} className="admin-cart-row">
                            <td colSpan="6">
                              <table className="admin-cart-table">
                                <thead>
                                  <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {user.cartItems.map(item => (
                                    <tr key={item.id}>
                                      <td>{item.name}</td>
                                      <td>{item.quantity}</td>
                                      <td>${item.price.toFixed(2)}</td>
                                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ── PRODUCTS TAB ── */}
      {activeTab === "products" && (
        <>
          {productsLoading && <p>Loading...</p>}
          {productsError && <p className="auth-error">{productsError}</p>}
          {!productsLoading && !productsError && (
            <>
              <p className="admin-subtitle">
                {products.length} product{products.length !== 1 ? "s" : ""} in catalogue
              </p>

              {/* Add / Edit form */}
              <div className="product-form">
                <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                {formError && <p className="auth-error">{formError}</p>}
                {formSuccess && <p className="auth-success">{formSuccess}</p>}
                <div className="product-form-fields">
                  <input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} />
                  <input name="price" placeholder="Price" type="number" value={form.price} onChange={handleFormChange} />
                  <input name="img" placeholder="Image path (e.g. /pics/beach/towel.jpg)" value={form.img} onChange={handleFormChange} />
                  <input name="features" placeholder="Features (comma-separated)" value={form.features} onChange={handleFormChange} />
                </div>
                <div className="product-form-actions">
                  {editingProduct ? (
                    <>
                      <button className="admin-save-btn" onClick={handleUpdate}>Save Changes</button>
                      <button className="admin-cancel-btn" onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <button className="admin-save-btn" onClick={handleCreate}>Add Product</button>
                  )}
                </div>
              </div>

              {/* Product list */}
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="admin-row">
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td className="admin-actions">
                          <button className="admin-edit-btn" onClick={() => startEdit(product)}>Edit</button>
                          <button className="admin-delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
