import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/apiRoute";
import { useNavigate, useParams } from "react-router-dom";
 
const PLACEHOLDER_ID = 730467;
 
export default function Dashboard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string}>(); 

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
  const [directReports, setDirectReports] = useState<{id: number, name: string}[]>([]);
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
      .then(res => res.json())
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
          getDirectReports(directReportIDs)
            .then(res => setDirectReports(res));
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
      <div style={{ padding: "50px" }}>
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
            <div className="dashboard__card" >
              <p>Age: {String(age)}</p>
              <p>Department: {department}</p>
              <p>Address: {address}</p>
            </div>
          </section>

          <section className="dashboard__section dashboard__section--flex">
            <div className="dashboard__section-title">Contact Info</div>
            <hr className="dashboard__divider" />
            <div className="dashboard__card dashboard__card--contact">
              <p>Phone Number: {phone}</p>
              <p>Email: {email}</p>
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
            <img src={picture} style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }} alt="Profile Picture"></img>
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
              <div>
                <a onClick={() => navigate(`/person/${managerID}`)}
                   style={{ cursor: "pointer", color: "#0d6efd", textDecoration: "underline" }}
                >
                  {managerName}
                </a>
              </div>
            </div>
          </section>
          <section style={{ alignSelf: "stretch", marginTop: "24px" }}>
{directReports && (<div> {/* Only display section if employee has direct reports */}
<div

              style={{

                fontSize: "18px",

                fontWeight: 600,

                marginBottom: "6px",

              }}
>

              Direct Reports:
</div>
<hr style={dividerStyle} />
<div

              style={{

                marginTop: "12px",

                display: "flex",

                flexDirection: "column",

                gap: "8px",

              }}
>
<div>
  {directReports.map(directReport => (
    <div key={directReport.id}>
      <a onClick={() => navigate(`/person/${directReport.id}`)} 
        style={{ cursor: "pointer", color: "#0d6efd", textDecoration: "underline" }}
      >{directReport.name}</a></div>
    ))}
</div>
</div>
</div>)}
</section>
        </div>
      </div>
    </div>
  );
}