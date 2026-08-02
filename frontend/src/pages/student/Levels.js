// Shows all gamified levels with lock/unlock status; links into each quiz
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LEVEL_ICONS = {
  aptitude: '🧮', dsa: '🧩', programming: '💻', resume: '📄', interview: '🎤',
};

const Levels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/levels').then(({ data }) => setLevels(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;

  return (
    <div className="container">
      <h2 className="section-title">🎮 Gamified Learning Levels</h2>
      <p className="subtle mb-3">Complete each level's quiz to earn points, badges, and unlock the next challenge.</p>

      <div className="grid grid-3">
        {levels.map((lvl) => (
          <div
            key={lvl.key}
            className={`card ${lvl.isUnlocked ? 'clickable' : ''}`}
            style={{ opacity: lvl.isUnlocked ? 1 : 0.6 }}
            onClick={() => lvl.isUnlocked && navigate(`/student/levels/${lvl.key}`)}
          >
            <div style={{ fontSize: '2rem' }}>{LEVEL_ICONS[lvl.key] || '🎯'}</div>
            <h3 style={{ margin: '10px 0 4px' }}>{lvl.title}</h3>
            <p className="subtle">{lvl.description}</p>
            <p className="subtle">{lvl.totalQuestions} questions · Pass at {lvl.passingScore}%</p>
            {lvl.isUnlocked ? (
              <span className="badge mt-1">Unlocked</span>
            ) : (
              <span className="badge badge-lock mt-1">🔒 Locked</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Levels;
