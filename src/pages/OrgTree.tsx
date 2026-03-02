import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tree, TreeNode } from "react-organizational-chart";
import {
  fetchOrgDataFromEmployee,
  fetchPersonById,
  clearOrgTreeCache,
} from "../services/orgService";
import type { Person } from "../services/orgService";

const LOGGED_IN_EMPLOYEE_ID = 730467;

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
  isHighlighted = false,
}: {
  person: Person;
  onClick: () => void;
  backgroundColor?: string;
  isHighlighted?: boolean;
}) {
  const textColor = getTextColor(backgroundColor);

  return (
    <div
      className={`org-node${isHighlighted ? " org-node--highlighted" : ""}`}
      onClick={onClick}
      style={{ backgroundColor, color: textColor }}
    >
      <strong>{person.name}</strong>
      <small>{person.title}</small>
    </div>
  );
}

interface OrgTreeData {
  manager: Person | null;
  siblings: Person[];
  viewedPersonId: number;
}

export default function OrgTree() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const viewedPersonId = useMemo(
    () => (id ? Number(id) : LOGGED_IN_EMPLOYEE_ID),
    [id]
  );

  const [treeData, setTreeData] = useState<OrgTreeData | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate(`/org-tree/${LOGGED_IN_EMPLOYEE_ID}`, { replace: true });
    }
  }, [id, navigate]);

  useEffect(() => {
    if (viewedPersonId) {
      loadOrgTree(viewedPersonId);
    }
  }, [viewedPersonId]);

  const loadOrgTree = async (personId: number, useCache: boolean = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await buildManagerCenteredTree(personId, useCache);
      if (data) {
        setTreeData(data);
        const viewed = data.siblings.find((s) => s.id === personId) ?? null;
        setSelectedPerson(viewed);
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

  const buildManagerCenteredTree = async (
    personId: number,
    useCache: boolean = true
  ): Promise<OrgTreeData | null> => {
    const viewedPerson = await fetchPersonById(personId);
    if (!viewedPerson) return null;

    if (!viewedPerson.managerId) {
      const rootWithReports = await fetchOrgDataFromEmployee(personId, useCache);
      if (!rootWithReports) return null;
      return {
        manager: null,
        siblings: [rootWithReports],
        viewedPersonId: personId,
      };
    }

    const managerTree = await fetchOrgDataFromEmployee(viewedPerson.managerId, useCache);
    if (!managerTree) return null;

    return {
      manager: managerTree,
      siblings: managerTree.reports ?? [],
      viewedPersonId: personId,
    };
  };

  const handleRefresh = () => {
    clearOrgTreeCache();
    loadOrgTree(viewedPersonId, false);
  };

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
  };

  const renderReportNode = (report: Person): React.ReactElement => (
    <TreeNode
      key={report.id}
      label={
        <OrgNode
          person={report}
          onClick={() => handlePersonClick(report)}
          backgroundColor="#f0f8ff"
        />
      }
    >
      {report.reports?.map((subReport) => renderReportNode(subReport))}
    </TreeNode>
  );

  const renderSiblingWithReports = (sibling: Person) => {
    const isHighlighted = sibling.id === treeData?.viewedPersonId;

    return (
      <TreeNode
        key={sibling.id}
        label={
          <OrgNode
            person={sibling}
            onClick={() => handlePersonClick(sibling)}
            backgroundColor={isHighlighted ? "#fef3c7" : "#f0f8ff"}
            isHighlighted={isHighlighted}
          />
        }
      >
        {sibling.reports?.map((report) => renderReportNode(report))}
      </TreeNode>
    );
  };

  return (
    <div className="org-tree">
      <div className="org-tree__header">
        <h1 className="org-tree__title">Company Org Tree</h1>
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
        <div className="org-tree__chart-section">
          {loading ? (
            <p className="org-tree__loading">Loading tree…</p>
          ) : treeData ? (
            treeData.manager ? (
              <Tree
                lineWidth={"2px"}
                lineColor={"#007bff"}
                lineBorderRadius={"4px"}
                label={
                  <OrgNode
                    person={treeData.manager}
                    onClick={() => handlePersonClick(treeData.manager!)}
                    backgroundColor="#d4e8ff"
                  />
                }
              >
                {treeData.siblings.map((sibling) => renderSiblingWithReports(sibling))}
              </Tree>
            ) : (
              <Tree
                lineWidth={"2px"}
                lineColor={"#007bff"}
                lineBorderRadius={"4px"}
                label={
                  <OrgNode
                    person={treeData.siblings[0]}
                    onClick={() => handlePersonClick(treeData.siblings[0])}
                    backgroundColor="#fef3c7"
                    isHighlighted={true}
                  />
                }
              >
                {treeData.siblings[0].reports?.map((report) => renderReportNode(report))}
              </Tree>
            )
          ) : (
            <p className="org-tree__loading">No data available</p>
          )}
        </div>

        <div className="org-tree__details-section">
          <h3 className="org-tree__details-title">Person Details</h3>
          {selectedPerson ? (
            <>
              <div className="org-tree__details-item">
                <span className="org-tree__details-label">Name:</span>
                <span className="org-tree__details-value">{selectedPerson.name}</span>
              </div>
              <div className="org-tree__details-item">
                <span className="org-tree__details-label">Job Title:</span>
                <span className="org-tree__details-value">{selectedPerson.title}</span>
              </div>
              <button
                className="org-tree__button"
                onClick={() => navigate(`/person/${selectedPerson.id}`)}
              >
                View Full Profile
              </button>
              {selectedPerson.id !== viewedPersonId && (
                <button
                  className="org-tree__button org-tree__button--secondary"
                  style={{ marginTop: "8px" }}
                  onClick={() => navigate(`/org-tree/${selectedPerson.id}`)}
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