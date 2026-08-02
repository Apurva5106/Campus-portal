// Admin overview dashboard
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, recruiters: 0, jobs: 0, placed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: students }, { data: recruiters }, { data: jobs }, { data: placed }] = await Promise.all([
          api.get('/admin/students'),
          api.get('/admin/recruiters'),
          api.get('/admin/jobs'),
          api.get('/placed'),
        ]);
        setStats({ students: students.length, recruiters: recruiters.length, jobs: jobs.length, placed: placed.length });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  return (
    <div className="container">
      <div className="hero">
        <h1>Admin Control Center ⚙️</h1>
        <p style={{ opacity: 0.9 }}>Welcome, {user.name}. Manage students, recruiters, learning levels, jobs, and placement history.</p>
      </div>

      <div className="grid grid-4 mb-3">
        <div className="card center"><div className="stat-pill">{stats.students}<span className="label">Students</span></div></div>
        <div className="card center"><div className="stat-pill">{stats.recruiters}<span className="label">Recruiters</span></div></div>
        <div className="card center"><div className="stat-pill">{stats.jobs}<span className="label">Job Postings</span></div></div>
        <div className="card center"><div className="stat-pill">{stats.placed}<span className="label">Placed Students</span></div></div>
      </div>

      <div className="grid grid-3">
        <Link to="/admin/students" className="card clickable">
          <h3>👨‍🎓 Manage Students</h3>
          <p className="subtle">View progress, points, activate/deactivate accounts</p>
        </Link>
        <Link to="/admin/recruiters" className="card clickable">
          <h3>🏢 Manage Recruiters</h3>
          <p className="subtle">View company details and job activity</p>
        </Link>
        <Link to="/admin/levels" className="card clickable">
          <h3>🎮 Manage Levels & Questions</h3>
          <p className="subtle">Edit quiz levels, add/edit/delete questions</p>
        </Link>
        <Link to="/admin/jobs" className="card clickable">
          <h3>💼 Manage Jobs</h3>
          <p className="subtle">Oversee all job postings across recruiters</p>
        </Link>
        <Link to="/admin/placed" className="card clickable">
          <h3>🎓 Placement History</h3>
          <p className="subtle">Add/edit placed students, including LinkedIn links</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
