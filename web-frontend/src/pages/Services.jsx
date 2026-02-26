import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config.js';
import { getAuthToken } from '../api/client.js';
import { useFlashMessage } from '../hooks/useFlashMessage.js';

export default function Services() {
  const navigate = useNavigate();
  const { message, showMessage } = useFlashMessage();
  const [services, setServices] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/services?skip=0&limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      showMessage('Error loading services', 'error');
      console.error('Load services error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchServices = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      let url = `${API_BASE_URL}/user/services/search?sort_by=${sortBy}`;
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setServices(Array.isArray(data.items) ? data.items : data);
    } catch (error) {
      showMessage('Error searching services', 'error');
      console.error('Search services error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openBooking = async (service) => {
    setSelectedService(service);
    setBookingDate('');
    setServiceAddress('');
    setShowBookingModal(true);
  };

  const confirmBooking = async (event) => {
    event.preventDefault();
    if (!selectedService) {
      showMessage('Please select a service', 'error');
      return;
    }

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
          pandit_id: selectedService.pandit_id,
          service_id: selectedService.id,
          booking_date: bookingDate,
          service_address: serviceAddress,
        }),
      });

      if (response.ok) {
        showMessage('Booking created successfully!', 'success');
        setShowBookingModal(false);
        setTimeout(() => navigate('/bookings'), 1500);
      } else {
        const error = await response.json();
        showMessage(error.detail || 'Error creating booking', 'error');
      }
    } catch (error) {
      showMessage('Error creating booking', 'error');
      console.error('Create booking error:', error);
    }
  };

  const bookingSummary = useMemo(() => {
    if (!selectedService) {
      return null;
    }

    return {
      serviceName: selectedService.name,
      category: selectedService.category,
      price: selectedService.base_price,
      duration: selectedService.duration_minutes,
    };
  }, [selectedService]);

  return (
    <div className="container">
      <div className="page-header">
        <h2>Available Services</h2>
        <p>Browse and search for spiritual services</p>
      </div>

      {message.text ? (
        <div className={`message ${message.type}`}>{message.text}</div>
      ) : null}

      <div className="search-section">
        <input
          type="text"
          id="searchKeyword"
          placeholder="Search services..."
          className="search-input"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <button type="button" onClick={searchServices} className="btn btn-primary">
          Search
        </button>
      </div>

      <div className="filter-section">
        <select
          id="sortBy"
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value);
            setTimeout(searchServices, 0);
          }}
        >
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>
      </div>

      <div id="servicesList" className="services-grid">
        {loading ? <p className="loading">Loading services...</p> : null}
        {!loading && services.length === 0 ? (
          <p className="no-results">No services found</p>
        ) : null}
        {!loading
          ? services.map((service) => (
              <div className="service-card" key={service.id}>
                <h3>{service.name}</h3>
                <p className="category">Category: {service.category}</p>
                <p className="price">Rs {service.base_price}</p>
                <p className="duration">Duration: {service.duration_minutes} minutes</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: '15px' }}
                  onClick={() => openBooking(service)}
                >
                  Book This Service
                </button>
              </div>
            ))
          : null}
      </div>

      <div
        id="bookingModal"
        className={`modal ${showBookingModal ? '' : 'hidden'}`}
      >
        <div className="modal-content">
          <span className="close" onClick={() => setShowBookingModal(false)}>
            &times;
          </span>
          <h3>Confirm Your Booking</h3>
          <form onSubmit={confirmBooking}>
            <div className="booking-summary">
              {bookingSummary ? (
                <>
                  <p>
                    <strong>Service:</strong> {bookingSummary.serviceName}
                  </p>
                  <p>
                    <strong>Category:</strong> {bookingSummary.category}
                  </p>
                  <p>
                    <strong>Price:</strong> Rs {bookingSummary.price}
                  </p>
                  <p>
                    <strong>Duration:</strong> {bookingSummary.duration} minutes
                  </p>
                </>
              ) : null}
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
                placeholder="Enter the full address for the service"
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
