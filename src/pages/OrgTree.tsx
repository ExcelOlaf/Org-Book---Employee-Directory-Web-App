import React from "react";
import { useNavigate } from "react-router-dom";

export default function OrgTree() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px" }}>
      <h1>Org Tree</h1>
      <button
        onClick={() => navigate("/dashboard")}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
