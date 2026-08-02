// Admin manages the Placement History: add / edit / delete placed students,
// including a LinkedIn profile link column.
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Alert from '../../components/Alert';

const emptyForm = {
  studentName: '', college: '', branch: '', graduationYear: '',
  companyName: '', role: '', package: '', linkedin: '', placementYear: new Date().getFullYear(),
};

const PlacedStudents = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/placed').then(({ data }) => setRecords(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const flashSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 2500); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/admin/placed/${editingId}`, form);
        flashSuccess('Placed student record updated.');
      } else {
        await api.post('/admin/placed', form);
        flashSuccess('Placed student record added.');
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving record');
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({
      studentName: r.studentName, college: r.college, branch: r.branch || '',
      graduationYear: r.graduationYear || '', companyName: r.companyName, role: r.role,
      package: r.package || '', linkedin: r.linkedin || '', placementYear: r.placementYear,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this placement record?')) return;
    await api.delete(`/admin/placed/${id}`);
    load();
  };

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  return (
    <div className="container">
      <h2 className="section-title">🎓 Placement History Management</h2>

      <div className="card mb-3">
        <h3 className="section-title">{editingId ? 'Edit Placed Student' : 'Add Placed Student'}</h3>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-3">
            <div className="form-group">
              <label>Student Name</label>
              <input name="studentName" required value={form.studentName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>College</label>
              <input name="college" required value={form.college} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Branch</label>
              <input name="branch" value={form.branch} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Graduation Year</label>
              <input type="number" name="graduationYear" value={form.graduationYear} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input name="companyName" required value={form.companyName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input name="role" required value={form.role} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Package (e.g. 8 LPA)</label>
              <input name="package" value={form.package} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Placement Year</label>
              <input type="number" name="placementYear" required value={form.placementYear} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>LinkedIn Profile Link</label>
              <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
          <div className="flex-gap">
            <button className="btn btn-primary">{editingId ? 'Update Record' : 'Add Record'}</button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>College</th><th>Branch</th><th>Company</th><th>Role</th>
              <th>Package</th><th>Year</th><th>LinkedIn</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.studentName}</td>
                <td>{r.college}</td>
                <td>{r.branch || '--'}</td>
                <td>{r.companyName}</td>
                <td>{r.role}</td>
                <td>{r.package || '--'}</td>
                <td>{r.placementYear}</td>
                <td>{r.linkedin ? <a href={r.linkedin} target="_blank" rel="noreferrer">Profile ↗</a> : '--'}</td>
                <td>
                  <div className="flex-gap">
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(r)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(r._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={9} className="empty-state">No placement records yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlacedStudents;
