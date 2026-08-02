// Student dashboard: progress, scores, rank, badges, quick links
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../../components/ProgressBar';
import BadgeList from '../../components/BadgeList';

const ALL_LEVEL_KEYS = ['aptitude', 'dsa', 'programming', 'resume', 'interview'];

const StudentDashboard = () => {
  const { user, setUser } = useAuth();
  const [rank, setRank] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: me }, { data: leaderboard }, { data: apps }] = await Promise.all([
          api.get('/auth/me'),
          api.get('/leaderboard'),
          api.get('/applications/my'),
        ]);
        setUser((prev) => ({ ...prev, ...me }));
        const myRank = leaderboard.find((l) => l._id === me._id);
        setRank(myRank ? myRank.rank : null);
        setApplications(apps);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  const unlockedCount = user?.unlockedLevels?.length || 1;
  const progressPercent = Math.round((unlockedCount / ALL_LEVEL_KEYS.length) * 100);

  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome back, {user.name} 👋</h1>
        <p style={{ opacity: 0.9 }}>Keep learning, keep climbing the leaderboard, and land your dream job.</p>
      </div>

      <div className="grid grid-4 mb-3">
        <div className="card center">
          <div className="stat-pill">{user.points || 0}<span className="label">Total Points</span></div>
        </div>
        <div className="card center">
          <div className="stat-pill">{rank ? `#${rank}` : '--'}<span className="label">Leaderboard Rank</span></div>
        </div>
        <div className="card center">
          <div className="stat-pill">{unlockedCount}/{ALL_LEVEL_KEYS.length}<span className="label">Levels Unlocked</span></div>
        </div>
        <div className="card center">
          <div className="stat-pill">{applications.length}<span className="label">Jobs Applied</span></div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="section-title">📈 Overall Progress</h3>
          <ProgressBar percent={progressPercent} />
          <p className="subtle mt-1">{progressPercent}% of learning path completed</p>
          <Link to="/student/levels" className="btn btn-primary btn-sm mt-2">Continue Learning →</Link>
        </div>

        <div className="card">
          <h3 className="section-title">🏅 Your Badges</h3>
          <BadgeList badges={user.badges} />
        </div>
      </div>

      <div className="card mt-3">
        <div className="flex-between mb-2">
          <h3 className="section-title" style={{ margin: 0 }}>💼 Recent Applications</h3>
          <Link to="/student/jobs" className="btn btn-outline btn-sm">Browse Jobs</Link>
        </div>
        {applications.length === 0 ? (
          <p className="empty-state">You haven't applied to any jobs yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Job</th><th>Company</th><th>Match Score</th><th>Status</th></tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((a) => (
                  <tr key={a._id}>
                    <td>{a.job?.title}</td>
                    <td>{a.job?.companyName}</td>
                    <td>{a.matchScore}%</td>
                    <td><span className={`status-tag status-${a.status}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
