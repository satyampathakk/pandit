import { NavLink, useNavigate } from 'react-router-dom';
import { getUserType } from '../api/client.js';

const navLinkClass = ({ isActive }) => (isActive ? 'active' : undefined);

export default function Navbar() {
  const navigate = useNavigate();
  const userType = getUserType();
  const isPandit = userType === 'pandit';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_type');
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">Pandit Booking</h1>
        <ul className="nav-menu">
          <li>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </li>
          {isPandit ? (
            <>
              <li>
                <NavLink to="/manage-services" className={navLinkClass}>
                  My Services
                </NavLink>
              </li>
              <li>
                <NavLink to="/bookings" className={navLinkClass}>
                  My Bookings
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/services" className={navLinkClass}>
                  Services
                </NavLink>
              </li>
              <li>
                <NavLink to="/pandits" className={navLinkClass}>
                  Find Pandits
                </NavLink>
              </li>
              <li>
                <NavLink to="/bookings" className={navLinkClass}>
                  My Bookings
                </NavLink>
              </li>
            </>
          )}
          <li>
            <button type="button" className="link-button" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
