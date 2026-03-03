import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDepartments } from "../services/orgService";

export default function DepartmentLookup() {
  console.log("DepartmentLookup UPDATED - running fetchDepartments()");
  const [departments, setDepartments] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments()
      .then((data) => {
        setDepartments(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError("Could not load departments.");
        setLoading(false);
      });
  }, []);

  const filteredDepartments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((name) => name.toLowerCase().includes(q));
  }, [departments, query]);

  function goToDepartmentFromSearch() {
    const q = query.trim();
    if (!q) {
      setError("Please enter a department name.");
      return;
    }

    // Try to match an existing department (case-insensitive)
    const match = departments.find(
      (name) => name.toLowerCase() === q.toLowerCase()
    );

    if (!match) {
      setError("No matching department found.");
      return;
    }

    setError(null);
    navigate(`/departments/${encodeURIComponent(match)}`);
  }

  return (
    <div className="dept-lookup">
      <div className="dept-lookup__container">
        <h1 className="dept-lookup__title">Department Lookup</h1>

        {/* Search bar */}
        <div className="dept-lookup__search">
          <input
            className="dept-lookup__search-input"
            type="text"
            value={query}
            placeholder="Search departments (e.g., Engineering)"
            onChange={(e) => {
              setQuery(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") goToDepartmentFromSearch();
            }}
          />
          <button
            className="dept-lookup__search-btn"
            type="button"
            onClick={goToDepartmentFromSearch}
            disabled={query.trim().length === 0}
          >
            Search
          </button>
        </div>

        {error && <div className="dept-lookup__error">{error}</div>}

        {/* Results */}
        {loading ? (
          <div className="dept-lookup__empty">Loading departments...</div>
        ) : (
          <div className="dept-lookup__grid">
            {filteredDepartments.map((name) => (
              <DeptTile
                key={name}
                label={name}
                onClick={() => navigate(`/departments/${encodeURIComponent(name)}`)}
              />
            ))}

            {filteredDepartments.length === 0 && (
              <div className="dept-lookup__empty">
                No departments match "{query.trim()}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DeptTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="dept-lookup__card" onClick={onClick}>
      {label}
    </div>
  );
}