import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "@aws-amplify/auth";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn({ username, password });

      if (result.isSignedIn) {
        navigate("/dashboard");
      } else {
        // Handles NEW_PASSWORD_REQUIRED, MFA, etc.
        setError("Additional verification required. Please contact your administrator.");
      }
    } catch (err: any) {
      if (err.name === "NotAuthorizedException" || err.name === "UserNotFoundException") {
        setError("Invalid username or password.");
      } else {
        console.error("Login error:", err);
        setError(err.message || "An error occurred during sign in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <img src="/OrgBookLogo.png" alt="OrgBook Logo" className="login__logo"/>

      <form className="login__form" onSubmit={handleLogin}>
        <div className="login__field">
          <label className="login__label">Username:</label>
          <input
            type="text"
            className="login__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="login__field">
          <label className="login__label">Password:</label>
          <input
            type="password"
            className="login__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        {error && <p className="login__error">{error}</p>}
        <button type="submit" className="login__button" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;