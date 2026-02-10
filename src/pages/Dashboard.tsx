import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/apiRoute";
import { useNavigate, useParams } from "react-router-dom";

const PLACEHOLDER_ID = 730467;

export default function Dashboard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const employeeId = id ? Number(id) : PLACEHOLDER_ID;

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState<Number>();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [picture, setPicture] = useState(undefined);
  const [managerID, setManagerID] = useState("");
  const [managerName, setManagerName] = useState("");
  const [directReports, setDirectReports] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    async function getDirectReports(ids: number[]): Promise<{ id: number; name: string }[]> {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`${API_BASE_URL}/employees/${id}`);
          const directReport = await res.json();
          return { id, name: `${directReport.FirstName} ${directReport.LastName}` };
        })
      );
      return results;
    }

    fetch(`${API_BASE_URL}/employees/${employeeId}`)
      .then((res) => res.json())
      .then((employee) => {
        setName(`${employee.FirstName} ${employee.LastName}`);
        setAge(Number(employee.Age));
        setAddress(employee.Address);
        setDepartment(employee.DepartmentName);
        setPhone(employee.PhoneNumber);
        setEmail(employee.EmailAddress);
        setPicture(employee.Picture);

        if (employee.ManagerID) {
          fetch(`${API_BASE_URL}/employees/${employee.ManagerID}`)
            .then(res => res.json())
            .then((manager) => {
              setManagerID(manager.EmployeeID);
              setManagerName(`${manager.FirstName} ${manager.LastName}`);
            });
        }

        const directReportIDs = JSON.parse(employee.DirectReportsList);
        if (directReportIDs) {
          getDirectReports(directReportIDs).then(res => setDirectReports(res));
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching employee data:", error);
        setLoading(false);
      });
  }, [employeeId]);

  if (loading || !id) {
    return (
      <div className="dashboard__loading">
        <h2>Loading employee details...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__grid">
        <div className="dashboard__left-column">
          <section className="dashboard__section">
            <div className="dashboard__section-title">Basic Info</div>
            <hr className="dashboard__divider" />
            <div className="dashboard__card">
              <p>
                <strong>Age:</strong> {String(age)}
              </p>
              <p>
                <strong>Department:</strong> {department}
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
                <strong>Email:</strong> {email}
              </p>
            </div>
          </section>

          <div className="dashboard__fw-box">
            <div className="dashboard__fw-title">Fun</div>
            <div className="dashboard__fw-subtitle">TBD</div>
          </div>
        </div>

        <div className="dashboard__right-column">
          <div className="dashboard__name-wrapper">
            <div className="dashboard__name-box">{name}</div>
          </div>

          <div className="dashboard__profile-circle">
            {picture && (
              <img
                src={picture}
                alt="Profile Picture"
                className="dashboard__profile-image"
              />
            )}
          </div>

          <div className="dashboard__chips">
            <div className="dashboard__chip">Org</div>
            <div className="dashboard__chip">Email</div>
            <div className="dashboard__chip">Phone</div>
          </div>

          <section className="dashboard__reporting">
            <div className="dashboard__reporting-title">Reporting To:</div>
            <hr className="dashboard__divider" />
            <div className="dashboard__reporting-list">
              {managerName && (
                <div>
                  <a
                    onClick={() => navigate(`/person/${managerID}`)}
                    className="dashboard__link"
                  >
                    {managerName}
                  </a>
                </div>
              )}
            </div>
          </section>

          {directReports && directReports.length > 0 && (
            <section className="dashboard__direct-reports">
              <div className="dashboard__reporting-title">Direct Reports:</div>
              <hr className="dashboard__divider" />
              <div className="dashboard__reporting-list">
                {directReports.map((directReport) => (
                  <div key={directReport.id}>
                    <a
                      onClick={() => navigate(`/person/${directReport.id}`)}
                      className="dashboard__link"
                    >
                      {directReport.name}
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