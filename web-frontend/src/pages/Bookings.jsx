import { useEffect, useState } from 'react';
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

  return (
    <div className="container">
      <div className="page-header">
        <h2>{isPandit ? 'Booking Requests' : 'My Bookings'}</h2>
        <p>{isPandit ? 'Manage requests for your services' : 'View and manage your bookings'}</p>
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
        {!loading
          ? bookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <div className="booking-header">
                  <h3>Booking #{booking.id.substring(0, 8)}</h3>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-details">
                  <p>
                    <strong>Date:</strong> {new Date(booking.booking_date).toLocaleString()}
                  </p>
                  <p>
                    <strong>Amount:</strong> Rs {booking.total_amount}
                  </p>
                  <p>
                    <strong>Service ID:</strong> {booking.service_id}
                  </p>
                  <p>
                    <strong>Pandit ID:</strong> {booking.pandit_id}
                  </p>
                  {booking.service_address ? (
                    <p>
                      <strong>Address:</strong> {booking.service_address}
                    </p>
                  ) : null}
                </div>
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
                  <div className="action-buttons" style={{ marginTop: '10px' }}>
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
                  </div>
                ) : null}
              </div>
            ))
          : null}
      </div>

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
