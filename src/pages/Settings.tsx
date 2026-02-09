import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");
  const [textSize, setTextSize] = useState("medium");

  const goToDashboard = () => {
    navigate("/dashboard"); // navigates back to dashboard
  };


  // What types of things do we need in a settings page?
  // Maybe a language setting, color theme, notification preferences, accessibility, user info,
  // account management, 
  return (
    <div style={{ padding: "50px", maxWidth: "600px", margin: "0 auto"}}>
      <h1>Settings</h1>

      {/* Language Setting */}
      <section style={{ marginTop: "30px"}}>
        <h3>Language</h3>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: "8px", width: "100%"}}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        </select>
      </section>

      {/* Theme Setting */}
      <section style={{ marginTop: "30px" }}>
        <h3>Theme</h3>
        <label style={{ color: "white", display: "block", marginTop: "8px" }}>
          <input 
            type="radio"
            name="theme"
            value="light"
            checked={theme === "light"}
            onChange={() => setTheme("light")}
          />
          Light Mode
        </label>
        <label style={{ color: "white", display: "block", marginTop: "8px" }}>
          <input 
            type="radio"
            name="theme"
            value="dark"
            checked={theme === "dark"}
            onChange={() => setTheme("dark")}
          />
          Dark Mode
        </label>
      </section>

      {/* Accessibility Options */}
      <section style={{ marginTop: "30px" }}>
        <h3>Accessibility</h3>
        <label>
          Text Size:
          <select
            value={textSize}
            onChange={(e) => setTextSize(e.target.value)}
            style={{ marginTop: "10px", padding: "5px"}}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </section>

      {/* Account Info */}
      <section style={{ marginTop: "30px" }}>
        <h3>Account Info</h3>
        <p><strong>Username:</strong> user123</p>
        <p><strong>Email:</strong> user@example.com</p>
        <button style={{ marginTop: "10px", padding: "8px 16px"}}>
          Manage Account
        </button>
      </section>

      {/* Back Button */}
      <button
        onClick={goToDashboard}
        style={{
          marginTop: "40px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
