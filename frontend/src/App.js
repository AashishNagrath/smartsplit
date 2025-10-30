import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegistrationForm";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <>
              {!user && (
                <>
                  {showRegister ? (
                    <>
                      <RegisterForm />
                      <p>
                        Already have an account?{" "}
                        <button onClick={() => setShowRegister(false)}>
                          Login
                        </button>
                      </p>
                    </>
                  ) : (
                    <>
                      <LoginForm onLogin={handleLogin} />
                      <p>
                        Don’t have an account?{" "}
                        <button onClick={() => setShowRegister(true)}>
                          Register
                        </button>
                      </p>
                    </>
                  )}
                </>
              )}
            </>
          }
        />
        <Route
          path="/dashboard"
          element={<Dashboard user={user} onLogout={handleLogout} />}
        />
      </Routes>
    </div>
  );
}

export default App;
