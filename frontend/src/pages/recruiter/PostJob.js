// Recruiter posts a new job listing
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Alert from '../../components/Alert';
import { useAuth } from '../../context/AuthContext';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', companyName: user.companyName || '', description: '',
    location: '', salaryRange: '', jobType: 'full-time', minResumeScore: 0,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/jobs', form);
      navigate('/recruiter');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h2 className="section-title">📢 Post a New Job</h2>
      <div className="card" style={{ maxWidth: 700 }}>
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Job Title</label>
              <input name="title" required value={form.title} onChange={handleChange} placeholder="e.g. Frontend Developer" />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input name="companyName" required value={form.companyName} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Job Description (include required skills -- used for AI matching)</label>
            <textarea name="description" required rows={6} value={form.description} onChange={handleChange}
              placeholder="e.g. Looking for a developer skilled in React, JavaScript, MongoDB, REST API, Git..." />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Pune / Remote" />
            </div>
            <div className="form-group">
              <label>Salary Range</label>
              <input name="salaryRange" value={form.salaryRange} onChange={handleChange} placeholder="e.g. 6-8 LPA" />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Job Type</label>
              <select name="jobType" value={form.jobType} onChange={handleChange}>
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="part-time">Part-time</option>
              </select>
            </div>
            <div className="form-group">
              <label>Minimum AI Match Score to Apply (optional)</label>
              <input type="number" min="0" max="100" name="minResumeScore" value={form.minResumeScore} onChange={handleChange} />
            </div>
          </div>

          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
