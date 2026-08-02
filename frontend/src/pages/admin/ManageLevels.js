// Admin manages Levels (edit metadata) and Questions (add/edit/delete) per level
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Alert from '../../components/Alert';

const emptyQuestion = { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 10 };

const ManageLevels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLevelId, setActiveLevelId] = useState(null);
  const [newQuestion, setNewQuestion] = useState(emptyQuestion);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/levels').then(({ data }) => setLevels(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const activeLevel = levels.find((l) => l._id === activeLevelId);

  const flashSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 2500); };

  const toggleLevelActive = async (level) => {
    await api.put(`/admin/levels/${level._id}`, { isActive: !level.isActive });
    load();
  };

  const updatePassingScore = async (level, value) => {
    await api.put(`/admin/levels/${level._id}`, { passingScore: Number(value) });
    load();
  };

  const handleQuestionOptionChange = (idx, value) => {
    const opts = [...newQuestion.options];
    opts[idx] = value;
    setNewQuestion({ ...newQuestion, options: opts });
  };

  const submitQuestion = async () => {
    setError('');
    if (!newQuestion.questionText.trim() || newQuestion.options.some((o) => !o.trim())) {
      return setError('Please fill in the question text and all 4 options.');
    }
    try {
      if (editingQuestionId) {
        await api.put(`/admin/levels/${activeLevelId}/questions/${editingQuestionId}`, newQuestion);
        flashSuccess('Question updated successfully.');
      } else {
        await api.post(`/admin/levels/${activeLevelId}/questions`, newQuestion);
        flashSuccess('Question added successfully.');
      }
      setNewQuestion(emptyQuestion);
      setEditingQuestionId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving question');
    }
  };

  const startEditQuestion = (q) => {
    setEditingQuestionId(q._id);
    setNewQuestion({ questionText: q.questionText, options: [...q.options], correctOptionIndex: q.correctOptionIndex, points: q.points });
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    await api.delete(`/admin/levels/${activeLevelId}/questions/${questionId}`);
    load();
  };

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  return (
    <div className="container">
      <h2 className="section-title">🎮 Manage Levels & Questions</h2>

      <div className="grid grid-3 mb-3">
        {levels.map((lvl) => (
          <div key={lvl._id} className={`card ${activeLevelId === lvl._id ? '' : 'clickable'}`}
               onClick={() => { setActiveLevelId(lvl._id); setEditingQuestionId(null); setNewQuestion(emptyQuestion); }}
               style={{ border: activeLevelId === lvl._id ? '2px solid var(--primary)' : undefined }}>
            <div className="flex-between">
              <h3 style={{ margin: 0 }}>{lvl.title}</h3>
              <span className={`status-tag ${lvl.isActive ? 'status-shortlisted' : 'status-rejected'}`}>{lvl.isActive ? 'Active' : 'Hidden'}</span>
            </div>
            <p className="subtle">{lvl.questions.length} questions · Order {lvl.order}</p>
            <div className="flex-gap mt-1" onClick={(e) => e.stopPropagation()}>
              <label className="subtle">Pass %:</label>
              <input type="number" style={{ width: 70 }} defaultValue={lvl.passingScore}
                     onBlur={(e) => updatePassingScore(lvl, e.target.value)} />
              <button className="btn btn-outline btn-sm" onClick={() => toggleLevelActive(lvl)}>
                {lvl.isActive ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeLevel && (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="section-title">Questions in "{activeLevel.title}"</h3>
            {activeLevel.questions.length === 0 && <p className="empty-state">No questions yet -- add one on the right.</p>}
            {activeLevel.questions.map((q) => (
              <div key={q._id} className="mb-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                <p style={{ fontWeight: 600, margin: '4px 0' }}>{q.questionText}</p>
                <ul style={{ margin: '4px 0', paddingLeft: 18 }}>
                  {q.options.map((o, i) => (
                    <li key={i} style={{ color: i === q.correctOptionIndex ? 'var(--success)' : undefined, fontWeight: i === q.correctOptionIndex ? 700 : 400 }}>
                      {o} {i === q.correctOptionIndex && '✓'}
                    </li>
                  ))}
                </ul>
                <div className="flex-gap">
                  <button className="btn btn-outline btn-sm" onClick={() => startEditQuestion(q)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteQuestion(q._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="section-title">{editingQuestionId ? 'Edit Question' : 'Add New Question'}</h3>
            <Alert type="error">{error}</Alert>
            <Alert type="success">{success}</Alert>
            <div className="form-group">
              <label>Question Text</label>
              <textarea rows={2} value={newQuestion.questionText}
                        onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })} />
            </div>
            {newQuestion.options.map((opt, idx) => (
              <div className="form-group" key={idx}>
                <label>
                  Option {idx + 1}
                  <input type="radio" name="correct" style={{ width: 'auto', marginLeft: 10 }}
                         checked={newQuestion.correctOptionIndex === idx}
                         onChange={() => setNewQuestion({ ...newQuestion, correctOptionIndex: idx })} />
                  <span className="subtle" style={{ marginLeft: 4 }}>correct answer</span>
                </label>
                <input value={opt} onChange={(e) => handleQuestionOptionChange(idx, e.target.value)} />
              </div>
            ))}
            <div className="form-group">
              <label>Points for correct answer</label>
              <input type="number" value={newQuestion.points}
                     onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })} />
            </div>
            <div className="flex-gap">
              <button className="btn btn-primary" onClick={submitQuestion}>
                {editingQuestionId ? 'Update Question' : 'Add Question'}
              </button>
              {editingQuestionId && (
                <button className="btn btn-outline" onClick={() => { setEditingQuestionId(null); setNewQuestion(emptyQuestion); }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLevels;
