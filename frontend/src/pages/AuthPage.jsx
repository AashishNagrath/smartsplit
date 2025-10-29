import { useState } from "react";
import RegisterForm from "../components/RegistrationForm";
import LoginForm from "../components/LoginForm";

export default function AuthPage({ onLogin }) {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div>
      {showRegister ? (
        <>
          <RegisterForm />
          <p>
            Already have an account? <button onClick={() => setShowRegister(false)}>Login</button>
          </p>
        </>
      ) : (
        <>
          <LoginForm onLogin={onLogin} />
          <p>
            Don't have an account? <button onClick={() => setShowRegister(true)}>Register</button>
          </p>
        </>
      )}
    </div>
  );
}
