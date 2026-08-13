// ===========================
// Card thống kê dùng chung trên dashboard
// ===========================

import React from 'react';
import './StatsCard.css';

const StatsCard = ({ icon, label, value, sub, trend, color = 'green' }) => {
  const isUp = trend > 0;
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__icon-wrap">
        <span className="stats-card__icon">{icon}</span>
      </div>
      <div className="stats-card__body">
        <div className="stats-card__value">{value}</div>
        <div className="stats-card__label">{label}</div>
        {sub && <div className="stats-card__sub">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`stats-card__trend ${isUp ? 'up' : 'down'}`}>
          {isUp ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

export default StatsCard;
