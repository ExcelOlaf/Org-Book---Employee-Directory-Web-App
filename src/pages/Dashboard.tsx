// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../utils/apiRoute";
import { useNavigate, useParams } from "react-router-dom";
import { searchEmployees, type EmployeeData } from "../services/searchService";

type SearchMode = "employee" | "department";

const PLACEHOLDER_ID = 730467;

/** ===== Shared dashboard styles ===== */
const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr", // left big, right skinny
  columnGap: "24px",
  alignItems: "flex-start",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  marginBottom: "8px",
};

const dividerStyle: React.CSSProperties = {
  border: 0,
  borderTop: "1px solid #4b5563",
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  borderRadius: "8px",
  border: "1px solid #4b5563",
  backgroundColor: "#020617",
  minHeight: "140px",
};

const contactAreaStyle: React.CSSProperties = {
  ...cardStyle,
  minHeight: "220px",
};

const fwBoxStyle: React.CSSProperties = {
  ...cardStyle,
  width: "180px",
  height: "140px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "auto",
  marginTop: "24px",
};

const rightNameBoxStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  borderRadius: "6px",
  border: "1px solid #4b5563",
  padding: "6px 12px",
  marginBottom: "12px",
};

const circleStyle: React.CSSProperties = {
  width: "160px",
  height: "160px",
  borderRadius: "50%",
  border: "1px solid #4b5563",
  backgroundColor: "#020617",
  overflow: "hidden",
};

const smallChipStyle: React.CSSProperties = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  border: "1px solid #4b5563",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
};

/** ===== Top Search Bar styles ===== */
const topSearchWrapStyle: React.CSSProperties = {
  ...cardStyle,
  minHeight: "unset",
  padding: "16px",
  marginBottom: "18px",
};

const inputStyle: React.CSSProperties = {
  height: "42px",
  borderRadius: "10px",
  border: "1px solid #4b5563",
  backgroundColor: "#0b1220",
  color: "white",
  padding: "0 12px",
  outline: "none",
  width: "100%",
};

const selectStyle: React.CSSProperties = {
  height: "42px",
  borderRadius: "10px",
  border: "1px solid #4b5563",
  backgroundColor: "#0b1220",
  color: "white",
  padding: "0 10px",
  outline: "none",
  width: "260px",
};

const searchBtnStyle: React.CSSProperties = {
  height: "42px",
  borderRadius: "10px",
  border: "1px solid #4b5563",
  backgroundColor: "#16a34a",
  color: "white",
  padding: "0 18px",
  cursor: "pointer",
  fontWeight: 700,
};

const clearBtnStyle: React.CSSProperties = {
  height: "42px",
  borderRadius: "10px",
  border: "1px solid #4b5563",
  backgroundColor: "#0b1220",
  color: "white",
  padding: "0 18px",
  cursor: "pointer",
  fontWeight: 600,
};

const tableTh: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid #4b5563",
  color: "#e2e8f0",
  fontSize: "13px",
};

