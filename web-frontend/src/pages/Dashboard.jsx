import { Link } from 'react-router-dom';
import { getUserType } from '../api/client.js';

export default function Dashboard() {
  const userType = getUserType();
  const isPandit = userType === 'pandit';

  return (
    <div className="container">
      <div className="page-shell">
        <section className="dashboard-hero">
          <div className="hero-content">
            <span className="hero-badge">Welcome Back</span>
            <h1>{isPandit ? 'Grow Your Spiritual Practice' : 'Plan Your Sacred Moments'}</h1>
            <p>
              {isPandit
                ? 'Manage services, respond to booking requests, and delight your devotees.'
                : 'Discover verified pandits and curated rituals designed for every occasion.'}
            </p>
            <div className="hero-actions">
              <Link to={isPandit ? '/manage-services' : '/services'} className="btn btn-primary">
                {isPandit ? 'Manage Services' : 'Explore Services'}
              </Link>
              <Link to="/bookings" className="btn btn-secondary">
                View Bookings
              </Link>
            </div>
          </div>
          <div className="hero-side">
            <div className="stat-card">
              <p className="stat-label">Upcoming</p>
              <p className="stat-value">3 Bookings</p>
              <p className="stat-note">Next 7 days</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Rating</p>
              <p className="stat-value">4.9</p>
              <p className="stat-note">Trusted by devotees</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Your Dashboard</h2>
              <p className="section-subtitle">Quick access to your most used actions</p>
            </div>
          </div>

          {isPandit ? (
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-icon">PUJA</div>
                <h3>Manage Services</h3>
                <p>Add or update your service offerings and pricing</p>
                <Link to="/manage-services" className="btn btn-primary">
                  My Services
                </Link>
              </div>
              <div className="dashboard-card">
                <div className="card-icon">DATE</div>
                <h3>Booking Requests</h3>
                <p>Confirm, reject, or complete bookings from devotees</p>
                <Link to="/bookings" className="btn btn-secondary">
                  View Bookings
                </Link>
              </div>
              <div className="dashboard-card">
                <div className="card-icon">RATE</div>
                <h3>Reputation</h3>
                <p>Track your reviews and maintain a high rating</p>
                <Link to="/bookings" className="btn btn-primary">
                  See Reviews
                </Link>
              </div>
            </div>
          ) : (
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-icon">PUJA</div>
                <h3>Browse Services</h3>
                <p>Explore pujas, ceremonies, and consultations curated for you</p>
                <Link to="/services" className="btn btn-primary">
                  View Services
                </Link>
              </div>
              <div className="dashboard-card">
                <div className="card-icon">FIND</div>
                <h3>Find Pandits</h3>
                <p>Connect with experienced pandits near your location</p>
                <Link to="/pandits" className="btn btn-primary">
                  Find Pandits
                </Link>
              </div>
              <div className="dashboard-card">
                <div className="card-icon">BOOK</div>
                <h3>My Bookings</h3>
                <p>View, reschedule, or review your booked rituals</p>
                <Link to="/bookings" className="btn btn-primary">
                  View Bookings
                </Link>
              </div>
            </div>
          )}
        </section>

        {!isPandit ? (
          <div className="promo-card">
            <div>
              <h3>Plan your next spiritual milestone</h3>
              <p className="section-subtitle">
                Explore premium puja services and personal astrology consultations curated for
                you.
              </p>
            </div>
            <Link to="/services" className="btn btn-primary">
              Explore Services
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
