'use client';

import { useEffect, useRef } from 'react';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { IconType } from 'react-icons';
import './StatCard.css';

interface StatCardProps {
  icon?: IconType;
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  color?: 'blue' | 'purple' | 'cyan' | 'green' | 'orange' | 'red';
  progress?: number;
}

export default function StatCard({ 
  icon: Icon, title, value, change, positive = true, color = 'blue', progress = 0 
}: StatCardProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-header">
        <div className={`stat-card-icon ${color}`}>
          {Icon && <Icon />}
        </div>
        {change && (
          <span className={`stat-card-change ${positive ? 'positive' : 'negative'}`}>
            {positive ? <MdTrendingUp /> : <MdTrendingDown />}
            {change}
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{title}</div>
      {progress > 0 && (
        <div className="stat-card-progress">
          <div
            ref={progressRef}
            className={`stat-card-progress-bar ${color}`}
            style={{ width: 0 }}
          />
        </div>
      )}
    </div>
  );
}
