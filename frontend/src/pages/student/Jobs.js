// Students browse jobs and apply. Applying requires a resume already on file.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Alert from '../../components/Alert';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [matchResults, setMatchResults] = useState({});

  const loadJobs = () => {
    setLoading(true);
    api.get('/jobs').then(({ data }) => setJobs(data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadJobs(); }, []);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.post(`/applications/${jobId}`);
      setMatchResults((prev) => ({ ...prev, [jobId]: data.application.matchScore }));
      setMessage({ type: 'success', text: `Applied successfully! AI match score: ${data.application.matchScore}%` });
      loadJobs();
    } catch (err) {
      const data = err.response?.data;
      if (data?.requireResumeUpload) {
        setMessage({ type: 'error', text: 'You must upload your resume before applying. Redirecting you to Resume Upload...' });
      } else {
        setMessage({ type: 'error', text: data?.message || 'Failed to apply' });
      }
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  return (
    <div className="container">
      <div className="flex-between mb-2">
        <h2 className="section-title" style={{ margin: 0 }}>💼 Available Jobs</h2>
        <Link to="/student/resume" className="btn btn-outline btn-sm">Manage Resume</Link>
      </div>
      {message.text && (
        <Alert type={message.type}>
          {message.text}{' '}
          {message.type === 'error' && message.text.includes('upload') && (
            <Link to="/student/resume" style={{ fontWeight: 700, color: 'inherit', textDecoration: 'underline' }}>Upload now</Link>
          )}
        </Alert>
      )}

      {jobs.length === 0 ? (
        <div className="card empty-state">No jobs posted yet. Check back soon!</div>
      ) : (
        <div className="grid grid-2">
          {jobs.map((job) => (
            <div className="card" key={job._id}>
              <div className="flex-between">
                <h3 style={{ margin: 0 }}>{job.title}</h3>
                <span className="badge">{job.jobType}</span>
              </div>
              <p className="subtle mb-1">{job.companyName} {job.location ? `· ${job.location}` : ''}</p>
              <p style={{ fontSize: '0.9rem' }}>{job.description.slice(0, 160)}{job.description.length > 160 ? '...' : ''}</p>
              {job.requiredSkills?.length > 0 && (
                <div className="flex-gap mb-2">
                  {job.requiredSkills.slice(0, 6).map((s) => <span key={s} className="badge">{s}</span>)}
                </div>
              )}
              {job.salaryRange && <p className="subtle">💰 {job.salaryRange}</p>}
              {matchResults[job._id] && <p className="subtle">Your match score: <strong>{matchResults[job._id]}%</strong></p>}

              {job.alreadyApplied ? (
                <button className="btn btn-outline btn-block" disabled>✓ Already Applied</button>
              ) : (
                <button
                  className="btn btn-primary btn-block"
                  disabled={applyingId === job._id}
                  onClick={() => handleApply(job._id)}
                >
                  {applyingId === job._id ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
