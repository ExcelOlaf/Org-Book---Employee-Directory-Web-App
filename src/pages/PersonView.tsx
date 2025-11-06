import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPersonById } from "../services/orgService";
import type { Person } from "../services/orgService";

const PersonView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);

  useEffect(() => {
    if (id) fetchPersonById(Number(id)).then(setPerson);
  }, [id]);

  if (!person) {
    return (
      <div style={{ padding: "50px" }}>
        <h2>Loading person details...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "50px" }}>
      <h1>{person.name}</h1>
      <h3>{person.title}</h3>
      <p><strong>ID:</strong> {person.id}</p>
      <p><strong>Reports:</strong> {person.reports?.length ?? 0}</p>

      <button
        onClick={() => navigate("/org-tree")}
        style={{
          marginTop: "20px",
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Back to Org Tree
      </button>
    </div>
  );
};

export default PersonView;
