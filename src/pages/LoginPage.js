import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirect to admin page on successful login
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
    }
    setIsLoading(false);
  };

  return (
    <section className="login-page">
      <div className="container">
        <form onSubmit={handleLogin} className="login-form">
          <h2 className="section-title">Admin Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="button button--primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {error && <p className="form-message form-message--error">{error}</p>}
        </form>
      </div>
    </section>
  );
}