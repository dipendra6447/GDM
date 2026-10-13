"use client";
import React from 'react';

interface MetricItem {
  id: string;
  title: string;
  val: string | number;
  growth: string;
  period: string;
  icon: string;
  iconClass: 'icon-box-blue' | 'icon-box-purple' | 'icon-box-pink' | 'icon-box-violet';
}

interface DashboardStatMetricsProps {
  role?: 1 | 2 | 3;
  customMetrics?: MetricItem[];
}

export default function DashboardStatMetrics({ role = 1, customMetrics }: DashboardStatMetricsProps) {
  const isEmployer = role === 2;
  const isBusiness = role === 3;

  const defaultMetrics: MetricItem[] = isEmployer
    ? [
        {
          id: 'emp-jobs',
          title: 'Active Job Posts',
          val: '18',
          growth: '↑ 15%',
          period: 'This month',
          icon: 'bi-briefcase-fill',
          iconClass: 'icon-box-blue',
        },
        {
          id: 'emp-applicants',
          title: 'Total Applicants',
          val: '132',
          growth: '↑ 24%',
          period: 'This month',
          icon: 'bi-people-fill',
          iconClass: 'icon-box-purple',
        },
        {
          id: 'emp-matches',
          title: 'Candidate Matches',
          val: '56',
          growth: '↑ 18%',
          period: 'This month',
          icon: 'bi-search',
          iconClass: 'icon-box-pink',
        },
        {
          id: 'emp-messages',
          title: 'Messages',
          val: '12',
          growth: '↑ 33%',
          period: 'This month',
          icon: 'bi-chat-dots-fill',
          iconClass: 'icon-box-violet',
        },
      ]
    : isBusiness
    ? [
        {
          id: 'biz-impressions',
          title: 'Campaign Impressions',
          val: '2,450',
          growth: '↑ 38%',
          period: 'This month',
          icon: 'bi-eye-fill',
          iconClass: 'icon-box-blue',
        },
        {
          id: 'biz-clicks',
          title: 'Ad Clicks',
          val: '132',
          growth: '↑ 21%',
          period: 'This month',
          icon: 'bi-cursor-fill',
          iconClass: 'icon-box-purple',
        },
        {
          id: 'biz-leads',
          title: 'Customer Leads',
          val: '56',
          growth: '↑ 24%',
          period: 'This month',
          icon: 'bi-bullseye',
          iconClass: 'icon-box-pink',
        },
        {
          id: 'biz-inquiries',
          title: 'Inquiries',
          val: '12',
          growth: '↑ 33%',
          period: 'This month',
          icon: 'bi-chat-dots-fill',
          iconClass: 'icon-box-violet',
        },
      ]
    : [
        {
          id: 'js-views',
          title: 'Profile Views',
          val: '245',
          growth: '↑ 28%',
          period: 'This month',
          icon: 'bi-eye-fill',
          iconClass: 'icon-box-blue',
        },
        {
          id: 'js-connections',
          title: 'Profile Connections',
          val: '132',
          growth: '↑ 18%',
          period: 'This month',
          icon: 'bi-people-fill',
          iconClass: 'icon-box-purple',
        },
        {
          id: 'js-matches',
          title: 'Job Matches',
          val: '56',
          growth: '↑ 24%',
          period: 'This month',
          icon: 'bi-briefcase-fill',
          iconClass: 'icon-box-pink',
        },
        {
          id: 'js-messages',
          title: 'Messages',
          val: '12',
          growth: '↑ 33%',
          period: 'This month',
          icon: 'bi-chat-dots-fill',
          iconClass: 'icon-box-violet',
        },
      ];

  const items = customMetrics || defaultMetrics;

  return (
    <div className="dash-metrics-grid" aria-label="Key Performance Indicators">
      {items.map((m) => (
        <div key={m.id} className="dash-metric-card" id={`dash-metric-${m.id}`}>
          <div className="dash-metric-top">
            <div className={`dash-metric-icon-box ${m.iconClass}`}>
              <i className={`bi ${m.icon}`} />
            </div>
            <span className="dash-metric-title">{m.title}</span>
          </div>

          <div className="dash-metric-value-row">
            <span className="dash-metric-val">{m.val}</span>
            <span className="dash-metric-growth">{m.growth}</span>
          </div>

          <div className="dash-metric-period">{m.period}</div>
        </div>
      ))}
    </div>
  );
}

