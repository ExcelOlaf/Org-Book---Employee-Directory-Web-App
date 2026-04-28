import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from "@aws-amplify/auth";
import { API_BASE_URL } from "../utils/apiRoute";
import { authenticatedFetch } from "../utils/authenticatedFetch";

export default function Settings() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");
  const [textSize, setTextSize] = useState("medium");

  useEffect(() => {
    fetchAuthSession().then((session) => {
      const payload = (session.tokens?.idToken?.payload ??
        session.tokens?.accessToken?.payload ??
        {}) as Record<string, any>;
      const id = payload?.["employeeId"] ?? payload?.["custom:employeeId"];
      if (id) setEmployeeId(Number(id));
    });
  }, []);

  const resizeImage = (file: File, size: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const minDimension = Math.min(img.width, img.height);
        const sx = (img.width - minDimension) / 2;
        const sy = (img.height - minDimension) / 2;
        ctx.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size);
        canvas.toBlob((blob) => resolve(blob!), "image/png");
      };

      const reader = new FileReader();
      reader.onload = () => {
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employeeId) return;

    setUploading(true);
    setUploadSuccess(false);
    setUploadError("");

    try {
      const resized = await resizeImage(file, 227);

      const urlRes = await authenticatedFetch(
        `${API_BASE_URL}/employees/${employeeId}/upload-url?fileType=${encodeURIComponent("image/png")}`
      );
      if (!urlRes.ok) {
        throw new Error("Failed to get upload URL");
      }
      const { uploadUrl, pictureUrl } = await urlRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: resized,
        headers: { "Content-Type": "image/png" },
      });
      if (!uploadRes.ok) {
        throw new Error("Failed to upload image to S3");
      }

      const updateRes = await authenticatedFetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Picture: pictureUrl }),
      });
      if (!updateRes.ok) {
        throw new Error("Failed to save picture URL");
      }

      setUploadSuccess(true);
    } catch (err) {
      setUploadError("Failed to upload picture. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

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

      {/* Profile Picture Upload */}
      <section className="settings__section">
        <h3 className="settings__section-title">Profile Picture</h3>
        <input 
          type="file"
          accept="image/*"
          className="settings__file-input"
          onChange={handlePictureUpload}
          disabled={uploading || !employeeId} 
        />
        {uploading && <p className="settings__info-item">Uploading...</p>}
        {uploadSuccess && <p className="settings__info-item" style={{ color: "green" }}>Picture uploaded successfully!</p>}
        {uploadError && <p className="settings__info-item" style={{ color: "red" }}>{uploadError}</p>}
      </section>

      {/* Back Button */}
      <button className="settings__back-button" onClick={goToDashboard}>
        Back to Dashboard
      </button>
    </div>
  );
}