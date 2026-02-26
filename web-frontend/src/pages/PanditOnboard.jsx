import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config.js';
import { useFlashMessage } from '../hooks/useFlashMessage.js';

export default function PanditOnboard() {
  const navigate = useNavigate();
  const { message, showMessage } = useFlashMessage();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    password: '',
    email: '',
    experienceYears: '',
    bio: '',
    region: '',
    languages: '',
    locationName: '',
    latitude: '',
    longitude: '',
    pricePerService: '',
  });
  const [locating, setLocating] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showMessage('Geolocation is not supported by this browser.', 'error');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        setLocating(false);
        showMessage('Location captured successfully!', 'success');
      },
      (error) => {
        setLocating(false);
        showMessage('Unable to get location. Please enter manually.', 'error');
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      full_name: form.fullName,
      phone: form.phone,
      password: form.password,
      email: form.email || null,
      experience_years: parseInt(form.experienceYears, 10),
      bio: form.bio,
      region: form.region,
      languages: form.languages,
      location_name: form.locationName || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      price_per_service: parseFloat(form.pricePerService),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/pandit/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showMessage('Pandit registered successfully! Please login as pandit.', 'success');
        setTimeout(() => navigate('/'), 1500);
      } else {
        const error = await response.json();
        showMessage(error.detail || 'Failed to register pandit.', 'error');
      }
    } catch (error) {
      showMessage('Network error. Please try again.', 'error');
      console.error('Pandit registration error:', error);
    }
  };

  return (
    <div className="container">
        <div className="page-header">
          <h2>Become a Pandit</h2>
          <p>Create a pandit account to offer your spiritual services</p>
        </div>

      {message.text ? (
        <div className={`message ${message.type}`}>{message.text}</div>
      ) : null}

      <div className="onboard-container">
        <div className="onboard-info">
          <h3>Why Join as a Pandit?</h3>
          <ul className="benefits-list">
            <li>Reach more devotees in your area</li>
            <li>Manage your bookings efficiently</li>
            <li>Build your reputation with reviews</li>
            <li>Set your own pricing</li>
            <li>Verified badge for credibility</li>
          </ul>
        </div>

        <div className="onboard-form-container">
          <h3>Pandit Registration Form</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                required
                value={form.fullName}
                onChange={handleChange('fullName')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                required
                value={form.phone}
                onChange={handleChange('phone')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                required
                value={form.password}
                onChange={handleChange('password')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="experienceYears">Years of Experience *</label>
              <input
                type="number"
                id="experienceYears"
                min="0"
                max="100"
                placeholder="Enter years of experience"
                required
                value={form.experienceYears}
                onChange={handleChange('experienceYears')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio / About Yourself *</label>
              <textarea
                id="bio"
                rows="4"
                placeholder="Tell us about your expertise, specializations, and background..."
                required
                value={form.bio}
                onChange={handleChange('bio')}
              />
              <small>Share your experience, areas of expertise, and what makes you unique</small>
            </div>

            <div className="form-group">
              <label htmlFor="region">Region / Area *</label>
              <input
                type="text"
                id="region"
                placeholder="e.g., Mumbai, Delhi NCR, Bangalore"
                required
                value={form.region}
                onChange={handleChange('region')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="languages">Languages Known *</label>
              <input
                type="text"
                id="languages"
                placeholder="e.g., Hindi, English, Sanskrit, Tamil"
                required
                value={form.languages}
                onChange={handleChange('languages')}
              />
              <small>Separate multiple languages with commas</small>
            </div>

            <div className="form-group">
              <label htmlFor="locationName">Location Name</label>
              <input
                type="text"
                id="locationName"
                placeholder="e.g., Andheri West, Connaught Place"
                value={form.locationName}
                onChange={handleChange('locationName')}
              />
            </div>

            <div className="form-group">
              <label>GPS Location</label>
              <button type="button" className="btn-location" onClick={getCurrentLocation}>
                {locating ? 'Capturing...' : 'Get Current Location'}
              </button>
              <p className="helper-text">
                We use this to connect you with devotees nearby.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="pricePerService">Price per Service (Rs) *</label>
              <input
                type="number"
                id="pricePerService"
                min="0"
                step="100"
                placeholder="e.g., 2100"
                required
                value={form.pricePerService}
                onChange={handleChange('pricePerService')}
              />
              <small>Base price for your services (can vary per service type)</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Submit Application
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
