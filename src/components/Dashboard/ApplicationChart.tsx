"use client";
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ChartData {
  month: string;
  applied: number;
  interviews: number;
  rejected: number;
}

interface ApplicationChartProps {
  data: ChartData[];
}

const ApplicationChart: React.FC<ApplicationChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
            itemStyle={{ fontSize: '13px', fontWeight: 600 }}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} 
          />
          <Line 
            type="monotone" 
            name="Application Sent" 
            dataKey="applied" 
            stroke="#2454FF" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2 }} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            name="Interviews" 
            dataKey="interviews" 
            stroke="#14B87A" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2 }} 
          />
          <Line 
            type="monotone" 
            name="Rejected" 
            dataKey="rejected" 
            stroke="#7B3EFF" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ApplicationChart;
