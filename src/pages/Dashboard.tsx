import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/apiRoute";
import { useNavigate, useParams } from "react-router-dom";
 
const PLACEHOLDER_ID = 730467;

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
<div style={containerStyle}>
<div style={gridStyle}>

        {/* LEFT COLUMN: BASIC INFO + CONTACT INFO + FW/TBD BOX */}
<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

          {/* BASIC INFO */}
<section style={{ marginBottom: "24px" }}>
<div style={sectionTitleStyle}>Basic Info</div>
<hr style={dividerStyle} />
<div style={{ ...cardStyle, marginTop: "12px" }}>
  <p>Age: {String(age)}</p>
  <p>Department: {department}</p>
  <p>Address: {address}</p>
</div>
</section>
 
          {/* CONTACT INFO */}
<section style={{ flex: 1 }}>
<div style={sectionTitleStyle}>Contact Info</div>
<hr style={dividerStyle} />
<div style={{ ...contactAreaStyle, marginTop: "12px" }}>
  <p>Phone Number: {phone}</p>
  <p>Email: {email}</p>
</div>
</section>
 
          {/* SOME FW / TBD BOX BOTTOM LEFT AREA (ALIGNED RIGHT IN THAT COLUMN) */}
<div style={fwBoxStyle}>
<div style={{ fontWeight: 600 }}>Fun</div>
<div style={{ fontSize: "12px", marginTop: "4px" }}>TBD</div>
</div>
</div>
 
        {/* RIGHT COLUMN: NAME + CIRCLE + ORG/EMAIL/PHONE + REPORTING TO */}
<div

          style={{

            display: "flex",

            flexDirection: "column",

            alignItems: "center",

          }}
>

          {/* NAME BOX TOP RIGHT */}
<div style={{ alignSelf: "flex-end" }}>
<div style={rightNameBoxStyle}>{name}</div>
</div>
 
          {/* PROFILE CIRCLE */}
<div style={circleStyle}>
  {/* TODO: fix to get actual image */}
  <img src={picture} style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }} alt="photo"></img>
</div>
 
          {/* 3 SMALL CIRCLES */}
<div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
<div style={smallChipStyle}>Org</div>
<div style={smallChipStyle}>Email</div>
<div style={smallChipStyle}>Phone</div>
</div>

          {/* REPORTING TO */}
<section style={{ alignSelf: "stretch", marginTop: "24px" }}>
{managerID && (<div> {/* Only display section if employee has manager */}
<div

              style={{

                fontSize: "18px",

                fontWeight: 600,

                marginBottom: "6px",

              }}
>

              Reporting To:
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
<div><a 
        onClick={() => navigate(`/person/${managerID}`)}
        style={{ cursor: "pointer", color: "#0d6efd", textDecoration: "underline" }}
     >
      {managerName}
     </a></div>
</div>
</div>)}
</section>

          {/* DIRECT REPORTS */}
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

 