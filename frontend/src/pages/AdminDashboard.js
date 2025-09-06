// AdminDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import "../css/AdminDashboard.css";
import "../css/Modal.css";
import { FaUser, FaUserTie, FaStore, FaStar, FaPlus, FaSignOutAlt } from "react-icons/fa";

const AdminDashboard = () => {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({ userCount: 0, storeCount: 0, ratingCount: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showAddStoreForm, setShowAddStoreForm] = useState(false);
  const [showStoresPanel, setShowStoresPanel] = useState(false);
  const [showUsersPanel, setShowUsersPanel] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    role: "USER",
  });
  const [newStore, setNewStore] = useState({ name: "", email: "", address: "", ownerId: "" });
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [userError, setUserError] = useState("");
  const [storeError, setStoreError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;

  // Get logged-in admin name
  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.name);
    }
  }, [token]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        userCount: res.data.user_count || 0,
        storeCount: res.data.store_count || 0,
        ratingCount: res.data.rating_count || 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // Fetch all stores
  const fetchStores = async () => {
    try {
      const res = await axios.get(`${API_URL}/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Add User
  const handleAddUser = async () => {
    const { name, email, password, confirmPassword, address, role } = newUser;
    if (!name || !email || !password || !confirmPassword || !address || !role) {
      setUserError("Fill all user fields");
      return;
    }
    if (name.length < 20 || name.length > 60) {
      setUserError("User name must be between 20 and 60 characters");
      return;
    }
    if (address.length > 400) {
      setUserError("Address cannot exceed 400 characters");
      return;
    }
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(password)) {
      setUserError(
        "Password must be 8-16 characters, include 1 uppercase & 1 special char"
      );
      return;
    }
    if (password !== confirmPassword) {
      setUserError("Passwords do not match");
      return;
    }

    setUserError("");

    try {
      await axios.post(`${API_URL}/auth/register`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User added successfully!");
      setShowAddUserForm(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        role: "USER",
      });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setUserError(err.response?.data?.error || "Failed to add user");
    }
  };

  // Add Store
  const handleAddStore = async () => {
    const { name, email, address, ownerId } = newStore;
    if (!name || !email || !address || !ownerId) {
      setStoreError("Fill all store fields");
      return;
    }
    if (address.length > 400) {
      setStoreError("Address cannot exceed 400 characters");
      return;
    }

    setStoreError("");

    try {
      await axios.post(`${API_URL}/stores`, newStore, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Store added successfully!");
      setShowAddStoreForm(false);
      setNewStore({ name: "", email: "", address: "", ownerId: "" });
      fetchStores();
      fetchStats();
    } catch (err) {
      setStoreError(err.response?.data?.error || "Failed to add store");
    }
  };

  // Sort users by role
  const admins = users.filter((u) => u.role === "ADMIN");
  const storeOwners = users.filter((u) => u.role === "STORE_OWNER");
  const normalUsers = users.filter((u) => u.role === "USER");

  const roleSortedUsers = [...admins, ...storeOwners, ...normalUsers];

  // Store owners without stores
  const availableStoreOwners = storeOwners.filter(
    (owner) => !stores.some((s) => s.ownerId?.toString() === owner.id?.toString())
  );

  // Filters
  const filteredUsers = roleSortedUsers.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.address.toLowerCase().includes(searchQuery.toLowerCase());
    if (roleFilter === "ALL") return matchQuery;
    return matchQuery && u.role === roleFilter;
  });

  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating) => {
    if (rating === null || rating === undefined) return <span>N/A</span>;
    const rounded = Math.round(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rounded ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return (
      <span className="ratings-inline">
        {stars} <span className="rating-number">({Math.round(rating * 10) / 10})</span>
      </span>
    );
  };

  const openStoresPanel = () => {
    setShowStoresPanel(true);
    setShowUsersPanel(false);
  };
  const openUsersPanel = () => {
    setShowUsersPanel(true);
    setShowStoresPanel(false);
  };
  const closePanels = () => {
    setShowStoresPanel(false);
    setShowUsersPanel(false);
  };

  return (
    <div className="admin-dashboard">
      {/* NAVBAR */}
      <div className="navbar">
        <div className="nav-left">
          <FaUserTie className="admin-icon" />
          <span>{userName.toUpperCase()}</span>
        </div>
        <div className="nav-center">Admin Dashboard</div>
        <div className="nav-right">
          <button onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-container">
        <div className="stat-card">
          <FaUser className="stat-icon user-icon" />
          <div className="stat-info">
            <p className="stat-number">{stats.userCount}</p>
            <p className="stat-label">Users</p>
          </div>
        </div>
        <div className="stat-card">
          <FaStore className="stat-icon store-icon" />
          <div className="stat-info">
            <p className="stat-number">{stats.storeCount}</p>
            <p className="stat-label">Stores</p>
          </div>
        </div>
        <div className="stat-card">
          <FaStar className="stat-icon rating-icon" />
          <div className="stat-info">
            <p className="stat-number">{stats.ratingCount}</p>
            <p className="stat-label">Ratings</p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="action-buttons">
        <button onClick={() => setShowAddUserForm(true)}>
          <FaPlus /> Add User
        </button>
        <button onClick={() => setShowAddStoreForm(true)}>
          <FaPlus /> Add Store
        </button>
        <button onClick={openUsersPanel}>View Users</button>
        <button onClick={openStoresPanel}>View Stores</button>
      </div>

      {/* ADD USER MODAL */}
      {showAddUserForm && (
        <Modal onClose={() => setShowAddUserForm(false)}>
          <h2>Add User</h2>
          {userError && <p className="error-msg">{userError}</p>}
          <input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={newUser.confirmPassword}
            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
          />
          <input
            placeholder="Address"
            value={newUser.address}
            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="USER">USER</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button onClick={handleAddUser}>Add User</button>
        </Modal>
      )}

      {/* ADD STORE MODAL */}
      {showAddStoreForm && (
        <Modal onClose={() => setShowAddStoreForm(false)}>
          <h2>Add Store</h2>
          {storeError && <p className="error-msg">{storeError}</p>}
          <input
            placeholder="Name"
            value={newStore.name}
            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={newStore.email}
            onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
          />
          <input
            placeholder="Address"
            value={newStore.address}
            onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
          />
          <select
            value={newStore.ownerId}
            onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
          >
            <option value="">Select Owner</option>
            {availableStoreOwners.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <button onClick={handleAddStore}>Add Store</button>
        </Modal>
      )}

      {/* USERS PANEL */}
      {showUsersPanel && (
        <div className="panel users-panel">
          <h3>All Users</h3>
          <input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">ALL</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
            <option value="USER">USER</option>
          </select>
          <button onClick={closePanels}>Close</button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className="role-dot"
                      style={{ backgroundColor: u.role === "ADMIN" ? "green" : "blue" }}
                    ></span>
                    {u.role}
                  </td>
                  <td>{u.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* STORES PANEL */}
      {showStoresPanel && (
        <div className="panel stores-panel">
          <h3>All Stores</h3>
          <input
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={closePanels}>Close</button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Owner</th>
                <th>Address</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((s) => {
                const owner = users.find((u) => u.id?.toString() === s.ownerId?.toString());
                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{owner?.name || "N/A"}</td>
                    <td>{s.address}</td>
                    <td>{renderStars(s.avgRating)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
