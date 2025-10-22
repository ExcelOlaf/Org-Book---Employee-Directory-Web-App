from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd

# Load your fake dataset
df = pd.read_csv("employees_small.csv", dtype={"EmployeeID": str, "ManagerID": str})
df = df.where(pd.notnull(df), None)  # replace NaN with None

app = FastAPI(title="Employee API Demo")

# Pydantic model for POST
class Employee(BaseModel):
    EmployeeID: str
    FirstName: str
    LastName: str
    ManagerID: str
    EmailAddress: str
    PhoneNumber: str
    Status: str = "Active"

# ------------------------
# GET endpoint
# ------------------------
@app.get("/employee/{emp_id}")
def get_employee(emp_id: str):
    record = df[df["EmployeeID"] == emp_id]
    if record.empty:
        raise HTTPException(status_code=404, detail="Employee not found")
    return record.to_dict(orient="records")[0]

# ------------------------
# POST endpoint (demo insert)
# ------------------------
@app.post("/employee")
def add_employee(emp: Employee):
    global df
    # Append to DataFrame (not persistent after restart, just for demo)
    new_record = emp.dict()
    df = pd.concat([df, pd.DataFrame([new_record])], ignore_index=True)
    return {"message": "Employee added", "data": new_record}
