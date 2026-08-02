// Global leaderboard ranked by points
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard').then(({ data }) => setRows(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  const medal = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank);

  return (
    <div className="container">
      <h2 className="section-title">🏆 Leaderboard</h2>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Rank</th><th>Name</th><th>College</th><th>Points</th><th>Badges</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} style={{ background: r._id === user._id ? '#f0edfe' : undefined }}>
                <td>{medal(r.rank)}</td>
                <td>{r.name}{r._id === user._id && <span className="subtle"> (you)</span>}</td>
                <td>{r.college || '--'}</td>
                <td style={{ fontWeight: 700 }}>{r.points}</td>
                <td>{r.badgeCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
