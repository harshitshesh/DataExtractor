import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';

const Dashboard = ({ stats }) => {
  const metrics = [
    { 
      label: 'Total Extraction', 
      value: stats.total_count || 0, 
      change: '+12%', 
      isUp: true, 
      icon: <FileText className="text-primary" /> 
    },
    { 
      label: 'Gross Expenditure', 
      value: `$${(stats.total_spend || 0).toLocaleString()}`, 
      change: '+5.4%', 
      isUp: true, 
      icon: <DollarSign className="text-success" /> 
    },
    { 
      label: 'Avg. Invoice', 
      value: `$${(stats.avg_invoice || 0).toLocaleString()}`, 
      change: '-2.1%', 
      isUp: false, 
      icon: <TrendingUp className="text-indigo-400" /> 
    },
    { 
      label: 'Tax Liability', 
      value: `$${(stats.total_tax || 0).toLocaleString()}`, 
      change: '+0.8%', 
      isUp: true, 
      icon: <Clock className="text-orange-400" /> 
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="card-premium metric-card relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-border-subtle group-hover:scale-110 transition-transform">
                {m.icon}
              </div>
              <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full ${m.isUp ? 'text-success bg-success-bg' : 'text-error bg-error-bg'}`}>
                {m.isUp ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                {m.change}
              </div>
            </div>
            <div className="text-xs-caps mt-2">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Invoices Table (Simplified) */}
        <div className="lg:col-span-2 card-premium p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="heading-display text-xl">Recent Extractions</h3>
            <button className="text-xs font-bold text-primary hover:underline cursor-pointer">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="pb-4 text-xs-caps">Entity / Vendor</th>
                  <th className="pb-4 text-xs-caps text-center">Reference</th>
                  <th className="pb-4 text-xs-caps text-right">Amount</th>
                  <th className="pb-4 text-xs-caps text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {(stats.recent_invoices || []).slice(0, 5).map((inv, i) => (
                  <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xs uppercase">
                          {(inv.vendor || 'UN')[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">{inv.vendor || 'Unknown entity'}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{inv.date || 'TBD'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 text-center">
                      <span className="px-2 py-1 rounded bg-gray-100 text-[10px] font-mono font-bold text-text-sub uppercase tracking-wider">
                        {inv.invoice_number || '---'}
                      </span>
                    </td>
                    <td className="py-5 text-right font-bold text-sm">
                      {inv.currency || '$'} {Number(inv.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-5 text-right">
                       <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-success uppercase">
                         <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                         Verified
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insight Breakdown Card */}
        <div className="card-premium p-8 bg-black/5 flex flex-col justify-between">
           <div>
              <div className="flex items-center justify-between mb-2">
                 <h3 className="heading-display text-xl">Top Vendor</h3>
                 <MoreVertical size={16} className="text-text-muted" />
              </div>
              <p className="text-xs text-text-sub mb-6">Highest expenditure pattern detected</p>
              
              {Object.keys(stats.vendor_spend || {}).length > 0 ? (
                (() => {
                  const sorted = Object.entries(stats.vendor_spend).sort(([,a], [,b]) => b - a);
                  const top = sorted[0];
                  return (
                    <div className="space-y-6">
                       <div className="flex flex-col items-center py-10 bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden relative">
                          <div className="text-xs-caps text-primary mb-2">Primary Entity</div>
                          <div className="text-3xl font-black text-center px-4 truncate max-w-full italic">{top[0]}</div>
                          <div className="mt-4 px-6 py-2 bg-primary text-white rounded-full text-xs font-bold shadow-lg shadow-primary/20">
                             ${top[1].toLocaleString()}
                          </div>
                          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full" />
                       </div>
                       
                       <div className="space-y-4">
                          {sorted.slice(1, 4).map(([v, s], i) => (
                             <div key={i} className="flex items-center justify-between">
                                <span className="text-xs font-bold text-text-sub">{v}</span>
                                <span className="text-xs font-bold">${s.toLocaleString()}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                  )
                })()
              ) : (
                <div className="py-20 text-center opacity-20">
                  <FileText size={48} className="mx-auto mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">No vendor data found</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
