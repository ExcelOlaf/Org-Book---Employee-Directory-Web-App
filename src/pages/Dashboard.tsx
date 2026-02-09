// src/pages/Dashboard.tsx
import * as React from "react";
import { searchEmployees, type EmployeeData } from "../services/searchService";

type SearchMode = "employee" | "department";

/** ===== Existing dashboard styles (from your original) ===== */
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
  backgroundColor: "#32343c",
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

/** ===== New Top Search Bar styles ===== */
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
  /** --- filter type (the dropdown you drew) --- */
  const [mode, setMode] = React.useState<SearchMode>("employee");

  /** --- employee search fields --- */
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  /** --- dept search fields (placeholder for now) --- */
  const [employeeId, setEmployeeId] = React.useState("");
  const [deptName, setDeptName] = React.useState("");

  /** --- results / UI state --- */
  const [employees, setEmployees] = React.useState<EmployeeData[]>([]);
  const [searched, setSearched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  /** --- selected employee (updates right-side name box) --- */
  const [selected, setSelected] = React.useState<EmployeeData | null>(null);

  const clearAll = () => {
    setFirstName("");
    setLastName("");
    setEmployeeId("");
    setDeptName("");
    setEmployees([]);
    setSearched(false);
    setSelected(null);
  };

  const onModeChange = (next: SearchMode) => {
    setMode(next);
    clearAll(); // makes it obvious fields change when switching
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(false);
    setSelected(null);

    if (mode === "employee") {
      const data = await searchEmployees({
        FirstName: firstName,
        LastName: lastName,
      }) as EmployeeData[];
      setEmployees(data);
    } else {
      // Department search placeholder (UI only for now)
      // You said: no dept search yet. So prove the mode switch works.
      setEmployees([]);
    }

    setSearched(true);
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      {/* ===== TOP SEARCH BAR (as you drew) ===== */}
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
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
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

          <button style={searchBtnStyle} onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Row 2: Filters dropdown (mode switch) + Clear */}
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
                            onClick={() => setSelected(emp)}
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

      {/* ===== YOUR EXISTING DASHBOARD GRID BELOW (unchanged) ===== */}
      <div style={gridStyle}>
        {/* LEFT COLUMN: BASIC INFO + CONTACT INFO + FW/TBD BOX */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* BASIC INFO */}
          <section style={{ marginBottom: "24px" }}>
            <div style={sectionTitleStyle}>Basic Info</div>
            <hr style={dividerStyle} />
            <div style={{ ...cardStyle, marginTop: "12px" }} />
          </section>

          {/* CONTACT INFO */}
          <section style={{ flex: 1 }}>
            <div style={sectionTitleStyle}>Contact Info</div>
            <hr style={dividerStyle} />
            <div style={{ ...contactAreaStyle, marginTop: "12px" }} />
          </section>

          {/* FUN / TBD BOX */}
          <div style={fwBoxStyle}>
            <div style={{ fontWeight: 600 }}>Fun</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>TBD</div>
          </div>
        </div>

        {/* RIGHT COLUMN: NAME + CIRCLE + ORG/EMAIL/PHONE + REPORTING TO */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* NAME BOX TOP RIGHT */}
          <div style={{ alignSelf: "flex-end" }}>
            <div style={rightNameBoxStyle}>
              {selected ? `${selected.FirstName} ${selected.LastName}` : "Name"}
            </div>
          </div>

          {/* PROFILE CIRCLE */}
          <div style={circleStyle} />

          {/* 3 SMALL CIRCLES */}
          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <div style={smallChipStyle}>Org</div>
            <div style={smallChipStyle}>Email</div>
            <div style={smallChipStyle}>Phone</div>
          </div>

          {/* REPORTING TO */}
          <section style={{ alignSelf: "stretch", marginTop: "24px" }}>
            <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "6px" }}>
              Reporting To:
            </div>
            <hr style={dividerStyle} />
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>Mgr Placeholder 1</div>
              <div>Mgr Placeholder 2</div>
              <div>Mgr Placeholder 3</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
