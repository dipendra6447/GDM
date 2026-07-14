import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  colorScheme: 'blue' | 'orange' | 'green' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorScheme }) => {
  return (
    <div className={`dashboard-stat-card bg-${colorScheme}`}>
      <div className="stat-card-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="stat-card-info">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
