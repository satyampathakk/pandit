import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../api/config.js';
import { getAuthToken } from '../api/client.js';
import { useFlashMessage } from '../hooks/useFlashMessage.js';

const QUICK_SERVICES = [
  { name: 'Satyanarayan Puja', category: 'Puja', price: 2100, duration: 180 },
  { name: 'Griha Pravesh Puja', category: 'Puja', price: 3500, duration: 240 },
  { name: 'Ganesh Chaturthi Puja', category: 'Festival', price: 2500, duration: 120 },
  { name: 'Navratri Hawan', category: 'Hawan', price: 5100, duration: 300 },
  { name: 'Vivah Sanskar', category: 'Wedding', price: 11000, duration: 480 },
  { name: 'Namkaran Ceremony', category: 'Naming', price: 2100, duration: 90 },
  { name: 'Kundli Reading', category: 'Astrology', price: 1100, duration: 60 },
  { name: 'Rudrabhishek', category: 'Puja', price: 3100, duration: 150 },
  { name: 'Lakshmi Puja', category: 'Puja', price: 2100, duration: 120 },
  { name: 'Durga Puja', category: 'Festival', price: 5100, duration: 240 },
  { name: 'Shradh Ceremony', category: 'Ritual', price: 3500, duration: 180 },
  { name: 'Vastu Consultation', category: 'Astrology', price: 2100, duration: 90 },
];

export default function ManageServices() {
  const { message, showMessage } = useFlashMessage();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    basePrice: '',
    durationMinutes: '',
  });

  useEffect(() => {
    loadAllServices();
  }, []);

  const categories = useMemo(
    () => [
      'Puja',
      'Hawan',
      'Wedding',
      'Naming',
      'Astrology',
      'Festival',
      'Ritual',
      'Other',
    ],
    []
  );

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const loadAllServices = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/pandit/services`, {
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

  const addService = async (payload) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/pandit/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showMessage(`Service "${payload.name}" added successfully!`, 'success');
        setForm({ name: '', category: '', basePrice: '', durationMinutes: '' });
        loadAllServices();
      } else {
        const error = await response.json();
        showMessage(error.detail || 'Failed to add service.', 'error');
      }
    } catch (error) {
      showMessage('Network error. Please try again.', 'error');
      console.error('Add service error:', error);
    }
  };

  const handleAddService = async (event) => {
    event.preventDefault();
    await addService({
      name: form.name,
      category: form.category,
      base_price: parseFloat(form.basePrice),
      duration_minutes: parseInt(form.durationMinutes, 10),
    });
  };

  const addQuickService = async (quickService) => {
    await addService({
      name: quickService.name,
      category: quickService.category,
      base_price: quickService.price,
      duration_minutes: quickService.duration,
    });
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>Manage Services</h2>
        <p>Add and manage spiritual services offered on the platform</p>
      </div>

      {message.text ? (
        <div className={`message ${message.type}`}>{message.text}</div>
      ) : null}

      <div className="service-management">
        <div className="add-service-section">
          <h3>Add New Service</h3>
          <form onSubmit={handleAddService}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serviceName">Service Name *</label>
                <input
                  type="text"
                  id="serviceName"
                  placeholder="e.g., Griha Pravesh Puja"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="serviceCategory">Category *</label>
                <select
                  id="serviceCategory"
                  required
                  value={form.category}
                  onChange={handleChange('category')}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="basePrice">Base Price (Rs) *</label>
                <input
                  type="number"
                  id="basePrice"
                  min="0"
                  step="100"
                  placeholder="e.g., 2100"
                  required
                  value={form.basePrice}
                  onChange={handleChange('basePrice')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="durationMinutes">Duration (minutes) *</label>
                <input
                  type="number"
                  id="durationMinutes"
                  min="15"
                  step="15"
                  placeholder="e.g., 120"
                  required
                  value={form.durationMinutes}
                  onChange={handleChange('durationMinutes')}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Add Service
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setForm({ name: '', category: '', basePrice: '', durationMinutes: '' })}
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>

        <div className="quick-add-section">
          <h3>Quick Add - Popular Services</h3>
          <p className="help-text">Click to quickly add common services</p>
          <div className="quick-add-grid">
            {QUICK_SERVICES.map((service) => (
              <button
                key={`${service.name}-${service.category}`}
                type="button"
                className="quick-add-btn"
                onClick={() => addQuickService(service)}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>

        <div className="existing-services-section">
          <h3>Existing Services on Platform</h3>
          <button type="button" onClick={loadAllServices} className="btn btn-secondary">
            Refresh List
          </button>
          <div className="existing-services-list">
            {loading ? <p className="loading">Loading services...</p> : null}
            {!loading && services.length === 0 ? (
              <p className="no-results">No services found. Add some services above!</p>
            ) : null}
            {!loading && services.length > 0 ? (
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td>
                        <strong>{service.name}</strong>
                      </td>
                      <td>
                        <span className="category-badge">{service.category}</span>
                      </td>
                      <td>Rs {service.base_price}</td>
                      <td>{service.duration_minutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
