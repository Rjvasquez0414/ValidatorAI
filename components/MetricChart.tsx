import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

interface MetricChartProps {
  data: any[];
  dataKey1: string;
  dataKey2?: string;
  color1: string;
  color2?: string;
  title: string;
  type?: 'line' | 'bar' | 'area';
}

export const MetricChart: React.FC<MetricChartProps> = ({ 
  data, 
  dataKey1, 
  dataKey2, 
  color1, 
  color2, 
  title,
  type = 'line'
}) => {
  const axisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fontSize: 11, fill: '#6b7280', fontWeight: 500 }
  };

  // Helper to format YYYY-MM to "MMM YY" (e.g., 2023-10 -> Oct 23)
  const formatXAxis = (tickItem: string) => {
    try {
        if (!tickItem) return '';
        // If it's already short (e.g. "Oct"), return it. If it matches YYYY-MM, format it.
        if (tickItem.match(/^\d{4}-\d{2}$/)) {
            const date = new Date(tickItem + "-01"); // Append day to make it valid date
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }
        return tickItem;
    } catch (e) {
        return tickItem;
    }
  };

  const renderChart = () => {
    if (type === 'bar') {
      return (
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="month" {...axisProps} dy={10} tickFormatter={formatXAxis} />
            <YAxis {...axisProps} dx={-10} />
            <Tooltip 
              cursor={{fill: 'rgba(0,0,0,0.02)'}} 
              labelFormatter={formatXAxis}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(12px)',
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.6)', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }} 
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Bar dataKey={dataKey1} fill={color1} radius={[6, 6, 0, 0]} name={dataKey1.replace(/([A-Z])/g, ' $1').trim()} />
            {dataKey2 && color2 && <Bar dataKey={dataKey2} fill={color2} radius={[6, 6, 0, 0]} name={dataKey2.replace(/([A-Z])/g, ' $1').trim()} />}
        </BarChart>
      );
    }
    
    if (type === 'area') {
      return (
        <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="month" {...axisProps} dy={10} tickFormatter={formatXAxis} />
            <YAxis {...axisProps} dx={-10} />
            <Tooltip 
                labelFormatter={formatXAxis}
                contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(12px)',
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.6)', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <defs>
              <linearGradient id={`color${dataKey1}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color1} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color1} stopOpacity={0}/>
              </linearGradient>
              {dataKey2 && color2 && (
                <linearGradient id={`color${dataKey2}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color2} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={color2} stopOpacity={0}/>
                </linearGradient>
              )}
            </defs>
            <Area 
              type="monotone" 
              dataKey={dataKey1} 
              stroke={color1} 
              fillOpacity={1} 
              fill={`url(#color${dataKey1})`} 
              strokeWidth={3}
              name={dataKey1.replace(/([A-Z])/g, ' $1').trim()}
            />
            {dataKey2 && color2 && (
              <Area 
                type="monotone" 
                dataKey={dataKey2} 
                stroke={color2} 
                fillOpacity={1} 
                fill={`url(#color${dataKey2})`} 
                strokeWidth={3}
                name={dataKey2.replace(/([A-Z])/g, ' $1').trim()}
              />
            )}
        </AreaChart>
      );
    }

    return (
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="month" {...axisProps} dy={10} tickFormatter={formatXAxis} />
            <YAxis {...axisProps} dx={-10} />
            <Tooltip 
                labelFormatter={formatXAxis}
                contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(12px)',
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.6)', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              type="monotone" 
              dataKey={dataKey1} 
              stroke={color1} 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#fff', stroke: color1, strokeWidth: 2 }} 
              activeDot={{ r: 6, fill: color1, stroke: '#fff', strokeWidth: 2 }} 
              name={dataKey1.replace(/([A-Z])/g, ' $1').trim()}
            />
            {dataKey2 && color2 && (
              <Line 
                type="monotone" 
                dataKey={dataKey2} 
                stroke={color2} 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#fff', stroke: color2, strokeWidth: 2 }} 
                activeDot={{ r: 6, fill: color2, stroke: '#fff', strokeWidth: 2 }} 
                name={dataKey2.replace(/([A-Z])/g, ' $1').trim()}
              />
            )}
        </LineChart>
    );
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-glass h-[360px] flex flex-col hover:shadow-glass-hover transition-all duration-300">
      <h3 className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-wider flex items-center gap-2 px-2">
        {title}
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};