import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, confirmSignIn } from "@aws-amplify/auth";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn({ username, password });

      if (result.isSignedIn) {
        navigate("/dashboard");
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setNeedsNewPassword(true);
      } else {
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

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmSignIn({ challengeResponse: newPassword });
      if (result.isSignedIn) {
        navigate("/dashboard");
      } else {
        setError("Additional verification required. Please contact your administrator.");
      }
    } catch (err: any) {
      console.error("New password error:", err);
      setError(err.message || "Failed to set new password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <img src="/OrgBookLogo.png" alt="OrgBook Logo" className="login__logo"/>

      {!needsNewPassword ? (
        <form className="login__form" onSubmit={handleLogin}>
          <div className="login__field">
            <label className="login__label">Testing:</label>
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
      ) : (
        <form className="login__form" onSubmit={handleNewPassword}>
          <p className="login__label">Your temporary password has expired. Please set a new password.</p>
          <div className="login__field">
            <label className="login__label">New Password:</label>
            <input
              type="password"
              className="login__input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="login__field">
            <label className="login__label">Confirm New Password:</label>
            <input
              type="password"
              className="login__input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="login__error">{error}</p>}
          <button type="submit" className="login__button" disabled={isLoading}>
            {isLoading ? "Saving…" : "Set New Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;