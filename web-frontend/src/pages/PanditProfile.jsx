import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config.js';
import { getAuthToken } from '../api/client.js';
import { useFlashMessage } from '../hooks/useFlashMessage.js';

export default function PanditProfile() {
  const navigate = useNavigate();
  const { message, showMessage } = useFlashMessage();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    experienceYears: '',
    bio: '',
    region: '',
    languages: '',
    pricePerService: '',
    locationName: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        showMessage('Please login again.', 'error');
        navigate('/');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/pandit/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to load profile');
      }
      const data = await response.json();
      setForm({
        fullName: data.full_name || '',
        phone: data.phone || '',
        email: data.email || '',
        experienceYears: data.experience_years?.toString() || '',
        bio: data.bio || '',
        region: data.region || '',
        languages: data.languages || '',
        pricePerService: data.price_per_service?.toString() || '',
        locationName: data.location_name || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
      });
    } catch (error) {
      showMessage('Failed to load profile', 'error');
      console.error('Load pandit profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const updateProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const token = getAuthToken();
      if (!token) {
        showMessage('Please login again.', 'error');
        navigate('/');
        return;
      }
      const params = new URLSearchParams();
      if (form.fullName) params.append('full_name', form.fullName);
      if (form.phone) params.append('phone', form.phone);
      if (form.email !== '') params.append('email', form.email);
      if (form.experienceYears !== '') params.append('experience_years', form.experienceYears);
      if (form.bio) params.append('bio', form.bio);
      if (form.region) params.append('region', form.region);
      if (form.languages) params.append('languages', form.languages);
      if (form.pricePerService !== '') params.append('price_per_service', form.pricePerService);
      if (form.locationName) params.append('location_name', form.locationName);
      const response = await fetch(`${API_BASE_URL}/pandit/profile?${params.toString()}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update profile');
      }
      showMessage('Profile updated successfully!', 'success');
    } catch (error) {
      showMessage(error.message || 'Failed to update profile', 'error');
      console.error('Update profile error:', error);
    } finally {
      setSavingProfile(false);
    }
  };

  const updateLocation = async (event) => {
    event.preventDefault();
    if (!form.latitude || !form.longitude) {
      showMessage('Please enter latitude and longitude.', 'error');
      return;
    }
    setSavingLocation(true);
    try {
      const token = getAuthToken();
      if (!token) {
        showMessage('Please login again.', 'error');
        navigate('/');
        return;
      }
      const params = new URLSearchParams({
        latitude: form.latitude,
        longitude: form.longitude,
      });
      if (form.locationName) {
        params.append('location_name', form.locationName);
      }
      const response = await fetch(`${API_BASE_URL}/pandit/location?${params.toString()}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update location');
      }
      showMessage('Location updated successfully!', 'success');
    } catch (error) {
      showMessage(error.message || 'Failed to update location', 'error');
      console.error('Update location error:', error);
    } finally {
      setSavingLocation(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p className="loading">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-shell">
        <div className="page-header">
          <h2>My Profile</h2>
          <p>Keep your profile and location up to date for better visibility.</p>
        </div>

        {message.text ? (
          <div className={`message ${message.type}`}>{message.text}</div>
        ) : null}

        <section className="section">
          <div className="profile-card">
            <h3>Profile Details</h3>
            <form onSubmit={updateProfile}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="panditFullName">Full Name</label>
                  <input
                    id="panditFullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange('fullName')}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="panditPhone">Phone</label>
                  <input
                    id="panditPhone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="panditEmail">Email</label>
                  <input
                    id="panditEmail"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="panditExperience">Experience (years)</label>
                  <input
                    id="panditExperience"
                    type="number"
                    min="0"
                    value={form.experienceYears}
                    onChange={handleChange('experienceYears')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="panditBio">Bio</label>
                <textarea
                  id="panditBio"
                  rows="4"
                  value={form.bio}
                  onChange={handleChange('bio')}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="panditRegion">Region</label>
                  <input
                    id="panditRegion"
                    type="text"
                    value={form.region}
                    onChange={handleChange('region')}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="panditLanguages">Languages</label>
                  <input
                    id="panditLanguages"
                    type="text"
                    value={form.languages}
                    onChange={handleChange('languages')}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="panditPrice">Price per Service (Rs)</label>
                  <input
                    id="panditPrice"
                    type="number"
                    min="0"
                    value={form.pricePerService}
                    onChange={handleChange('pricePerService')}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="panditLocationName">Location Name</label>
                  <input
                    id="panditLocationName"
                    type="text"
                    value={form.locationName}
                    onChange={handleChange('locationName')}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="section">
          <div className="profile-card">
            <h3>Location & Coordinates</h3>
            <form onSubmit={updateLocation}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="panditLatitude">Latitude</label>
                  <input
                    id="panditLatitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange('latitude')}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="panditLongitude">Longitude</label>
                  <input
                    id="panditLongitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange('longitude')}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-secondary" disabled={savingLocation}>
                  {savingLocation ? 'Saving...' : 'Save Location'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (!navigator.geolocation) {
                      showMessage('Geolocation is not supported by this browser.', 'error');
                      return;
                    }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setForm((prev) => ({
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
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
