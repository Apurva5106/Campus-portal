// Recruiter view of all applicants for a job, sorted by AI match score,
// including full student profile info + resume + LinkedIn, and status controls.
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const Applicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = () => {
    setLoading(true);
    api.get(`/applications/job/${jobId}`).then(({ data }) => setApplicants(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [jobId]);

  const updateStatus = async (id, status) => {
    await api.put(`/applications/${id}/status`, { status });
    setApplicants((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
  };

  // Resumes are private files -- fetched with the auth token attached (via the
  // api interceptor) as a blob, then opened in a new tab. A plain <a href="/uploads/...">
  // link does NOT work here: it isn't authenticated, and in development it gets
  // swallowed by the React dev server instead of reaching the backend.
  const [resumeLoadingId, setResumeLoadingId] = useState(null);
  const viewResume = async (applicationId) => {
    setResumeLoadingId(applicationId);
    try {
      const response = await api.get(`/applications/${applicationId}/resume`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(response.data);
      window.open(blobUrl, '_blank');
    } catch (err) {
      alert('Could not load this resume. It may have been removed from the server.');
    } finally {
      setResumeLoadingId(null);
    }
  };

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'applied', label: 'Applied' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'hired', label: 'Hired' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const filteredApplicants = statusFilter === 'all'
    ? applicants
    : applicants.filter((a) => a.status === statusFilter);

  const countFor = (key) => (key === 'all' ? applicants.length : applicants.filter((a) => a.status === key).length);

  return (
    <div className="container">
      <h2 className="section-title">👥 Applicants (Ranked by AI Match Score)</h2>

      <div className="tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`tab ${statusFilter === f.key ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label} ({countFor(f.key)})
          </button>
        ))}
      </div>

      {filteredApplicants.length === 0 ? (
        <div className="card empty-state">
          {applicants.length === 0 ? 'No applicants yet for this job.' : `No applicants with status "${statusFilter}".`}
        </div>
      ) : (
        <div className="grid" style={{ gap: 16 }}>
          {filteredApplicants.map((a) => (
            <div className="card" key={a._id}>
              <div className="flex-between">
                <div>
                  <h3 style={{ margin: 0 }}>{a.studentSnapshot.name}</h3>
                  <p className="subtle">{a.studentSnapshot.email} · {a.studentSnapshot.college}</p>
                </div>
                <div className="center">
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{a.matchScore}%</div>
                  <span className="subtle" style={{ fontSize: '0.72rem' }}>AI Match</span>
                </div>
              </div>

              <div className="flex-gap mt-2">
                <span className={`status-tag status-${a.status}`}>{a.status}</span>
                {a.studentSnapshot.linkedin && (
                  <a href={a.studentSnapshot.linkedin} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">🔗 LinkedIn</a>
                )}
                {a.resumeSnapshot?.filePath && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={resumeLoadingId === a._id}
                    onClick={() => viewResume(a._id)}
                  >
                    {resumeLoadingId === a._id ? 'Loading...' : '📄 View Resume'}
                  </button>
                )}
                <button className="btn btn-sm" onClick={() => setExpanded(expanded === a._id ? null : a._id)}>
                  {expanded === a._id ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {expanded === a._id && (
                <div className="mt-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <p><strong>Branch:</strong> {a.studentSnapshot.branch || '--'} &nbsp; <strong>Graduation Year:</strong> {a.studentSnapshot.graduationYear || '--'}</p>
                  <p><strong>Gamification Points:</strong> {a.studentSnapshot.points ?? 0}</p>
                  <p><strong>Matched Skills:</strong></p>
                  <div className="flex-gap mb-1">
                    {a.matchedSkills.length ? a.matchedSkills.map((s) => <span key={s} className="badge">{s}</span>) : <span className="subtle">None detected</span>}
                  </div>
                  <p><strong>Missing Skills:</strong></p>
                  <div className="flex-gap">
                    {a.missingSkills.length ? a.missingSkills.map((s) => <span key={s} className="badge badge-lock">{s}</span>) : <span className="subtle">None -- great fit!</span>}
                  </div>
                </div>
              )}

              <div className="flex-gap mt-2">
                <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(a._id, 'shortlisted')}>Shortlist</button>
                <button className="btn btn-success btn-sm" onClick={() => updateStatus(a._id, 'hired')}>Mark Hired</button>
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a._id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applicants;
