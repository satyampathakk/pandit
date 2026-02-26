import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config.js';
import { getAuthToken } from '../api/client.js';
import { useFlashMessage } from '../hooks/useFlashMessage.js';

export default function Pandits() {
  const navigate = useNavigate();
  const { message, showMessage } = useFlashMessage();
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDistance, setShowDistance] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPanditId, setSelectedPanditId] = useState('');
  const [services, setServices] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [filters, setFilters] = useState({
    maxDistance: 50,
    minRating: 0,
    maxPrice: '',
    sortBy: 'match_score',
  });
  const [location, setLocation] = useState({
    latitude: '',
    longitude: '',
    locationName: '',
  });

  const loadNearbyPandits = async () => {
    setLoading(true);
    setShowDistance(true);
    const token = getAuthToken();
    if (!token) {
      showMessage('Please login again.', 'error');
      navigate('/');
      return;
    }

    try {
      const params = new URLSearchParams({
        max_distance_km: String(filters.maxDistance || 50),
        min_rating: String(filters.minRating || 0),
        sort_by: filters.sortBy,
      });
      if (filters.maxPrice) {
        params.append('max_price', filters.maxPrice);
      }

      const response = await fetch(`${API_BASE_URL}/user/pandits/search?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 400) {
        const error = await response.json();
        showMessage(error.detail || 'Please update your location in your profile first', 'error');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setPandits(Array.isArray(data) ? data : []);
    } catch (error) {
      showMessage('Error loading nearby pandits', 'error');
      console.error('Load nearby pandits error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = async (panditId) => {
    setSelectedPanditId(panditId);
    setShowBookingModal(true);
    setServiceLoading(true);
    setServices([]);
    setBookingServiceId('');
    setServiceAddress('');
    setBookingDate('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/services?skip=0&limit=200`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      const filtered = list.filter((service) => service.pandit_id === panditId);
      setServices(filtered);
      if (filtered.length > 0) {
        setBookingServiceId(filtered[0].id);
      }
    } catch (error) {
      showMessage('Error loading services', 'error');
      console.error('Load services error:', error);
    } finally {
      setServiceLoading(false);
    }
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
  };

  const createBooking = async (event) => {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) {
      showMessage('Please login again.', 'error');
      navigate('/');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pandit_id: selectedPanditId,
          service_id: bookingServiceId,
          booking_date: bookingDate,
          service_address: serviceAddress,
        }),
      });

      if (response.ok) {
        showMessage('Booking created successfully!', 'success');
        closeBookingModal();
        setTimeout(() => navigate('/bookings'), 1500);
      } else {
        showMessage('Error creating booking', 'error');
      }
    } catch (error) {
      showMessage('Error creating booking', 'error');
      console.error('Create booking error:', error);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>Find Pandits</h2>
        <p>Discover experienced pandits in your area</p>
      </div>

      {message.text ? (
        <div className={`message ${message.type}`}>{message.text}</div>
      ) : null}

      <div className="filter-section">
        <div className="form-group">
          <label htmlFor="maxDistance">Max Distance (km)</label>
          <input
            id="maxDistance"
            type="number"
            min="1"
            value={filters.maxDistance}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, maxDistance: event.target.value }))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="minRating">Min Rating</label>
          <input
            id="minRating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={filters.minRating}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, minRating: event.target.value }))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="maxPrice">Max Price</label>
          <input
            id="maxPrice"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="sortBy">Sort By</label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, sortBy: event.target.value }))
            }
          >
            <option value="match_score">Best Match</option>
            <option value="distance">Distance</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
        </div>
        <button type="button" onClick={loadNearbyPandits} className="btn btn-primary">
          Find Pandits
        </button>
      </div>

      <div className="page-header" style={{ marginTop: '20px' }}>
        <h2>Update Location</h2>
        <p>Nearby search requires your current location</p>
      </div>
      <div className="filter-section">
        <div className="form-group">
          <label htmlFor="userLatitude">Latitude</label>
          <input
            id="userLatitude"
            type="number"
            step="any"
            value={location.latitude}
            onChange={(event) =>
              setLocation((prev) => ({ ...prev, latitude: event.target.value }))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="userLongitude">Longitude</label>
          <input
            id="userLongitude"
            type="number"
            step="any"
            value={location.longitude}
            onChange={(event) =>
              setLocation((prev) => ({ ...prev, longitude: event.target.value }))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="userLocationName">Location Name</label>
          <input
            id="userLocationName"
            type="text"
            value={location.locationName}
            onChange={(event) =>
              setLocation((prev) => ({ ...prev, locationName: event.target.value }))
            }
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            if (!navigator.geolocation) {
              showMessage('Geolocation is not supported by this browser.', 'error');
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setLocation((prev) => ({
                  ...prev,
                  latitude: pos.coords.latitude.toString(),
                  longitude: pos.coords.longitude.toString(),
                }));
                showMessage('Location captured. Click Save Location.', 'success');
              },
              () => {
                showMessage('Unable to get location. Please enter manually.', 'error');
              }
            );
          }}
        >
          Use Current Location
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            const token = getAuthToken();
            if (!token) {
              showMessage('Please login again.', 'error');
              navigate('/');
              return;
            }
            if (!location.latitude || !location.longitude) {
              showMessage('Please enter latitude and longitude.', 'error');
              return;
            }

            const params = new URLSearchParams({
              latitude: location.latitude,
              longitude: location.longitude,
            });
            if (location.locationName) {
              params.append('location_name', location.locationName);
            }

            try {
              const response = await fetch(
                `${API_BASE_URL}/user/location?${params.toString()}`,
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (response.ok) {
                showMessage('Location updated successfully!', 'success');
              } else {
                const error = await response.json();
                showMessage(error.detail || 'Failed to update location', 'error');
              }
            } catch (error) {
              showMessage('Failed to update location', 'error');
              console.error('Update location error:', error);
            }
          }}
        >
          Save Location
        </button>
      </div>

      <div id="panditsList" className="pandits-grid">
        {loading ? <p className="loading">Loading pandits...</p> : null}
        {!loading && pandits.length === 0 ? (
          <p className="no-results">No pandits found. Adjust filters or update location.</p>
        ) : null}
        {!loading
          ? pandits.map((pandit) => {
              const rating = Number.isFinite(pandit.rating_avg)
                ? pandit.rating_avg.toFixed(1)
                : 'N/A';

              return (
                <div className="pandit-card" key={pandit.id}>
                  <div className="pandit-header">
                    <h3>Pandit Profile</h3>
                    {pandit.is_verified ? (
                      <span className="verified-badge">Verified</span>
                    ) : null}
                  </div>
                  <div className="pandit-info">
                    <p>
                      <strong>Experience:</strong> {pandit.experience_years} years
                    </p>
                    <p>
                      <strong>Region:</strong> {pandit.region}
                    </p>
                    <p>
                      <strong>Languages:</strong> {pandit.languages}
                    </p>
                    {pandit.location_name ? (
                      <p>
                        <strong>Location:</strong> {pandit.location_name}
                      </p>
                    ) : null}
                    {showDistance && pandit.distance_km ? (
                      <p>
                        <strong>Distance:</strong> {pandit.distance_km} km
                      </p>
                    ) : null}
                    <p>
                      <strong>Rating:</strong> {rating}/5
                    </p>
                    <p>
                      <strong>Price:</strong> Rs {pandit.price_per_service}
                    </p>
                    {showDistance && pandit.match_score ? (
                      <p>
                        <strong>Match Score:</strong> {(pandit.match_score * 100).toFixed(0)}%
                      </p>
                    ) : null}
                  </div>
                  <div className="pandit-bio">
                    <p>{pandit.bio}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => openBookingModal(pandit.id)}
                  >
                    Book Now
                  </button>
                </div>
              );
            })
          : null}
      </div>

      <div id="bookingModal" className={`modal ${showBookingModal ? '' : 'hidden'}`}>
        <div className="modal-content">
          <span className="close" onClick={closeBookingModal}>
            &times;
          </span>
          <h3>Book a Service</h3>
          <form onSubmit={createBooking}>
            <div className="form-group">
              <label htmlFor="bookingService">Select Service</label>
              <select
                id="bookingService"
                required
                value={bookingServiceId}
                onChange={(event) => setBookingServiceId(event.target.value)}
              >
                {serviceLoading ? <option value="">Loading services...</option> : null}
                {!serviceLoading && services.length === 0 ? (
                  <option value="">No services available</option>
                ) : null}
                {!serviceLoading
                  ? services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - Rs {service.base_price}
                      </option>
                    ))
                  : null}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bookingDate">Booking Date</label>
              <input
                type="date"
                id="bookingDate"
                required
                value={bookingDate}
                onChange={(event) => setBookingDate(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="serviceAddress">Service Address *</label>
              <textarea
                id="serviceAddress"
                rows="3"
                required
                value={serviceAddress}
                onChange={(event) => setServiceAddress(event.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
