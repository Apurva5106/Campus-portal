// Admin oversight of all job postings across all recruiters
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/jobs').then(({ data }) => setJobs(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    await api.put(`/admin/jobs/${id}/toggle`);
    load();
  };

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  return (
    <div className="container">
      <h2 className="section-title">💼 Manage Jobs</h2>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Title</th><th>Company</th><th>Recruiter</th><th>Applicants</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j._id}>
                <td>{j.title}</td>
                <td>{j.companyName}</td>
                <td>{j.recruiter?.name} ({j.recruiter?.email})</td>
                <td>{j.applicantCount}</td>
                <td><span className={`status-tag ${j.isActive ? 'status-shortlisted' : 'status-rejected'}`}>{j.isActive ? 'Active' : 'Closed'}</span></td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => toggle(j._id)}>
                    {j.isActive ? 'Close' : 'Reopen'}
                  </button>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && <tr><td colSpan={6} className="empty-state">No jobs posted yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageJobs;
