import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, DollarSign, FileText, ArrowUpRight, Cpu } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#10b981'];

const Dashboard = ({ stats }) => {
  const { total_count = 0, total_spend = 0, vendor_spend = {} } = stats || {};

  const vendorData = Object.entries(vendor_spend || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Neural Count" 
          value={total_count} 
          icon={<FileText className="text-primary" size={22} />} 
          trend="+12.5%" 
          index={0}
        />
        <StatCard 
          title="Aggregated Spend" 
          value={`$${total_spend?.toLocaleString()}`} 
          icon={<DollarSign className="text-success" size={22} />} 
          trend="+8.2%" 
          index={1}
        />
        <StatCard 
          title="Network Nodes" 
          value={vendorData.length} 
          icon={<Cpu className="text-secondary" size={22} />} 
          trend="+2" 
          index={2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Share Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-8 h-[350px] flex flex-col group border-white/5"
        >
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-primary rounded-full opacity-50" />
                <div>
                   <h3 className="text-2xl font-black tracking-tight mb-1 uppercase italic">Vendor Allocation</h3>
                   <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">Neural Spacial Distribution</p>
                </div>
             </div>
             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <Activity size={18} className="text-primary animate-pulse" />
             </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vendorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={110}
                  outerRadius={150}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {vendorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'rgba(3, 7, 18, 0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', backdropFilter: 'blur(16px)', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}
                  cursor={{ fill: 'transparent' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Temporal Trends */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-8 h-[350px] flex flex-col group border-white/5"
        >
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-secondary rounded-full opacity-50" />
                <div>
                   <h3 className="text-2xl font-black tracking-tight mb-1 uppercase italic">Expenditure Flow</h3>
                   <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">Temporal Sync Engine</p>
                </div>
             </div>
             <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
             </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="900"
                  axisLine={false}
                  tickLine={false}
                  dy={15}
                />
                <YAxis 
                   stroke="#64748b" 
                   fontSize={10} 
                   fontWeight="900"
                   axisLine={false}
                   tickLine={false}
                   dx={-10}
                />
                <Tooltip 
                  contentStyle={{ background: 'rgba(3, 7, 18, 0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', backdropFilter: 'blur(16px)', padding: '16px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#6366f1" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorSpend)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    viewport={{ once: true }}
    className="glass-card p-8 group relative border-white/5"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-700 shadow-xl">
        {icon}
      </div>
      <div className="badge badge-success text-[10px] py-1 px-2.5">
         <ArrowUpRight size={12} className="stroke-[3]" /> {trend}
      </div>
    </div>
    <div>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">{title}</p>
       <h2 className="stat-value text-4xl">{value}</h2>
    </div>
    
    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/15 transition-all duration-1000 group-hover:scale-150" />
  </motion.div>
);

const mockTrendData = [
  { month: 'JAN', spend: 4200 },
  { month: 'FEB', spend: 3800 },
  { month: 'MAR', spend: 5400 },
  { month: 'APR', spend: 6100 },
  { month: 'MAY', spend: 4900 },
  { month: 'JUN', spend: 7200 },
];

export default Dashboard;
