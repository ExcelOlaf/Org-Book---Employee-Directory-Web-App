# Lewis-Team-2: Secure Cloud-Based Employee Phonebook

## Project Description
This project is a secure, cloud-based internal employee directory and organizational structure web application. The tool is designed to improve visibility into company hierarchy, support collaboration, and provide efficient access to employee details.  

### Core Features
- Interactive organizational tree displaying company hierarchy.  
- Clickable employee profiles showing: name, phone number, desk, department, position, manager, and direct reports.  
- Search functionality by employee name, position, or department.  
- Offline viewing of cached data for environments without internet access.  
- Secure authentication and integration with existing enterprise systems.  

The objective is to deliver a professional, scalable, and user-friendly tool for employees, managers, IT, and HR teams.  

---

##  Getting Started

### Requirements
- **Languages/Frameworks**: React.js, Node.js, Express.js  
- **Database**: DynamoDB or MongoDB (Atlas or self-hosted)  
- **Visualization**: D3.js (for org chart)  
- **Styling**: TailwindCSS  
- **Offline Support**: IndexedDB or PouchDB  
- **Hosting**: AWS (preferred), Azure, or GCP  
- **Authentication**: SSO via Azure AD, Okta, or Google Workspace  

### Setup
```bash
# Clone the repository
git clone https://gitlab.com/msoe.edu/sdl/y26-senior-design/lewis-team-2.git
cd lewis-team-2

# Install dependencies
npm install

# Start development server
npm run dev
