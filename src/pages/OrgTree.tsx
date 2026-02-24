import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tree, TreeNode } from "react-organizational-chart";
import {
  fetchOrgData,
  fetchOrgDataFromEmployee,
  clearOrgTreeCache,
} from "../services/orgService";
import type { Person } from "../services/orgService";

const MAX_VISIBLE_REPORTS = 10;

function getTextColor(bgColor: string): string {
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}

function OrgNode({
  person,
  onClick,
  backgroundColor = "#f0f8ff",
}: {
  person: Person;
  onClick: () => void;
  backgroundColor?: string;
  isRoot?: boolean;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadOrgTree();
  }, []);

  const loadOrgTree = async (useCache: boolean = true) => {
    setLoading(true);
    setError(null);
    try {
      const root = await fetchOrgData(useCache);
      if (root) {
        setRootPerson(root);
        setSelectedPerson(root);
      } else {
        setError("Unable to load organization tree. Please try again later.");
      }
    } catch (err) {
      console.error("Error loading org tree:", err);
      setError("An error occurred while loading the organization tree.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    clearOrgTreeCache();
    loadOrgTree(false);
  };

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleReRootTree = async (employeeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const newRoot = await fetchOrgDataFromEmployee(employeeId);
      if (newRoot) {
        setRootPerson(newRoot);
        setSelectedPerson(newRoot);
        setExpandedNodes(new Set());
      } else {
        setError(`Unable to load tree for employee ${employeeId}`);
      }
    } catch (err) {
      console.error("Error re-rooting tree:", err);
      setError("An error occurred while loading the tree.");
    } finally {
      setLoading(false);
    }
  };

  const renderTree = (person: Person, depth: number = 0) => {
    const hasManyReports = person.reports && person.reports.length > MAX_VISIBLE_REPORTS;
    const isExpanded = expandedNodes.has(person.id);
    const visibleReports =
      isExpanded || !hasManyReports ? person.reports : person.reports?.slice(0, MAX_VISIBLE_REPORTS);

    return (
      <TreeNode
        label={
          <OrgNode
            person={person}
            onClick={() => handlePersonClick(person)}
            backgroundColor={depth === 0 ? "#d4e8ff" : "#f0f8ff"}
            isRoot={depth === 0}
          />
        }
        key={person.id}
      >
        {visibleReports?.map((report) => renderTree(report, depth + 1))}
      </TreeNode>
    );
  };

  return (
    <div className="org-tree">
      <div className="org-tree__header">
        <h1 className="org-tree__title">Company Org Tree</h1>
          <button onClick={handleRefresh} className="org-tree__button">Refresh</button>
      </div>

      {error && (
        <div className="org-tree__error">
          <span>{error}</span>
          <button onClick={handleRefresh} className="org-tree__error-retry">
            Retry
          </button>
        </div>
      )}

      <div className="org-tree__container">
        {/* LEFT: Org Chart */}
        <div className="org-tree__chart-section">
          {loading ? (
            <p className="org-tree__loading">Loading tree…</p>
          ) : rootPerson ? (
            <>
              <Tree
                lineWidth={"2px"}
                lineColor={"#007bff"}
                lineBorderRadius={"4px"}
                label={
                  <OrgNode
                    person={rootPerson}
                    onClick={() => handlePersonClick(rootPerson)}
                    backgroundColor="#d4e8ff"
                    isRoot={true}
                  />
                }
              >
                {rootPerson.reports?.map((report) => renderTree(report, 1))}
              </Tree>
            </>
          ) : (
            <p className="org-tree__loading">No data available</p>
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
                <span className="org-tree__details-label">Job Title:</span>{" "}
                <span className="org-tree__details-value">{selectedPerson.title}</span>
              </div>
              <button className="org-tree__button" onClick={() => navigate(`/person/${selectedPerson.id}`)}>
                View Full Profile
              </button>

              {/* Optional: Re-root tree button */}
              {selectedPerson.id !== rootPerson?.id && (
                <button className="org-tree__button org-tree__button--secondary" onClick={() => handleReRootTree(selectedPerson.id)}>
                  View Their Tree
                </button>
              )}
            </>
          ) : (
            <p className="org-tree__details-item">Select a person to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}