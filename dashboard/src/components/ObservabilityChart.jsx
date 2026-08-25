import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const ObservabilityChart = ({ data, systemState }) => {
  // ObservabilityChart directly takes data array from Dashboard now, no internal interval.
  const chartData = data;

  return (
    <div style={{ width: '100%', height: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Latency Chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={systemState !== 'healthy' ? '#FF8A00' : '#00F0FF'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={systemState !== 'healthy' ? '#FF8A00' : '#00F0FF'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickFormatter={(val) => `${val}ms`} />
            <Tooltip 
              contentStyle={{ background: '#13141F', border: '1px solid rgba(255,255,255,0.1)' }}
              itemStyle={{ color: '#E2E8F0' }}
            />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke={systemState !== 'healthy' && systemState !== 'recovering' ? '#FF8A00' : '#00F0FF'} 
              fillOpacity={1} 
              fill="url(#colorLatency)" 
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Errors / Traffic Chart could be added here later */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickFormatter={(val) => `${val}%`} />
             <Tooltip 
              contentStyle={{ background: '#13141F', border: '1px solid rgba(255,255,255,0.1)' }}
              itemStyle={{ color: '#E2E8F0' }}
            />
            <Line type="monotone" dataKey="errors" stroke="#FF007F" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default ObservabilityChart;
