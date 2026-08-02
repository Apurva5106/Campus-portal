import React from 'react';

const BADGE_LABELS = {
  '500-club': '🏆 500 Points Club',
};

const formatBadge = (badge) => {
  if (BADGE_LABELS[badge]) return BADGE_LABELS[badge];
  if (badge.endsWith('-champion')) return `🥇 ${badge.replace('-champion', '')} Champion`;
  if (badge.endsWith('-perfect-score')) return `💯 ${badge.replace('-perfect-score', '')} Perfect Score`;
  return badge;
};

const BadgeList = ({ badges = [] }) => {
  if (!badges.length) return <p className="subtle">No badges earned yet -- complete quizzes to earn your first one!</p>;
  return (
    <div className="flex-gap">
      {badges.map((b) => (
        <span key={b} className="badge">{formatBadge(b)}</span>
      ))}
    </div>
  );
};

export default BadgeList;
