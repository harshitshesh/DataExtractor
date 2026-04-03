import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const Analytics = ({ stats }) => {
  // Transform monthly spend
  const monthlyData = Object.entries(stats.monthly_spend || {})
    .map(([date, amount]) => ({
      name: date,
      value: amount
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Transform vendor spend for pie chart
  const vendorData = Object.entries(stats.vendor_spend || {})
    .map(([vendor, amount]) => ({
      name: vendor,
      value: amount
    }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#4f46e5', '#9333ea', '#ec4899', '#059669', '#d97706'];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="card-premium p-8 h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="heading-display text-xl">Expenditure Trend</h3>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-black">Monthly performance analysis</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full opacity-20">
              <p className="text-xs font-bold uppercase tracking-[0.5em]">Awaiting analytical data nodes...</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium p-8 h-[400px] flex flex-col">
           <h3 className="heading-display text-xl mb-8">Vendor Market Share</h3>
           <div className="flex-1">
             {vendorData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={vendorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {vendorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(val) => <span className="text-[11px] font-bold text-text-sub uppercase tracking-wider">{val}</span>}
                    />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full opacity-20 italic font-medium text-xs">No vendor clusters detected.</div>
             )}
           </div>
        </div>

        <div className="card-premium p-8 h-[400px] flex flex-col">
           <h3 className="heading-display text-xl mb-8">Currency Distribution</h3>
           <div className="flex-1">
              {Object.keys(stats.currency_spend || {}).length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(stats.currency_spend).map(([c, v]) => ({ name: c, value: v }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="value" 
                      fill="#4f46e5" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full opacity-20 italic text-xs">Forex analysis pending synchronization.</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
