import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../utils/apiRoute";
import { useNavigate, useParams } from "react-router-dom";

const PLACEHOLDER_ID = 730467;

export default function Dashboard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // If no :id in URL, show placeholder employee.
  const employeeId = useMemo(() => (id ? Number(id) : PLACEHOLDER_ID), [id]);

  /** ===== Minimal search inputs (just to route to EmployeeSearch) ===== */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const goToEmployeeSearch = () => {
    // Navigate to employee search page and pass initial query
    navigate("/employees", {
      state: { FirstName: firstName.trim(), LastName: lastName.trim() },
    });
  };

  /** ===== Profile state ===== */
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [picture, setPicture] = useState<string | undefined>(undefined);

  const [managerID, setManagerID] = useState<number | null>(null);
  const [managerName, setManagerName] = useState("");
  const [directReports, setDirectReports] = useState<{ id: number; name: string }[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  /** Fetch profile details for the currently-selected employeeId */
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
        setTitle(employee.Title ?? "");
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
      {/* ===== TOP SEARCH BAR (SIMPLE) ===== */}
      <div className="dashboard__search">
        <div className="dashboard__search-row">
          <input
            className="dashboard__search-input"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goToEmployeeSearch()}
          />
          <input
            className="dashboard__search-input"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goToEmployeeSearch()}
          />
          <button className="dashboard__search-button" onClick={goToEmployeeSearch}>
            Search
          </button>
        </div>
      </div>

      {/* ===== DASHBOARD GRID (profile view) ===== */}
      <div className="dashboard__grid">
        {/* LEFT COLUMN */}
        <div className="dashboard__left-column">
          <section className="dashboard__section">
            <div className="dashboard__section-title">Basic Info</div>
            <hr className="dashboard__divider" />
            <div className="dashboard__card">
              <p>
                <strong>Age:</strong> {age !== undefined ? String(age) : ""}
              </p>
              <p>
                <strong>Department:</strong> <a className="dashboard__link" onClick={() => navigate(`/departments/${department}`)}>{department}</a>
              </p>
              <p>
                <strong>Address:</strong> {address}
              </p>
            </div>
          </section>

          <section className="dashboard__section dashboard__section--flex">
            <div className="dashboard__section-title">Contact Info</div>
            <hr className="dashboard__divider" />
            <div className="dashboard__card dashboard__card--contact">
              <p>
                <strong>Phone Number:</strong> {phone}
              </p>
              <p>
                <strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a>
              </p>
            </div>
          </section>

          <div className="dashboard__fw-box">
            <div className="dashboard__fw-title">Fun</div>
            <div className="dashboard__fw-subtitle">TBD</div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="dashboard__right-column">
          <div className="dashboard__name-wrapper">
            <div className="dashboard__name-box">
              <div><strong>{name}</strong></div>
              <div>{title}</div>
            </div>
          </div>

          <div className="dashboard__profile-circle">
            {picture && <img src={picture} alt="Profile Picture" className="dashboard__profile-image" />}
          </div>

          <div className="dashboard__chips">
            <div className="dashboard__chip" onClick={() => navigate(`/org-tree/${employeeId}`)}>Org</div>
            <div className="dashboard__chip" onClick={() => window.location.href = `mailto:${email}`}>Email</div>
            <div className="dashboard__chip">Phone</div>
          </div>

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