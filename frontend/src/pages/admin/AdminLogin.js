// Secure Admin login -- requires email + password + a shared secret key
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/Alert';

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', secretKey: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(form.email, form.password, form.secretKey);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: 'linear-gradient(135deg, #2d3436, #636e72)' }}>
      <div className="auth-card">
        <h2>🔐 Admin Login</h2>
        <p className="subtle center mb-2">Restricted access -- requires the platform's Admin Secret Key</p>
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" required value={form.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Admin Secret Key</label>
            <input type="password" name="secretKey" required value={form.secretKey} onChange={handleChange} placeholder="Provided by system owner" />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Verifying...' : 'Login as Admin'}
          </button>
        </form>
        <p className="center subtle mt-2">
          <Link to="/login" style={{ color: 'var(--text-muted)' }}>← Back to regular login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