const tableTd: React.CSSProperties = {
  padding: "10px 8px",
  borderBottom: "1px solid #1f2937",
  color: "white",
  fontSize: "13px",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // If no :id in URL, show placeholder employee.
  const employeeId = useMemo(() => (id ? Number(id) : PLACEHOLDER_ID), [id]);

  /** ===== Search UI state ===== */
  const [mode, setMode] = useState<SearchMode>("employee");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [searchEmployeeId, setSearchEmployeeId] = useState("");
  const [deptName, setDeptName] = useState("");

  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  /** ===== Profile (right/left panels) state ===== */
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [picture, setPicture] = useState<string | undefined>(undefined);

  const [managerID, setManagerID] = useState<number | null>(null);
  const [managerName, setManagerName] = useState("");
  const [directReports, setDirectReports] = useState<{ id: number; name: string }[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const clearAll = () => {
    setFirstName("");
    setLastName("");
    setSearchEmployeeId("");
    setDeptName("");
    setEmployees([]);
    setSearched(false);
  };

  const onModeChange = (next: SearchMode) => {
    setMode(next);
    clearAll();
  };

  const handleSearch = async () => {
    setSearching(true);
    setSearched(false);

    try {
      if (mode === "employee") {
        const data = (await searchEmployees({
          FirstName: firstName,
          LastName: lastName,
        })) as EmployeeData[];
        setEmployees(data);
      } else {
        // Department mode placeholder for now (keep UI behavior)
        // You can wire this later.
        setEmployees([]);
      }
    } finally {
      setSearched(true);
      setSearching(false);
    }
  };

  /** Fetch profile details for the currently-selected employeeId (from route or placeholder) */
  useEffect(() => {
    let cancelled = false;
    setLoadingProfile(true);

    async function getDirectReports(ids: number[]): Promise<{ id: number; name: string }[]> {
      const results = await Promise.all(
        ids.map(async (rid) => {
          const res = await fetch(`${API_BASE_URL}/employees/${rid}`);
          const directReport = await res.json();
          return { id: rid, name: `${directReport.FirstName} ${directReport.LastName}` };
        })
      );
      return results;
    }

    fetch(`${API_BASE_URL}/employees/${employeeId}`)
      .then((res) => res.json())
      .then(async (employee) => {
        if (cancelled) return;

        setName(`${employee.FirstName} ${employee.LastName}`);
        setAge(employee.Age !== undefined && employee.Age !== null ? Number(employee.Age) : undefined);
        setAddress(employee.Address ?? "");
        setDepartment(employee.DepartmentName ?? "");
        setPhone(employee.PhoneNumber ?? "");
        setEmail(employee.EmailAddress ?? "");
        setPicture(employee.Picture ?? undefined);

        // Manager
        if (employee.ManagerID) {
          const mgrRes = await fetch(`${API_BASE_URL}/employees/${employee.ManagerID}`);
          const mgr = await mgrRes.json();
          if (!cancelled) {
            setManagerID(Number(mgr.EmployeeID));
            setManagerName(`${mgr.FirstName} ${mgr.LastName}`);
          }
        } else {
          setManagerID(null);
          setManagerName("");
        }

        // Direct reports
        let ids: number[] = [];
        try {
          const raw = employee.DirectReportsList;
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) ids = parsed.map((x) => Number(x)).filter((x) => Number.isFinite(x));
          }
        } catch {
          // ignore parse issues
        }

        if (ids.length > 0) {
          const drs = await getDirectReports(ids);
          if (!cancelled) setDirectReports(drs);
        } else {
          setDirectReports([]);
        }

        if (!cancelled) setLoadingProfile(false);
      })
      .catch((error) => {
        console.error("Error fetching employee data:", error);
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  if (loadingProfile) {
    return (
      <div style={{ padding: "50px" }}>
        <h2>Loading employee details...</h2>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* ===== TOP SEARCH BAR ===== */}
      <div style={topSearchWrapStyle}>
        {/* Row 1: two inputs + Search button */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: "12px",
            alignItems: "center",
          }}
        >
          {mode === "employee" ? (
            <>
              <input
                style={inputStyle}
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <input
                style={inputStyle}
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </>
          ) : (
            <>
              <input
                style={inputStyle}
                placeholder="Employee ID"
                value={searchEmployeeId}
                onChange={(e) => setSearchEmployeeId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <input
                style={inputStyle}
                placeholder="Dept Name"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </>
          )}

          <button style={searchBtnStyle} onClick={handleSearch} disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Row 2: Filters dropdown + Clear */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "10px" }}>
          <div style={{ color: "#cbd5e1", fontSize: "12px", width: "60px" }}>Filters:</div>

          <select style={selectStyle} value={mode} onChange={(e) => onModeChange(e.target.value as SearchMode)}>
            <option value="employee">Employee Search</option>
            <option value="department">Department Search</option>
          </select>

          <button style={clearBtnStyle} onClick={clearAll}>
            Clear
          </button>
        </div>

        {/* Results table (employee mode only) */}
        {searched && mode === "employee" && (
          <div style={{ marginTop: "14px" }}>
            <div style={{ color: "#cbd5e1", fontSize: "12px", marginBottom: "8px" }}>
              Results: {employees.length}
            </div>

            {employees.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: "13px" }}>No matching employees.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={tableTh}>Name</th>
                      <th style={tableTh}>Department</th>
                      <th style={tableTh}>ID</th>
                      <th style={tableTh}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.EmployeeID}>
                        <td style={tableTd}>
                          {emp.FirstName} {emp.LastName}
                        </td>
                        <td style={tableTd}>{emp.DepartmentName}</td>
                        <td style={tableTd}>{emp.EmployeeID}</td>
                        <td style={tableTd}>
                          <button
                            style={{
                              borderRadius: "10px",
                              border: "1px solid #4b5563",
                              backgroundColor: "#0b1220",
                              color: "white",
                              padding: "8px 12px",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            onClick={() => navigate(`/person/${emp.EmployeeID}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Placeholder message for dept mode */}
        {searched && mode === "department" && (
          <div style={{ marginTop: "14px", color: "#94a3b8", fontSize: "13px" }}>
            Department Search is not wired yet — UI only for now.
          </div>
        )}
      </div>

      {/* ===== DASHBOARD GRID (profile view) ===== */}
      <div style={gridStyle}>
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* BASIC INFO */}
          <section style={{ marginBottom: "24px" }}>
            <div style={sectionTitleStyle}>Basic Info</div>
            <hr style={dividerStyle} />
            <div style={{ ...cardStyle, marginTop: "12px", padding: "12px" }}>
              <p>Age: {age !== undefined ? String(age) : ""}</p>
              <p>Department: {department}</p>
              <p>Address: {address}</p>
            </div>
          </section>

          {/* CONTACT INFO */}
          <section style={{ flex: 1 }}>
            <div style={sectionTitleStyle}>Contact Info</div>
            <hr style={dividerStyle} />
            <div style={{ ...contactAreaStyle, marginTop: "12px", padding: "12px" }}>
              <p>Phone Number: {phone}</p>
              <p>Email: {email}</p>
            </div>
          </section>

          {/* FUN/TBD BOX */}
          <div style={fwBoxStyle}>
            <div style={{ fontWeight: 600 }}>Fun</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>TBD</div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* NAME BOX TOP RIGHT */}
          <div style={{ alignSelf: "flex-end" }}>
            <div style={rightNameBoxStyle}>{name}</div>
          </div>

          {/* PROFILE CIRCLE */}
          <div style={circleStyle}>
            {picture ? (
              <img
                src={picture}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                alt="photo"
              />
            ) : null}
          </div>

          {/* 3 SMALL CIRCLES */}
          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <div style={smallChipStyle}>Org</div>
            <div style={smallChipStyle}>Email</div>
            <div style={smallChipStyle}>Phone</div>
          </div>

          {/* REPORTING TO */}
          {managerID !== null && (
            <section style={{ alignSelf: "stretch", marginTop: "24px" }}>
              <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "6px" }}>Reporting To:</div>
              <hr style={dividerStyle} />
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <a
                    onClick={() => navigate(`/person/${managerID}`)}
                    style={{ cursor: "pointer", color: "#0d6efd", textDecoration: "underline" }}
                  >
                    {managerName}
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* DIRECT REPORTS */}
          {directReports.length > 0 && (
            <section style={{ alignSelf: "stretch", marginTop: "24px" }}>
              <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "6px" }}>Direct Reports:</div>
              <hr style={dividerStyle} />
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {directReports.map((dr) => (
                  <div key={dr.id}>
                    <a
                      onClick={() => navigate(`/person/${dr.id}`)}
                      style={{ cursor: "pointer", color: "#0d6efd", textDecoration: "underline" }}
                    >
                      {dr.name}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
