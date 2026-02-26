import { Link } from 'react-router-dom';
import { getUserType } from '../api/client.js';

export default function Dashboard() {
  const userType = getUserType();
  const isPandit = userType === 'pandit';

  return (
    <div className="container">
      <div className="dashboard">
        <h2>Welcome to Your Dashboard</h2>

        {isPandit ? (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Manage Services</h3>
                <p>Add or update your service offerings and pricing</p>
                <Link to="/manage-services" className="btn btn-primary">
                  My Services
                </Link>
              </div>
              <div className="dashboard-card">
                <h3>Booking Requests</h3>
                <p>Confirm, reject, or complete bookings from devotees</p>
                <Link to="/bookings" className="btn btn-secondary">
                  View Bookings
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Browse Services</h3>
                <p>Explore various spiritual services like pujas, ceremonies, and consultations</p>
                <Link to="/services" className="btn btn-primary">
                  View Services
                </Link>
              </div>

              <div className="dashboard-card">
                <h3>Find Pandits</h3>
                <p>Find experienced pandits near your location</p>
                <Link to="/pandits" className="btn btn-primary">
                  Find Pandits
                </Link>
              </div>

              <div className="dashboard-card">
                <h3>My Bookings</h3>
                <p>View and manage your booking history</p>
                <Link to="/bookings" className="btn btn-primary">
                  View Bookings
                </Link>
              </div>

              <div className="dashboard-card">
                <h3>Leave Reviews</h3>
                <p>Share your experience and rate pandits</p>
                <Link to="/bookings" className="btn btn-secondary">
                  Rate Services
                </Link>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <Link to="/services" className="btn btn-primary">
                  Book a Service
                </Link>
                <Link to="/pandits" className="btn btn-secondary">
                  Find Nearby Pandits
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
