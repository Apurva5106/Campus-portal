// Top navigation bar -- links change based on logged-in user's role
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linksByRole = {
    student: [
      { to: '/student', label: 'Dashboard' },
      { to: '/student/levels', label: 'Levels' },
      { to: '/student/leaderboard', label: 'Leaderboard' },
      { to: '/student/jobs', label: 'Jobs' },
      { to: '/student/resume', label: 'Resume' },
      { to: '/placements', label: 'Placements' },
    ],
    recruiter: [
      { to: '/recruiter', label: 'Dashboard' },
      { to: '/recruiter/post-job', label: 'Post a Job' },
    ],
    admin: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/students', label: 'Students' },
      { to: '/admin/recruiters', label: 'Recruiters' },
      { to: '/admin/levels', label: 'Levels' },
      { to: '/admin/jobs', label: 'Jobs' },
      { to: '/admin/placed', label: 'Placed Students' },
    ],
  };

  const links = linksByRole[user.role] || [];

  return (
    <nav className="navbar">
      <div className="brand">🎓 CampusLaunch</div>
      <div className="nav-links">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}
        <span className="user-pill">👤 {user.name} · {user.role}</span>
        <button className="nav-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
