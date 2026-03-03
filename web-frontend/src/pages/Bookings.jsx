import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config.js';
import { getAuthToken, getUserType } from '../api/client.js';
import { useFlashMessage } from '../hooks/useFlashMessage.js';

export default function Bookings() {
  const navigate = useNavigate();
  const { message, showMessage } = useFlashMessage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const userType = getUserType();
  const isPandit = userType === 'pandit';

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const token = getAuthToken();
    if (!token) {
      showMessage('Please login again.', 'error');
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isPandit ? '/pandit/bookings' : '/user/bookings';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      showMessage('Error loading bookings', 'error');
      console.error('Load bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (bookingId) => {
    setReviewBookingId(bookingId);
    setReviewRating('5');
    setReviewComment('');
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
  };

  const submitReview = async (event) => {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) {
      showMessage('Please login again.', 'error');
      navigate('/');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/bookings/${reviewBookingId}/review`,
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: parseInt(reviewRating, 10),
          comment: reviewComment,
        }),
        }
      );

      if (response.ok) {
        showMessage('Review submitted successfully!', 'success');
        closeReviewModal();
        loadBookings();
      } else {
        showMessage('Error submitting review', 'error');
      }
    } catch (error) {
      showMessage('Error submitting review', 'error');
      console.error('Submit review error:', error);
    }
  };

  const statusGroups = useMemo(
    () => ({
      upcoming: ['pending', 'confirmed', 'scheduled'],
      completed: ['completed'],
      cancelled: ['cancelled', 'rejected'],
    }),
    []
  );

  const filteredBookings = useMemo(() => {
    if (isPandit) {
      return bookings;
    }
    const group = statusGroups[activeTab] || [];
    return bookings.filter((booking) => group.includes(booking.status));
  }, [bookings, activeTab, statusGroups, isPandit]);

  const tabCounts = useMemo(
    () => ({
      upcoming: bookings.filter((booking) => statusGroups.upcoming.includes(booking.status)).length,
      completed: bookings.filter((booking) => statusGroups.completed.includes(booking.status)).length,
      cancelled: bookings.filter((booking) => statusGroups.cancelled.includes(booking.status)).length,
    }),
    [bookings, statusGroups]
  );

  return (
    <div className="container">
      <div className="page-header">
        <h2>{isPandit ? 'Booking Requests' : 'My Bookings'}</h2>
        <p>{isPandit ? 'Manage requests for your services' : 'View and manage your bookings'}</p>
        {!isPandit ? (
          <div className="tabs" style={{ marginTop: '18px' }}>
            <button
              type="button"
              className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming ({tabCounts.upcoming})
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({tabCounts.completed})
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled ({tabCounts.cancelled})
            </button>
          </div>
        ) : null}
      </div>

      {message.text ? (
        <div className={`message ${message.type}`}>{message.text}</div>
      ) : null}

      <div id="bookingsList" className="bookings-list">
        {loading ? <p className="loading">Loading bookings...</p> : null}
        {!loading && bookings.length === 0 ? (
          <p className="no-results">
            {isPandit ? (
              'No booking requests yet.'
            ) : (
              <>
                No bookings found. <Link to="/pandits">Book a service</Link>
              </>
            )}
          </p>
        ) : null}
        {!loading && bookings.length > 0 && filteredBookings.length === 0 ? (
          <p className="no-results">No bookings in this section yet.</p>
        ) : null}
        {!loading
          ? filteredBookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <div className="booking-left">
                  <div className="booking-avatar">P</div>
                  <div className="booking-info">
                    <h3>{booking.service_name || `Booking #${booking.id.substring(0, 8)}`}</h3>
                    <p>{new Date(booking.booking_date).toLocaleString()}</p>
                    <p>Amount: Rs {booking.total_amount}</p>
                  </div>
                </div>
                <div>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                  <div className="booking-actions" style={{ marginTop: '10px' }}>
                    {!isPandit && booking.status === 'completed' ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => openReviewModal(booking.id)}
                      >
                        Leave Review
                      </button>
                    ) : null}
                    {isPandit ? (
                      <>
                        {booking.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={async () => {
                                const token = getAuthToken();
                                const response = await fetch(
                                  `${API_BASE_URL}/pandit/bookings/${booking.id}/confirm`,
                                  {
                                    method: 'PUT',
                                    headers: { Authorization: `Bearer ${token}` },
                                  }
                                );
                                if (response.ok) {
                                  showMessage('Booking confirmed', 'success');
                                  loadBookings();
                                } else {
                                  const error = await response.json();
                                  showMessage(error.detail || 'Failed to confirm booking', 'error');
                                }
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={async () => {
                                const token = getAuthToken();
                                const response = await fetch(
                                  `${API_BASE_URL}/pandit/bookings/${booking.id}/reject`,
                                  {
                                    method: 'PUT',
                                    headers: { Authorization: `Bearer ${token}` },
                                  }
                                );
                                if (response.ok) {
                                  showMessage('Booking rejected', 'success');
                                  loadBookings();
                                } else {
                                  const error = await response.json();
                                  showMessage(error.detail || 'Failed to reject booking', 'error');
                                }
                              }}
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                        {booking.status === 'confirmed' ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={async () => {
                              const token = getAuthToken();
                              const response = await fetch(
                                `${API_BASE_URL}/pandit/bookings/${booking.id}/complete`,
                                {
                                  method: 'PUT',
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              );
                              if (response.ok) {
                                showMessage('Booking marked as completed', 'success');
                                loadBookings();
                              } else {
                                const error = await response.json();
                                showMessage(error.detail || 'Failed to complete booking', 'error');
                              }
                            }}
                          >
                            Mark Completed
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <button type="button" className="btn btn-primary">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          : null}
      </div>
      {!isPandit ? (
        <div className="promo-card" style={{ marginTop: '24px' }}>
          <div>
            <h3>Plan your next spiritual milestone</h3>
            <p className="section-subtitle">
              Explore premium puja services and personal astrology consultations curated for you.
            </p>
          </div>
          <button type="button" className="btn btn-primary">
            Explore Services
          </button>
        </div>
      ) : null}

      <div id="reviewModal" className={`modal ${showReviewModal ? '' : 'hidden'}`}>
        <div className="modal-content">
          <span className="close" onClick={closeReviewModal}>
            &times;
          </span>
          <h3>Leave a Review</h3>
          <form onSubmit={submitReview}>
            <div className="form-group">
              <label htmlFor="reviewRating">Rating (1-5)</label>
              <select
                id="reviewRating"
                required
                value={reviewRating}
                onChange={(event) => setReviewRating(event.target.value)}
              >
                <option value="5">Excellent</option>
                <option value="4">Good</option>
                <option value="3">Average</option>
                <option value="2">Below Average</option>
                <option value="1">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reviewComment">Comment</label>
              <textarea
                id="reviewComment"
                rows="4"
                placeholder="Share your experience..."
                required
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
