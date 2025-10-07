import React from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate("/dashboard"); // navigates back to dashboard
  };

  return (
    <div style={{ padding: "50px" }}>
      <h1>Settings Page</h1>
      <button onClick={goToDashboard} style={{ marginTop: "20px", padding: "10px 20px" }}>
        Back to Dashboard
      </button>
    </div>
  );
}
