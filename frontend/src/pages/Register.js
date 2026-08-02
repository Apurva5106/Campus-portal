// Registration page -- toggles between Student and Recruiter fields
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    college: '', branch: '', graduationYear: '', linkedin: '',
    companyName: '', companyDesignation: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register({ ...form, role });
      navigate(`/${data.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <h2>🚀 Create Account</h2>
        <div className="role-toggle">
          <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>Student</button>
          <button type="button" className={role === 'recruiter' ? 'active' : ''} onClick={() => setRole('recruiter')}>Recruiter</button>
        </div>
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" required value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} />
          </div>

          {role === 'student' && (
            <>
              <div className="form-group">
                <label>College</label>
                <input name="college" value={form.college} onChange={handleChange} />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Branch</label>
                  <input name="branch" value={form.branch} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Graduation Year</label>
                  <input type="number" name="graduationYear" value={form.graduationYear} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>LinkedIn Profile URL (visible to recruiters &amp; admin)</label>
                <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/your-name" />
              </div>
            </>
          )}

          {role === 'recruiter' && (
            <>
              <div className="form-group">
                <label>Company Name</label>
                <input name="companyName" value={form.companyName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Your Designation</label>
                <input name="companyDesignation" value={form.companyDesignation} onChange={handleChange} placeholder="e.g. HR Manager" />
              </div>
            </>
          )}

          <button className="btn btn-primary btn-block mt-1" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="center subtle mt-2">
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
