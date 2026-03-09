import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");
  const [textSize, setTextSize] = useState("medium");

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="settings">
      <h1 className="settings__title">Settings</h1>

      {/* Language Setting */}
      <section className="settings__section">
        <h3 className="settings__section-title">Language</h3>
        <select
          className="settings__select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </section>

      {/* Theme Setting */}
      <section className="settings__section">
        <h3 className="settings__section-title">Theme</h3>
        <label className="settings__radio-label">
          <input
            type="radio"
            name="theme"
            value="light"
            className="settings__radio-input"
            checked={theme === "light"}
            onChange={() => {
              setTheme("light");
              document.documentElement.setAttribute("data-theme", 'light');
            }}
          />
          Light Mode
        </label>
        <label className="settings__radio-label">
          <input
            type="radio"
            name="theme"
            value="dark"
            className="settings__radio-input"
            checked={theme === "dark"}
            onChange={() => {
              setTheme("dark");
              document.documentElement.setAttribute("data-theme", 'dark');
            }}
          />
          Dark Mode
        </label>
      </section>

      {/* Accessibility Options */}
      <section className="settings__section">
        <h3 className="settings__section-title">Accessibility</h3>
        <label className="settings__label">
          Text Size:
          <select
            className="settings__text-size-select"
            value={textSize}
            onChange={(e) => {
              setTextSize(e.target.value)
              document.documentElement.setAttribute("data-text-size", e.target.value);
            }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </section>

      {/* Account Info */}
      <section className="settings__section">
        <h3 className="settings__section-title">Account Info</h3>
        <p className="settings__info-item">
          <span className="settings__info-label">Username:</span> admin
        </p>
        <p className="settings__info-item">
          <span className="settings__info-label">Email:</span> admin@example.com
        </p>
        <button className="settings__button">Manage Account</button>
      </section>

      {/* Back Button */}
      <button className="settings__back-button" onClick={goToDashboard}>
        Back to Dashboard
      </button>
    </div>
  );
}