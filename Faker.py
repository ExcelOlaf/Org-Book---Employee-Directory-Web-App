from faker import Faker
import pandas as pd
import random

# Load original dataset
df = pd.read_csv("WA_Fn-UseC_-HR-Employee-Attrition.csv")

# Initialize faker
fake = Faker()

# ─────────────────────────────────────────────
# EMPLOYEE & MANAGER IDs
# ─────────────────────────────────────────────

# EmployeeID → force to 6 digits (000001–999999)
df["EmployeeID"] = [str(random.randint(1, 999999)).zfill(6) for _ in range(len(df))]

employee_ids = df["EmployeeID"].tolist()

# ManagerID rules:
# - If chosen manager == self → set "000000"
# - Otherwise assign a valid EmployeeID
manager_ids = []
for emp in employee_ids:
    mgr = random.choice(employee_ids)
    if mgr == emp:
        manager_ids.append("000000")  # CEO/top-level manager
    else:
        manager_ids.append(mgr)

df["ManagerID"] = manager_ids

# ─────────────────────────────────────────────
# DEPARTMENTS & JOB INFO
# ─────────────────────────────────────────────

# DepartmentID (assign random 100–999 per department)
dept_ids = {dept: random.randint(100, 999) for dept in df["Department"].unique()}
df["DepartmentID"] = df["Department"].map(dept_ids)

# DepartmentName (rename Department)
df.rename(columns={"Department": "DepartmentName"}, inplace=True)

# JobTitle (rename JobRole)
df.rename(columns={"JobRole": "JobTitle"}, inplace=True)

# ─────────────────────────────────────────────
# EMPLOYEE DEMOGRAPHICS
# ─────────────────────────────────────────────

df["FirstName"] = [fake.first_name() for _ in range(len(df))]
df["LastName"] = [fake.last_name() for _ in range(len(df))]

# Hire Date
df["HireDate"] = [fake.date_between(start_date="-10y", end_date="today") for _ in range(len(df))]

# Email
df["EmailAddress"] = [fake.email() for _ in range(len(df))]

# Phone → 9 digits, no hyphens
df["PhoneNumber"] = [str(random.randint(100000000, 999999999)) for _ in range(len(df))]

# ─────────────────────────────────────────────
# REPORTING & STRUCTURE
# ─────────────────────────────────────────────

# DirectReports → count how many people list this EmployeeID as ManagerID
direct_reports = df["ManagerID"].value_counts().to_dict()
df["DirectReports"] = df["EmployeeID"].map(lambda eid: direct_reports.get(eid, 0))

# DeptHeadID (pick random employee per department)
dept_heads = {
    dept: random.choice(df[df["DepartmentID"] == dept_id]["EmployeeID"].tolist())
    for dept, dept_id in dept_ids.items()
}
df["DeptHeadID"] = df["DepartmentID"].map(dept_heads)

# ParentDeptID (random link between departments)
parent_dept_ids = {
    dept_id: random.choice(list(dept_ids.values()))
    for dept_id in dept_ids.values()
}
df["ParentDeptID"] = df["DepartmentID"].map(parent_dept_ids)

# ─────────────────────────────────────────────
# SITE INFO
# ─────────────────────────────────────────────

df["SiteID"] = [random.randint(1, 10) for _ in range(len(df))]
df["SiteName"] = [fake.company() + " Campus" for _ in range(len(df))]
df["SiteBuildings"] = [
    str(random.sample(["Building A", "Building B", "Building C"], random.randint(1, 3)))
    for _ in range(len(df))
]
df["SiteDepartments"] = [
    str(random.sample(["Engineering", "Product", "Support"], random.randint(1, 3)))
    for _ in range(len(df))
]

# Desk Location
df["DeskLocation"] = [f"HQ-{random.randint(1,5)}-{random.randint(1,99)}" for _ in range(len(df))]

# Address
df["Address"] = [fake.address().replace("\n", ", ") for _ in range(len(df))]

# Status
df["Status"] = [random.choice(["Active", "Inactive"]) for _ in range(len(df))]

# ─────────────────────────────────────────────
# EXPORT TO CSV & EXCEL
# ─────────────────────────────────────────────

df.to_csv("employees_with_fake_data.csv", index=False)

# Excel export (requires openpyxl)
try:
    df.to_excel("employees_with_fake_data.xlsx", index=False, engine="openpyxl")
except ImportError:
    print("⚠️ openpyxl not installed, only CSV was generated.")

print("✅ Fake employee dataset generated: employees_with_fake_data.csv & employees_with_fake_data.xlsx")
