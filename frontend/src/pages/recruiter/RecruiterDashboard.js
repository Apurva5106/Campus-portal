// Recruiter dashboard: overview of posted jobs + quick access to applicants
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/my').then(({ data }) => setJobs(data)).finally(() => setLoading(false));
  }, []);

  const handleClose = async (id) => {
    await api.put(`/jobs/${id}/close`);
    setJobs((prev) => prev.map((j) => (j._id === id ? { ...j, isActive: false } : j)));
  };

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);
  const activeJobs = jobs.filter((j) => j.isActive).length;

  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome, {user.companyName || user.name} 👋</h1>
        <p style={{ opacity: 0.9 }}>Manage your job postings and discover great candidates with AI-powered matching.</p>
      </div>

      <div className="grid grid-3 mb-3">
        <div className="card center"><div className="stat-pill">{jobs.length}<span className="label">Total Jobs Posted</span></div></div>
        <div className="card center"><div className="stat-pill">{activeJobs}<span className="label">Active Jobs</span></div></div>
        <div className="card center"><div className="stat-pill">{totalApplicants}<span className="label">Total Applicants</span></div></div>
      </div>

      <div className="flex-between mb-2">
        <h3 className="section-title" style={{ margin: 0 }}>Your Job Postings</h3>
        <Link to="/recruiter/post-job" className="btn btn-primary btn-sm">+ Post New Job</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card empty-state">You haven't posted any jobs yet. Click "Post New Job" to get started.</div>
      ) : (
        <div className="grid grid-2">
          {jobs.map((job) => (
            <div className="card" key={job._id}>
              <div className="flex-between">
                <h3 style={{ margin: 0 }}>{job.title}</h3>
                <span className={`status-tag ${job.isActive ? 'status-shortlisted' : 'status-rejected'}`}>
                  {job.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              <p className="subtle">{job.location || 'Remote'} · {job.jobType}</p>
              <p className="subtle">👥 {job.applicantCount} applicant(s)</p>
              <div className="flex-gap mt-2">
                <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn btn-primary btn-sm">View Applicants</Link>
                {job.isActive && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleClose(job._id)}>Close Job</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
