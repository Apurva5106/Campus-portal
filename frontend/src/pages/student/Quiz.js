// Renders a level's quiz, submits answers, shows result + points/badges earned
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Alert from '../../components/Alert';

const Quiz = () => {
  const { levelKey } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/levels/${levelKey}/quiz`)
      .then(({ data }) => setQuiz(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load quiz'));
  }, [levelKey]);

  const selectOption = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({ questionId, selectedOptionIndex })),
      };
      const { data } = await api.post(`/levels/${levelKey}/submit`, payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !quiz) return <div className="container"><Alert type="error">{error}</Alert></div>;
  if (!quiz) return <div className="center mt-3"><div className="spinner" /></div>;

  if (result) {
    return (
      <div className="container">
        <div className="card center" style={{ maxWidth: 500, margin: '40px auto' }}>
          <h2>{result.passed ? '🎉 Level Passed!' : '📚 Keep Practicing'}</h2>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{result.scorePercent}%</p>
          <p className="subtle">{result.correctCount}/{result.totalQuestions} correct · +{result.pointsEarned} points earned</p>
          {result.newBadges?.length > 0 && (
            <div className="mt-2">
              <p className="subtle">New badges unlocked:</p>
              <div className="flex-gap center" style={{ justifyContent: 'center' }}>
                {result.newBadges.map((b) => <span key={b} className="badge">{b}</span>)}
              </div>
            </div>
          )}
          <div className="flex-gap mt-3" style={{ justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate('/student/levels')}>Back to Levels</button>
            <button className="btn btn-primary" onClick={() => navigate('/student')}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="section-title">{quiz.title} Quiz</h2>
      <Alert type="error">{error}</Alert>
      {quiz.questions.map((q, idx) => (
        <div className="card mb-2" key={q._id}>
          <p style={{ fontWeight: 600 }}>{idx + 1}. {q.questionText}</p>
          <div className="grid grid-2">
            {q.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                type="button"
                className={`btn ${answers[q._id] === oIdx ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => selectOption(q._id, oIdx)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        className="btn btn-success btn-block mt-2"
        disabled={submitting || Object.keys(answers).length < quiz.questions.length}
        onClick={handleSubmit}
      >
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
};

export default Quiz;
