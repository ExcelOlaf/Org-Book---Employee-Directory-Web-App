import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (username === "admin" && password === "password") {
            navigate("/dashboard");
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <div style={{  maxWidth: "400px", margin: "50px auto" }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit" style={{ padding: "10px 20px" }}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;