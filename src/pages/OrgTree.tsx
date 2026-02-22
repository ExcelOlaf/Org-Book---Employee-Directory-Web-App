import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tree, TreeNode } from "react-organizational-chart";
import { 
  fetchOrgData, 
  fetchOrgDataFromEmployee, 
  getTotalReportsCount,
  clearOrgTreeCache 
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
  isRoot = false,
}: {
  person: Person;
  onClick: () => void;
  backgroundColor?: string;
  isRoot?: boolean;
}) {
  const textColor = getTextColor(backgroundColor);
  const totalReports = getTotalReportsCount(person);
  
  return (
    <div
      className="org-node"
      onClick={onClick}
      style={{
        backgroundColor,
        color: textColor,
        cursor: "pointer",
      }}
    >
      <strong>{person.name}</strong>
      <small>{person.title}</small>
      {isRoot && <div style={{ fontSize: "0.7em", marginTop: "4px" }}></div>}
      {totalReports > 0 && (
        <div style={{ fontSize: "0.7em", marginTop: "4px", opacity: 0.8 }}>
          {totalReports} report{totalReports !== 1 ? "s" : ""}
        </div>
      )}
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
      const root = await fetchOrgData(false);
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

  const toggleNodeExpansion = (personId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(personId)) {
        newSet.delete(personId);
      } else {
        newSet.add(personId);
      }
      return newSet;
    });
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
    const hasReports = person.reports && person.reports.length > 0;
    const hasManyReports = person.reports && person.reports.length > MAX_VISIBLE_REPORTS;
    const isExpanded = expandedNodes.has(person.id);
    const visibleReports = (isExpanded || !hasManyReports) 
      ? person.reports 
      : person.reports?.slice(0, MAX_VISIBLE_REPORTS);
    
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
        {hasManyReports && !isExpanded && (
          <TreeNode
            label={
              <div
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9em",
                  color: "#495057"
                }}
                onClick={() => toggleNodeExpansion(person.id)}
              >
                + Show {person.reports!.length - MAX_VISIBLE_REPORTS} more...
              </div>
            }
          />
        )}
      </TreeNode>
    );
  };

  return (
    <div className="org-tree">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="org-tree__title">Company Org Tree</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      
      {error && (
        <div style={{ 
          padding: "12px", 
          backgroundColor: "#fee", 
          color: "#c00", 
          borderRadius: "4px",
          margin: "12px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>{error}</span>
          <button 
            onClick={() => loadOrgTree(false)}
            style={{ 
              padding: "6px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
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
                <span className="org-tree__details-label">Department:</span>{" "}
                <span className="org-tree__details-value">{selectedPerson.title}</span>
              </div>
              {selectedPerson.reports && selectedPerson.reports.length > 0 && (
                <div className="org-tree__details-item">
                  <span className="org-tree__details-label">Direct Reports:</span>{" "}
                  <span className="org-tree__details-value">{selectedPerson.reports.length}</span>
                </div>
              )}
              {getTotalReportsCount(selectedPerson) > 0 && (
                <div className="org-tree__details-item">
                  <span className="org-tree__details-label">Total Reports:</span>{" "}
                  <span className="org-tree__details-value">{getTotalReportsCount(selectedPerson)}</span>
                </div>
              )}
              <button
                className="org-tree__button"
                onClick={() => navigate(`/person/${selectedPerson.id}`)}
              >
                View Full Profile
              </button>
              
              {/* Optional: Re-root tree button */}
              {selectedPerson.id !== rootPerson?.id && (
                <button
                  className="org-tree__button"
                  style={{ marginTop: "8px", backgroundColor: "#6c757d" }}
                  onClick={() => handleReRootTree(selectedPerson.id)}
                >
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