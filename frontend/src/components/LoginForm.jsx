import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("Logging in...");
    try {
      const res = await api.post("/auth/login", form);
      console.log("Login response:", res.data); // 🧠 Debug log
      localStorage.setItem("token", res.data.token);
      setMsg("Login successful!");
      onLogin({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email
      });
    } catch (err) {
      console.error("Login error:", err);
      setMsg(err.response?.data?.message || "Login failed. Check credentials.");
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
