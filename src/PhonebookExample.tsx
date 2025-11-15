import './App.css';

// Example of how to use the consistent component styles
const PhonebookExample = () => {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">Employee Phonebook</h1>
        </div>
      </header>

      <main className="container">
        {/* Navigation */}
        <nav className="nav">
          <a href="#" className="nav-item active">All Employees</a>
          <a href="#" className="nav-item">Departments</a>
          <a href="#" className="nav-item">Settings</a>
        </nav>

        {/* Search Bar */}
        <div className="search-container">
          <div className="input-group">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search employees..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', gap: 'var(--spacing-md)' }}>
          <button className="btn btn-primary">Add Employee</button>
          <button className="btn btn-outline">Export List</button>
          <button className="btn btn-secondary btn-small">Filters</button>
        </div>

        {/* Employee Cards */}
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          <div className="employee-card">
            <div className="employee-avatar">JD</div>
            <div className="employee-info">
              <h3 className="employee-name">John Doe</h3>
              <p className="employee-title">Senior Software Engineer</p>
              <p className="employee-department">Engineering</p>
            </div>
            <div className="employee-contact">
              <p className="employee-phone">📞 (555) 123-4567</p>
              <p className="employee-email">✉️ john.doe@company.com</p>
            </div>
          </div>

          <div className="employee-card">
            <div className="employee-avatar">JS</div>
            <div className="employee-info">
              <h3 className="employee-name">Jane Smith</h3>
              <p className="employee-title">Product Manager</p>
              <p className="employee-department">Product</p>
            </div>
            <div className="employee-contact">
              <p className="employee-phone">📞 (555) 987-6543</p>
              <p className="employee-email">✉️ jane.smith@company.com</p>
            </div>
          </div>

          <div className="employee-card">
            <div className="employee-avatar">MB</div>
            <div className="employee-info">
              <h3 className="employee-name">Mike Brown</h3>
              <p className="employee-title">UX Designer</p>
              <p className="employee-department">Design</p>
            </div>
            <div className="employee-contact">
              <p className="employee-phone">📞 (555) 456-7890</p>
              <p className="employee-email">✉️ mike.brown@company.com</p>
            </div>
          </div>
        </div>

        {/* Example Form Card */}
        <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="card-header">
            <h2 className="card-title">Add New Employee</h2>
            <p className="card-subtitle">Fill in the details below</p>
          </div>
          
          <div className="card-content">
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" placeholder="John" />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" placeholder="Doe" />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-group">
                  <span className="input-icon">✉️</span>
                  <input type="email" id="email" placeholder="john.doe@company.com" />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" placeholder="(555) 123-4567" />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select id="department">
                    <option value="">Select Department</option>
                    <option value="engineering">Engineering</option>
                    <option value="product">Product</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          
          <div className="card-footer">
            <button className="btn btn-outline">Cancel</button>
            <button className="btn btn-primary">Save Employee</button>
          </div>
        </div>

        {/* Example Alerts */}
        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="alert alert-success">
            ✅ Employee added successfully!
          </div>
          <div className="alert alert-warning">
            ⚠️ Please verify the email address format.
          </div>
          <div className="alert alert-error">
            ❌ Failed to connect to the server.
          </div>
          <div className="alert alert-info">
            ℹ️ You can customize colors using the themes.css file.
          </div>
        </div>

        {/* Loading State Example */}
        <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="loading">
            <div className="spinner"></div>
            <span style={{ marginLeft: 'var(--spacing-md)' }}>Loading employees...</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PhonebookExample;