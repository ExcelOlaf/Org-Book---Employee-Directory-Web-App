import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../utils/apiRoute";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import { useNavigate, useParams } from "react-router-dom";
import EmployeePreviewTrigger from "../components/EmployeePreviewTrigger";

const PLACEHOLDER_ID = 730467;

export default function Dashboard() {

  type Suggestion = {
    EmployeeID: number;
    FirstName: string;
    LastName: string;
    Title?: string;
  };

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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
const officeMessages = [
  "IT maintenance scheduled tonight at 8 PM.",
  "Welcome our new hires joining this week 🎉",
  "Reminder: Team lunch tomorrow at 12 PM.",
  "Office will be closed this Friday.",
  "Security update: Please reset your password this week.",
  "New org chart updates are now available.",
  "HR office hours available Thursday afternoon.",
];
const messageOfTheDay = useMemo(() => {
  const stored = sessionStorage.getItem("office-message");
  if (stored) return stored;

  const random =
    officeMessages[Math.floor(Math.random() * officeMessages.length)];

  sessionStorage.setItem("office-message", random);
  return random;
}, []);

  /** Fetch profile details for the currently-selected employeeId */
  useEffect(() => {
    let cancelled = false;
    setLoadingProfile(true);

    async function getDirectReports(ids: number[]): Promise<{ id: number; name: string }[]> {
      const results = await Promise.all(
        ids.map(async (rid) => {
          const res = await authenticatedFetch(`${API_BASE_URL}/employees/${rid}`);
          if (!res.ok) {
            throw new Error(`Failed to load direct report ${rid} (status ${res.status})`);
          }
          const directReport = await res.json();
          return { id: rid, name: `${directReport.FirstName} ${directReport.LastName}` };
        })
      );
      return results;
    }

    authenticatedFetch(`${API_BASE_URL}/employees/${employeeId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load employee ${employeeId} (status ${res.status})`);
        }
        return res.json();
      })
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
          const mgrRes = await authenticatedFetch(`${API_BASE_URL}/employees/${employee.ManagerID}`);
          if (!mgrRes.ok) {
            throw new Error(`Failed to load manager ${employee.ManagerID} (status ${mgrRes.status})`);
          }
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

  useEffect(() => {
    const fn = firstName.trim();
    const ln = lastName.trim();

    if (!fn && !ln) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const params = new URLSearchParams();
        if (fn) params.append("FirstName", fn);
        if (ln) params.append("LastName", ln);
        params.set("limit", "8");

        const res = await authenticatedFetch(
          `${API_BASE_URL}/employees?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error(`Search Failed (${res.status})`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : data.results ?? []);
        setShowSuggestions(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error(err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [firstName, lastName]);

  return (
    <div className="dashboard">
      {/* ===== TOP SEARCH BAR (SIMPLE) ===== */}
      <div className="dashboard__search">
        <div className="dashboard__search-row" style={{ position: "relative" }}>
          <input
            className="dashboard__search-input"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onFocus={() => suggestions.length && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => e.key === "Enter" && goToEmployeeSearch()}
          />
          <input
            className="dashboard__search-input"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onFocus={() => suggestions.length && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => e.key === "Enter" && goToEmployeeSearch()}
          />
          <button className="dashboard__search-button" onClick={goToEmployeeSearch}>
            Search
          </button>

          {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
            <ul className="dashboard__suggestions">
              {loadingSuggestions && <li className="dashboard__suggestion--muted">Searching...</li>}
              {suggestions.map((s) => (
                <li 
                  key={s.EmployeeID} 
                  className="dashboard__suggestion"
                  onMouseDown={() => {
                    setShowSuggestions(false);
                    navigate(`/person/${s.EmployeeID}`);
                  }}
                >
                  <strong>{s.FirstName} {s.LastName}</strong>
                  {s.Title && <span className="dashboard__suggestion-title"> — {s.Title}</span>}
                </li>
              ))}
            </ul>
          )}
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
            <div className="dashboard__fw-title">Message Of the Day</div>
            <div className="dashboard__fw-subtitle">{messageOfTheDay}</div>
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
                  <EmployeePreviewTrigger
                    employeeId={managerID}
                    onNavigate={() => navigate(`/person/${managerID}`)}
                    className="dashboard__link"
                    ariaLabel={`View profile for ${managerName}`}
                  >
                    {managerName}
                  </EmployeePreviewTrigger>
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
                    <EmployeePreviewTrigger
                      employeeId={dr.id}
                      onNavigate={() => navigate(`/person/${dr.id}`)}
                      className="dashboard__link"
                      ariaLabel={`View profile for ${dr.name}`}
                    >
                      {dr.name}
                    </EmployeePreviewTrigger>
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