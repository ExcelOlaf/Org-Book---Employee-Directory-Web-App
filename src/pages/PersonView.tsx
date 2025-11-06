import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPersonById, fetchOrgData } from "../services/orgService";
import type { Person } from "../services/orgService";

const PersonView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [org, setOrg] = useState<Person[]>([]);

  useEffect(() => {
    if (id) fetchPersonById(Number(id)).then(setPerson);

    fetchOrgData().then((root) => {
      const list: Person[] = [];
      const walk = (p: Person) => {
        list.push(p);
        p.reports?.forEach(walk);
      };
      walk(root);
      setOrg(list);
    });
  }, [id]);

  if (!person) {
    return (
      <div style={{ padding: "50px" }}>
        <h2>Loading person details...</h2>
      </div>
    );
  }

  const manager = org.find((p) => p.id === person.managerId);
  const directReports = org.filter((p) => p.managerId === person.id);

  return (
    <div style={{ padding: "50px" }}>
      <h1>{person.name}</h1>
      <h3>{person.title}</h3>
      <p><strong>ID:</strong> {person.id}</p>
      <h3>Reports To:</h3>
      {manager ? (
        <p
          style={{ cursor: "pointer", color: "#0d6efd", textDecoration: "underline" }}
          onClick={() => navigate(`/person/${manager.id}`)}
        >
          {manager.name} - {manager.title}
        </p>
      ) : (
        <p>None</p>
      )}
      <h3>Direct Reports:</h3>
      {directReports.length > 0 ? (
        directReports.map((r) => (
          <p
            key={r.id}
            style={{ cursor: "pointer", color: "#0d6efd", textDecoration: "underline" }}
            onClick={() => navigate(`/person/${r.id}`)}
          >
            {r.name} - {r.title}
          </p>
        ))
      ) : (
        <p>No Direct Reports</p>
      )}
      <p><strong>Phone Number:</strong></p>
      <p><strong>Department:</strong></p>
      <p><strong>Location:</strong></p>
      <p><strong>Building:</strong></p>
      <p><strong>Desk:</strong></p>

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
