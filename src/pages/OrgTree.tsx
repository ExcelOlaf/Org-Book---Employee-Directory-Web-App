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
      }}
    >
      <strong>{person.name}</strong>
      <small>{person.title}</small>
    </div>
  );
}

export default function OrgTree() {
  const navigate = useNavigate();
  const [rootPerson, setRootPerson] = useState<Person | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

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
    <div className="org-tree">
      <h1 className="org-tree__title">Company Org Tree</h1>

      <div className="org-tree__container">
        {/* LEFT: Org Chart */}
        <div className="org-tree__chart-section">
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
            <p className="org-tree__loading">Loading tree…</p>
          )}
        </div>

        {/* RIGHT: Person Details */}
        <div className="org-tree__details-section">
          <h3 className="org-tree__details-title">Person Details</h3>
          {selectedPerson ? (
            <>
              <div className="org-tree__details-item">
                <span className="org-tree__details-label">Name:</span>{" "}
                <span className="org-tree__details-value">{selectedPerson.name}</span>
              </div>
              <div className="org-tree__details-item">
                <span className="org-tree__details-label">Title:</span>{" "}
                <span className="org-tree__details-value">{selectedPerson.title}</span>
              </div>
              <button
                className="org-tree__button"
                onClick={() => navigate(`/person/${selectedPerson.id}`)}
              >
                View Full Profile
              </button>
            </>
          ) : (
            <p className="org-tree__details-item">Select a person to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}