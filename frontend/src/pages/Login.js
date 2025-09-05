import React, { useState } from "react";
import axios from "../api/axiosConfig";
import { setToken } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import "../css/Login.css";

const Login = ({ setRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("/auth/login", { email, password });
      const { token, user } = response.data;

      // Save JWT and role
      setToken(token);
      localStorage.setItem("role", user.role);
      setRole(user.role);

      // Redirect based on role
      if (user.role === "ADMIN") navigate("/admin-dashboard");
      else if (user.role === "STORE_OWNER") navigate("/store-owner-dashboard");
      else navigate("/user-dashboard");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p className="signup-link">
        Don't have an account? <Link to="/register">Sign up here</Link>
      </p>
    </div>
  );
};

export default Login;
