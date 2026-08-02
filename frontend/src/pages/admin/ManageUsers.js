// Shared admin page for viewing/managing Students and Recruiters (mode prop decides which)
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ManageUsers = ({ mode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const endpoint = mode === 'students' ? '/admin/students' : '/admin/recruiters';

  const load = () => {
    setLoading(true);
    api.get(endpoint).then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [mode]);

  const toggleActive = async (id) => {
    await api.put(`/admin/users/${id}/toggle-active`);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  return (
    <div className="container">
      <h2 className="section-title">{mode === 'students' ? '👨‍🎓 Manage Students' : '🏢 Manage Recruiters'}</h2>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th>
              {mode === 'students' ? (
                <>
                  <th>College</th><th>Points</th><th>Levels Unlocked</th><th>LinkedIn</th>
                </>
              ) : (
                <>
                  <th>Company</th><th>Designation</th><th>Jobs Posted</th>
                </>
              )}
              <th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                {mode === 'students' ? (
                  <>
                    <td>{u.college || '--'}</td>
                    <td>{u.points}</td>
                    <td>{u.unlockedLevels?.length}/5</td>
                    <td>{u.linkedin ? <a href={u.linkedin} target="_blank" rel="noreferrer">View</a> : '--'}</td>
                  </>
                ) : (
                  <>
                    <td>{u.companyName || '--'}</td>
                    <td>{u.companyDesignation || '--'}</td>
                    <td>{u.jobCount}</td>
                  </>
                )}
                <td>
                  <span className={`status-tag ${u.isActive ? 'status-shortlisted' : 'status-rejected'}`}>
                    {u.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td>
                  <div className="flex-gap">
                    <button className="btn btn-outline btn-sm" onClick={() => toggleActive(u._id)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(u._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={7} className="empty-state">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
