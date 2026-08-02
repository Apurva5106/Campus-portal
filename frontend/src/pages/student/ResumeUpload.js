// Resume upload page -- shows an instant AI-generated summary, score & suggestions
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Alert from '../../components/Alert';

const ScoreRing = ({ score }) => {
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{
      width: 120, height: 120, borderRadius: '50%', margin: '0 auto',
      background: `conic-gradient(${color} ${score * 3.6}deg, #eef0f7 0deg)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <strong style={{ fontSize: '1.6rem' }}>{score}</strong>
        <span className="subtle" style={{ fontSize: '0.7rem' }}>/ 100</span>
      </div>
    </div>
  );
};

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    api.get('/resume/me').then(({ data }) => setExisting(data)).catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please choose a resume file first.');
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setExisting(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="section-title">📄 Resume Upload & AI Analysis</h2>
      <p className="subtle mb-3">Upload your resume to get an instant AI-generated summary, quality score, and improvement suggestions. A resume upload is required before applying to any job.</p>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="section-title">Upload Resume</h3>
          <Alert type="error">{error}</Alert>
          {existing && !result && (
            <Alert type="info">
              You already have a resume on file: <strong>{existing.fileName}</strong> (score: {existing.qualityScore}/100). Uploading a new file will replace it.
            </Alert>
          )}
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label>Resume File (PDF, DOC, DOCX, TXT — max 5MB)</label>
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files[0])} />
            </div>
            <button className="btn btn-primary btn-block" disabled={uploading}>
              {uploading ? 'Analysing resume...' : 'Upload & Analyse'}
            </button>
          </form>
        </div>

        <div className="card center">
          <h3 className="section-title" style={{ justifyContent: 'center' }}>AI Resume Score</h3>
          <ScoreRing score={result ? result.qualityScore : (existing ? existing.qualityScore : 0)} />
          <p className="subtle mt-2">
            {(result || existing) ? 'Based on detected skills, experience, and structure' : 'Upload a resume to see your score'}
          </p>
        </div>
      </div>

      {(result || existing) && (
        <div className="grid grid-2 mt-3">
          <div className="card">
            <h3 className="section-title">🧠 Detected Skills</h3>
            <div className="flex-gap">
              {(result ? result.detectedSkills : existing.detectedSkills || []).length > 0
                ? (result ? result.detectedSkills : existing.detectedSkills).map((s) => <span key={s} className="badge">{s}</span>)
                : <p className="subtle">No specific skills detected -- try adding a clear "Skills" section.</p>
              }
            </div>
            {result?.summaryText && <p className="subtle mt-2">{result.summaryText}</p>}
          </div>

          <div className="card">
            <h3 className="section-title">💡 Suggestions to Improve</h3>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {(result ? result.suggestions : existing.suggestions || []).map((s, i) => (
                <li key={i} className="mb-1">{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
