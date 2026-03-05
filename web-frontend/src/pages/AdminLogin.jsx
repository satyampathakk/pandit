import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config.js';
import { useFlashMessage } from '../hooks/useFlashMessage.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { message, showMessage, clearMessage } = useFlashMessage();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('user_type');
    if (token && userType === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (field) => (event) => {
    clearMessage();
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user_type', data.user_type);
        showMessage('Welcome back, admin.', 'success');
        setTimeout(() => navigate('/admin/dashboard'), 600);
      } else {
        const error = await response.json();
        showMessage(error.detail || 'Admin login failed.', 'error');
      }
    } catch (error) {
      showMessage('Network error. Please try again.', 'error');
      console.error('Admin login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container admin-auth">
        <h1>Admin Console</h1>
        <p className="subtitle">Secure access for platform management</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          <div className="form-group">
            <label htmlFor="adminUsername">Username</label>
            <input
              id="adminUsername"
              type="text"
              required
              value={form.username}
              onChange={handleChange('username')}
              placeholder="Enter admin username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="adminPassword">Password</label>
            <input
              id="adminPassword"
              type="password"
              required
              value={form.password}
              onChange={handleChange('password')}
              placeholder="Enter admin password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {message.text ? (
          <div className={`message ${message.type}`}>{message.text}</div>
        ) : null}
      </div>
    </div>
  );
}
