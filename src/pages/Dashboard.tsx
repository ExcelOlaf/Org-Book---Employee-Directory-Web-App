import React from "react";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard__grid">
        <div className="dashboard__left-column">
          <section className="dashboard__section">
            <div className="dashboard__section-title">Basic Info</div>
            <hr className="dashboard__divider" />
            <div className="dashboard__card" />
          </section>

          <section className="dashboard__section dashboard__section--flex">
            <div className="dashboard__section-title">Contact Info</div>
            <hr className="dashboard__divider" />
            <div className="dashboard__card dashboard__card--contact" />
          </section>

          <div className="dashboard__fw-box">
            <div className="dashboard__fw-title">Fun</div>
            <div className="dashboard__fw-subtitle">TBD</div>
          </div>
        </div>

        <div className="dashboard__right-column">
          <div className="dashboard__name-wrapper">
            <div className="dashboard__name-box">Name</div>
          </div>

          <div className="dashboard__profile-circle" />

          <div className="dashboard__chips">
            <div className="dashboard__chip">Org</div>
            <div className="dashboard__chip">Email</div>
            <div className="dashboard__chip">Phone</div>
          </div>

          <section className="dashboard__reporting">
            <div className="dashboard__reporting-title">Reporting To:</div>
            <hr className="dashboard__divider" />
            <div className="dashboard__reporting-list">
              <div>Mgr Placeholder 1</div>
              <div>Mgr Placeholder 2</div>
              <div>Mgr Placeholder 3</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}