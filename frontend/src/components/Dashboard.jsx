import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Activity, DollarSign, FileText, ArrowUpRight, Cpu, 
  Receipt, TrendingUp, Layers, CreditCard, Clock,
  Building2, ShieldCheck, CalendarDays
} from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4', '#84cc16'];
const GRADIENTS = [
  ['#6366f1', '#4f46e5'],
  ['#a855f7', '#9333ea'],
  ['#ec4899', '#db2777'],
  ['#10b981', '#059669']
];

const Dashboard = ({ stats, deepMode = false }) => {
  const { 
    total_count = 0, 
    total_spend = 0, 
    total_tax = 0,
    avg_invoice = 0,
    vendor_spend = {}, 
    currency_spend = {},
    status_breakdown = {},
    monthly_spend = {},
    recent_invoices = []
  } = stats || {};

  // Auto-generate vendor pie data
  const vendorData = useMemo(() => 
    Object.entries(vendor_spend || {})
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value),
    [vendor_spend]
  );

  // Auto-generate currency breakdown
  const currencyData = useMemo(() =>
    Object.entries(currency_spend || {})
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value),
    [currency_spend]
  );

  // Auto-generate monthly trend from real data
  const monthlyData = useMemo(() => {
    const entries = Object.entries(monthly_spend || {})
      .map(([month, spend]) => ({ month, spend: Number(spend) }))
      .sort((a, b) => a.month.localeCompare(b.month));
    return entries;
  }, [monthly_spend]);

  // Auto-generate payment status breakdown
  const statusData = useMemo(() => 
    Object.entries(status_breakdown || {})
      .map(([name, count]) => ({ name, count: Number(count) }))
      .sort((a, b) => b.count - a.count),
    [status_breakdown]
  );

  // Dynamic stat cards — auto-create based on available data
  const dynamicStats = useMemo(() => {
    const cards = [
      { 
        title: "Total Invoices", 
        value: total_count, 
        icon: <FileText className="text-primary" size={22} />,
        trend: total_count > 0 ? `${total_count} processed` : "No data",
        show: true
      },
      { 
        title: "Total Spend", 
        value: `${getCurrencySymbol(currency_spend)}${total_spend?.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 
        icon: <DollarSign className="text-success" size={22} />,
        trend: total_spend > 0 ? "Aggregated" : "—",
        show: true
      },
      { 
        title: "Vendors", 
        value: vendorData.length, 
        icon: <Building2 className="text-secondary" size={22} />,
        trend: vendorData.length > 0 ? `${vendorData.length} unique` : "—",
        show: true
      },
    ];

    // Auto-add Tax card if tax data exists
    if (total_tax > 0) {
      cards.push({
        title: "Total Tax",
        value: `${getCurrencySymbol(currency_spend)}${total_tax?.toLocaleString(undefined, {minimumFractionDigits: 2})}`,
        icon: <Receipt className="text-warning" size={22} />,
        trend: "Tax aggregated",
        show: true
      });
    }

    // Auto-add Average card if we have invoices
    if (total_count > 1) {
      cards.push({
        title: "Avg. Invoice",
        value: `${getCurrencySymbol(currency_spend)}${avg_invoice?.toLocaleString(undefined, {minimumFractionDigits: 2})}`,
        icon: <TrendingUp className="text-info" size={22} />,
        trend: "Per invoice",
        show: true
      });
    }

    // Auto-add Currency count if multiple currencies exist
    if (Object.keys(currency_spend).length > 1) {
      cards.push({
        title: "Currencies",
        value: Object.keys(currency_spend).length,
        icon: <CreditCard className="text-accent" size={22} />,
        trend: Object.keys(currency_spend).join(", "),
        show: true
      });
    }

    return cards.filter(c => c.show);
  }, [total_count, total_spend, total_tax, avg_invoice, vendorData, currency_spend]);

  return (
    <div className="space-y-10">
      {/* Dynamic Stats Grid */}
      <div className={`grid gap-6 ${dynamicStats.length <= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-' + Math.min(dynamicStats.length, 4)}`}
        style={{ gridTemplateColumns: `repeat(${Math.min(dynamicStats.length, 4)}, minmax(0, 1fr))` }}
      >
        {dynamicStats.map((stat, idx) => (
          <StatCard 
            key={stat.title}
            title={stat.title} 
            value={stat.value} 
            icon={stat.icon} 
            trend={stat.trend} 
            index={idx}
          />
        ))}
      </div>

      {deepMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Charts Row 1 — Vendor Allocation + Monthly Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ... rest of the charts logic wrapped in deepMode check ... */}
        {/* Vendor Pie Chart — only show if vendor data exists */}
        {vendorData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card p-11 h-[420px] flex flex-col group border-white/5"
          >
            <ChartHeader 
              title="Vendor Allocation" 
              subtitle="Spend Distribution" 
              color="bg-primary" 
            />
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vendorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {vendorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}
                    formatter={(value) => [`${value?.toLocaleString()}`, 'Amount']}
                    cursor={{ fill: 'transparent' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Vendor Legend */}
            <div className="flex flex-wrap gap-3 mt-4">
              {vendorData.slice(0, 5).map((v, i) => (
                <div key={v.name} className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="truncate max-w-[100px]">{v.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Monthly Spend Trend — auto-generated from real data */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-11 h-[420px] flex flex-col group border-white/5"
        >
          <ChartHeader 
            title={monthlyData.length > 0 ? "Expenditure Flow" : "Expenditure Flow"} 
            subtitle={monthlyData.length > 0 ? "Monthly Aggregation" : "Upload invoices to see trends"} 
            color="bg-secondary" 
          />
          <div className="flex-1">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
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
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                    formatter={(value) => [`${value?.toLocaleString()}`, 'Spend']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spend" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorSpend)" 
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-20">
                <CalendarDays size={48} className="stroke-[1] mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Data</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Dynamic Row 2 — Auto-create charts for any extra data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Status Breakdown — auto-created if status data exists */}
        {statusData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card p-11 h-[400px] flex flex-col group border-white/5"
          >
            <ChartHeader 
              title="Payment Status" 
              subtitle="Invoice State Distribution" 
              color="bg-success" 
            />
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={10} 
                    fontWeight="900" 
                    axisLine={false} 
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#10b981" 
                    radius={[0, 8, 8, 0]}
                    animationDuration={2000}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={getStatusColor(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Currency Breakdown — auto-created if multiple currencies exist */}
        {currencyData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card p-11 h-[400px] flex flex-col group border-white/5"
          >
            <ChartHeader 
              title="Currency Breakdown" 
              subtitle="Multi-Currency Analysis" 
              color="bg-warning" 
            />
            <div className="flex-1 flex items-center justify-center">
              {currencyData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currencyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {currencyData.map((entry, index) => (
                        <Cell key={`curr-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={tooltipStyle}
                      formatter={(value, name) => [`${value?.toLocaleString()}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-3xl bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={36} className="text-warning" />
                  </div>
                  <p className="text-2xl font-black text-white mb-1">{currencyData[0]?.name || "—"}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Primary Currency</p>
                  <p className="text-lg font-bold text-text-secondary mt-2">
                    {currencyData[0]?.value?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

          {/* Dynamic Extra Fields — auto-create cards for any additional summary data */}
          {recent_invoices.length > 0 && (
            <DynamicFieldCards invoices={recent_invoices} />
          )}
        </motion.div>
      )}
    </div>
  );
};

/* ── Sub-components ──────────────────────────────────────────────── */

const ChartHeader = ({ title, subtitle, color }) => (
  <div className="flex justify-between items-center mb-10">
    <div className="flex items-center gap-4">
      <div className={`w-1 h-7 ${color} rounded-full shadow-[0_0_12px_rgba(255,255,255,0.2)]`} />
      <div className="text-left">
        <h3 className="text-lg font-black tracking-widest mb-0.5 uppercase text-white/90">{title}</h3>
        <p className="text-[9px] uppercase tracking-[0.25em] text-text-muted font-black opacity-60 italic">{subtitle}</p>
      </div>
    </div>
    <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
      <Activity size={16} className="text-primary animate-pulse" />
    </div>
  </div>
);

const StatCard = ({ title, value, icon, trend, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    viewport={{ once: true }}
    className="glass-card p-10 group relative border-white/[0.06] hover:border-primary/30 transition-all duration-500 overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    
    <div className="flex justify-between items-start mb-10 relative z-10">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 shadow-2xl">
        {React.cloneElement(icon, { size: 22, className: 'group-hover:animate-pulse' })}
      </div>
      <div className="flex flex-col items-end">
        <div className="px-2.5 py-1 bg-success/10 border border-success/20 rounded-full text-[9px] font-black uppercase tracking-wider text-success flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
           <ArrowUpRight size={10} className="stroke-[3]" /> {trend}
        </div>
      </div>
    </div>

    <div className="relative z-10 text-left">
       <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted mb-2 opacity-70 italic">{title}</p>
       <h2 className="text-4xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all duration-300">
         {value}
       </h2>
    </div>
    
    {/* Animated background glow */}
    <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-1000 group-hover:scale-150" />
  </motion.div>
);

/**
 * DynamicFieldCards — auto-creates summary cards for unique fields found in invoice data.
 * If a new field appears in the data that has no dedicated section, it auto-creates one.
 */
const DynamicFieldCards = ({ invoices }) => {
  // Define which fields to auto-summarize if they have data
  const fieldConfigs = [
    { key: 'gst_number', label: 'GST Numbers Found', icon: <ShieldCheck size={18} className="text-primary" />, type: 'unique' },
    { key: 'buyer_name', label: 'Buyers Identified', icon: <Layers size={18} className="text-secondary" />, type: 'unique' },
  ];

  const cards = fieldConfigs
    .map(config => {
      const values = invoices
        .map(inv => inv[config.key])
        .filter(v => v && v.trim && v.trim() !== '' && v !== 'N/A');
      
      const uniqueValues = [...new Set(values)];

      if (uniqueValues.length === 0) return null;

      return {
        ...config,
        count: uniqueValues.length,
        values: uniqueValues.slice(0, 5), // Show top 5
        total: values.length,
      };
    })
    .filter(Boolean);

  if (cards.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-accent rounded-full opacity-50" />
        <div>
          <h3 className="text-xl font-black tracking-tight uppercase">Auto-Detected Fields</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">Dynamically discovered from extraction data</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="glass-card p-10 border-white/5 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                {card.icon}
              </div>
              <div>
                <p className="text-sm font-black tracking-widest uppercase mb-0.5">{card.label}</p>
                <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black opacity-60">{card.count} unique nodes identified</p>
              </div>
            </div>
            <div className="space-y-2">
              {card.values.map((val, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-text-secondary bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="truncate">{val}</span>
                </div>
              ))}
              {card.count > 5 && (
                <p className="text-[9px] text-text-muted text-center font-bold uppercase tracking-wider pt-1">
                  +{card.count - 5} more
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

/* ── Helpers ──────────────────────────────────────────────────────── */

const tooltipStyle = { 
  background: 'rgba(3, 7, 18, 0.98)', 
  border: '1px solid rgba(255,255,255,0.1)', 
  borderRadius: '16px', 
  backdropFilter: 'blur(16px)', 
  padding: '16px', 
  boxShadow: '0 20px 40px rgba(0,0,0,0.5)' 
};

function getCurrencySymbol(currencySpend) {
  const currencies = Object.keys(currencySpend || {});
  if (currencies.length === 0) return '$';
  const primary = currencies[0];
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$' };
  return symbols[primary] || primary + ' ';
}

function getStatusColor(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('paid')) return '#10b981';
  if (s.includes('pending')) return '#f59e0b';
  if (s.includes('overdue')) return '#ef4444';
  if (s.includes('unknown')) return '#64748b';
  return '#6366f1';
}

export default Dashboard;
