import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../utils/apiRoute";
import { useNavigate, useParams } from "react-router-dom";
import { searchEmployees, type EmployeeData } from "../services/searchService";

type SearchMode = "employee" | "department";

const PLACEHOLDER_ID = 730467;

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
        // Department mode placeholder for now
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
      <div className="dashboard__loading">
        <h2>Loading employee details...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* ===== TOP SEARCH BAR ===== */}
      <div className="dashboard__search">
        {/* Row 1: two inputs + Search button */}
        <div className="dashboard__search-row">
          {mode === "employee" ? (
            <>
              <input
                className="dashboard__search-input"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <input
                className="dashboard__search-input"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </>
          ) : (
            <>
              <input
                className="dashboard__search-input"
                placeholder="Employee ID"
                value={searchEmployeeId}
                onChange={(e) => setSearchEmployeeId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <input
                className="dashboard__search-input"
                placeholder="Dept Name"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </>
          )}

          <button className="dashboard__search-button" onClick={handleSearch} disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Row 2: Filters dropdown + Clear */}
        <div className="dashboard__search-filters">
          <div className="dashboard__search-label">Filters:</div>

          <select
            className="dashboard__search-select"
            value={mode}
            onChange={(e) => onModeChange(e.target.value as SearchMode)}
          >
            <option value="employee">Employee Search</option>
            <option value="department">Department Search</option>
          </select>

          <button className="dashboard__search-clear" onClick={clearAll}>
            Clear
          </button>
        </div>

        {/* Results table (employee mode only) */}
        {searched && mode === "employee" && (
          <div className="dashboard__search-results">
            <div className="dashboard__search-results-count">Results: {employees.length}</div>

            {employees.length === 0 ? (
              <div className="dashboard__search-no-results">No matching employees.</div>
            ) : (
              <div className="dashboard__search-table-wrapper">
                <table className="dashboard__search-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department</th>
                      <th>ID</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.EmployeeID}>
                        <td>
                          {emp.FirstName} {emp.LastName}
                        </td>
                        <td>{emp.DepartmentName}</td>
                        <td>{emp.EmployeeID}</td>
                        <td>
                          <button
                            className="dashboard__search-view-button"
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
          <div className="dashboard__search-no-results">
            Department Search is not wired yet — UI only for now.
          </div>
        )}
      </div>

      {/* ===== DASHBOARD GRID (profile view) ===== */}
      <div className="dashboard__grid">
        {/* LEFT COLUMN */}
        <div className="dashboard__left-column">
          {/* BASIC INFO */}
          <section className="dashboard__section">
            <div className="dashboard__section-title">Basic Info</div>
            <hr className="dashboard__divider" />
            <div className="dashboard__card">
              <p>
                <strong>Age:</strong> {age !== undefined ? String(age) : ""}
              </p>
              <p>
                <strong>Department:</strong> {department}
              </p>
              <p>
                <strong>Address:</strong> {address}
              </p>
            </div>
          </section>

          {/* CONTACT INFO */}
          <section className="dashboard__section dashboard__section--flex">
            <div className="dashboard__section-title">Contact Info</div>
            <hr className="dashboard__divider" />
            <div className="dashboard__card dashboard__card--contact">
              <p>
                <strong>Phone Number:</strong> {phone}
              </p>
              <p>
                <strong>Email:</strong> {email}
              </p>
            </div>
          </section>

          {/* FUN/TBD BOX */}
          <div className="dashboard__fw-box">
            <div className="dashboard__fw-title">Fun</div>
            <div className="dashboard__fw-subtitle">TBD</div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="dashboard__right-column">
          {/* NAME BOX TOP RIGHT */}
          <div className="dashboard__name-wrapper">
            <div className="dashboard__name-box">{name}</div>
          </div>

          {/* PROFILE CIRCLE */}
          <div className="dashboard__profile-circle">
            {picture && <img src={picture} alt="Profile Picture" className="dashboard__profile-image" />}
          </div>

          {/* 3 SMALL CIRCLES */}
          <div className="dashboard__chips">
            <div className="dashboard__chip">Org</div>
            <div className="dashboard__chip">Email</div>
            <div className="dashboard__chip">Phone</div>
          </div>

          {/* REPORTING TO */}
          {managerID !== null && managerName && (
            <section className="dashboard__reporting">
              <div className="dashboard__reporting-title">Reporting To:</div>
              <hr className="dashboard__divider" />
              <div className="dashboard__reporting-list">
                <div>
                  <a onClick={() => navigate(`/person/${managerID}`)} className="dashboard__link">
                    {managerName}
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* DIRECT REPORTS */}
          {directReports && directReports.length > 0 && (
            <section className="dashboard__direct-reports">
              <div className="dashboard__reporting-title">Direct Reports:</div>
              <hr className="dashboard__divider" />
              <div className="dashboard__reporting-list">
                {directReports.map((dr) => (
                  <div key={dr.id}>
                    <a onClick={() => navigate(`/person/${dr.id}`)} className="dashboard__link">
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