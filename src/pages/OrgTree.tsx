import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/** Person type */
interface Person {
  id: number;
  name: string;
  title: string;
  reports?: Person[];
}

/** Example data */
const orgData: Person = {
  id: 1,
  name: "Alice Johnson",
  title: "CEO",
  reports: [
    {
      id: 2,
      name: "Bob Smith",
      title: "VP of Engineering",
      reports: [
        { id: 4, name: "Carol Lee", title: "Engineering Manager", reports: [] },
        { id: 5, name: "David Kim", title: "QA Lead", reports: [] },
      ],
    },
    {
      id: 3,
      name: "Eve Martin",
      title: "VP of Marketing",
      reports: [{ id: 6, name: "Frank Wright", title: "Marketing Manager", reports: [] }],
    },
  ],
};

type TreeNodeProps = {
  person: Person;
  onSelect: (person: Person) => void;
};

/** Recursive Tree Node */
const TreeNode: React.FC<TreeNodeProps> = ({ person, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginLeft: "20px", marginTop: "10px" }}>
      <button
        onClick={() => onSelect(person)}
        style={{
          background: "#f5f5f5",
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "8px 12px",
          width: "200px",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <strong>{person.name}</strong>
        <br />
        <span style={{ fontSize: "0.9em", color: "#666" }}>{person.title}</span>
      </button>

      {person.reports && person.reports.length > 0 && (
        <div style={{ marginTop: "5px" }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              marginTop: "5px",
            }}
          >
            {expanded ? "▼ Hide Reports" : "▶ Show Reports"}
          </button>

          {expanded && (
            <div style={{ marginLeft: "20px" }}>
              {person.reports.map((report) => (
                <TreeNode key={report.id} person={report} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** Main OrgTree Component */
const OrgTree: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const handleSelect = (person: Person) => {
    setSelectedPerson(person);
  };

  return (
    <div style={{ padding: "50px" }}>
      <h1>Company Org Tree</h1>

      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <TreeNode person={orgData} onSelect={handleSelect} />
        </div>

        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            background: "#fafafa",
          }}
        >
          <h3>Person Details</h3>
          {selectedPerson ? (
            <>
              <p>
                <strong>Name:</strong> {selectedPerson.name}
              </p>
              <p>
                <strong>Title:</strong> {selectedPerson.title}
              </p>
              <button
                onClick={() => navigate(`/person/${selectedPerson.id}`)}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                View Full Profile
              </button>
            </>
          ) : (
            <p>Select a person to view details.</p>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "40px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default OrgTree;
