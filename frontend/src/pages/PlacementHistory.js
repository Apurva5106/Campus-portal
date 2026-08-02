// Read-only college placement history section, visible to students & recruiters
import React, { useEffect, useState } from 'react';
import api from '../services/api';

const PlacementHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('');

  const load = (year) => {
    setLoading(true);
    api.get('/placed', { params: year ? { year } : {} }).then(({ data }) => setRecords(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const years = Array.from(new Set(records.map((r) => r.placementYear))).sort((a, b) => b - a);

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  return (
    <div className="container">
      <h2 className="section-title">🎓 College Placement History</h2>
      <div className="flex-gap mb-2">
        <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); load(e.target.value); }} style={{ maxWidth: 200 }}>
          <option value="">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>College</th><th>Company</th><th>Role</th><th>Package</th><th>Year</th><th>LinkedIn</th></tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.studentName}</td>
                <td>{r.college}</td>
                <td>{r.companyName}</td>
                <td>{r.role}</td>
                <td>{r.package || '--'}</td>
                <td>{r.placementYear}</td>
                <td>{r.linkedin ? <a href={r.linkedin} target="_blank" rel="noreferrer">Profile ↗</a> : '--'}</td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={7} className="empty-state">No placement records available yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlacementHistory;
