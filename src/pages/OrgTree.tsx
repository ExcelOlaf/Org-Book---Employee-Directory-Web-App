import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tree, TreeNode } from "react-organizational-chart";

import { fetchOrgData } from "../services/orgService";
import type { Person } from "../services/orgService";

// Utility: calculate brightness and return text color
function getTextColor(bgColor: string): string {
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}

// Reusable Org Node component
function OrgNode({
  person,
  onClick,
  backgroundColor = "#f0f8ff",
}: {
  person: Person;
  onClick: () => void;
  backgroundColor?: string;
}) {
  const textColor = getTextColor(backgroundColor);

  return (
    <div
      className="org-node"
      onClick={onClick}
      style={{
        backgroundColor,
        color: textColor,
        borderRadius: "12px",
      }}
    >
      <strong>{person.name}</strong>
      <br />
      <small>{person.title}</small>
    </div>
  );
}

export default function OrgTree() {
  const navigate = useNavigate();
  const [rootPerson, setRootPerson] = useState<Person | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Grab background from CSS variable
  const backgroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg-secondary")
    .trim();

  const textColor = getTextColor(backgroundColor);

  useEffect(() => {
    fetchOrgData().then((root) => setRootPerson(root));
  }, []);

  const renderTree = (person: Person) => (
    <TreeNode
      label={
        <OrgNode
          person={person}
          onClick={() => setSelectedPerson(person)}
          backgroundColor="#f0f8ff"
        />
      }
      key={person.id}
    >
      {person.reports?.map((report) => renderTree(report))}
    </TreeNode>
  );

  return (
    <div
      className="app"
      style={{
        backgroundColor,
        color: textColor, // ✅ applies globally
      }}
    >
      <h1 className="app-title">Company Org Tree</h1>

      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
        {/* LEFT: Org Chart */}
        <div className="card" style={{ flex: 2, minHeight: "500px" }}>
          {rootPerson ? (
            <Tree
              lineWidth={"2px"}
              lineColor={"#007bff"}
              lineBorderRadius={"4px"}
              label={
                <OrgNode
                  person={rootPerson}
                  onClick={() => setSelectedPerson(rootPerson)}
                  backgroundColor="#f0f8ff"
                />
              }
            >
              {rootPerson.reports?.map((report) => renderTree(report))}
            </Tree>
          ) : (
            <p>Loading tree…</p>
          )}
        </div>

        {/* RIGHT: Person Details */}
        <div className="card" style={{ flex: 1 }}>
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
    </div>
  );
}
