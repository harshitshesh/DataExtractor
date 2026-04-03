import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Calendar, ExternalLink, 
  Search, Filter, Activity, Clock
} from 'lucide-react';

const InvoiceList = ({ invoices, searchTerm, setSearchTerm }) => {
  return (
    <div className="space-y-12 animate-fade-up">
      <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-8 max-w-[1600px] mx-auto">
        <div className="text-left">
           <div className="flex items-center gap-3 mb-2.5">
              <div className="w-1 h-6 bg-secondary rounded-full shadow-[0_0_12px_rgba(168,85,247,0.4)]" />
              <h3 className="text-2xl font-black tracking-[0.1em] uppercase text-white/90">Neural Registry</h3>
           </div>
           <p className="text-[11px] text-text-muted font-black uppercase tracking-[0.2em] opacity-60 italic">Archive of identified transaction nodes across the decentralized network.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-[500px] group">
               <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-300" />
               <input 
                 type="text" 
                 placeholder="Search transaction ID, vendor node, or buyer name..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl py-4.5 pl-16 pr-8 text-sm font-bold focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-text-muted/40 shadow-xl"
               />
            </div>
           <button className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-text-muted hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300">
              <Filter size={18} />
           </button>
        </div>
      </div>

      <div className="glass-card !p-0 overflow-hidden group border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted whitespace-nowrap opacity-60">Vendor & Buyer</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted whitespace-nowrap opacity-60">Temporal Data</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted whitespace-nowrap opacity-60">Status Descriptor</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted whitespace-nowrap text-right opacity-60">Expenditure</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted whitespace-nowrap text-right opacity-60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv, idx) => (
                  <motion.tr 
                    key={inv.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="group/row hover:bg-white/[0.04] transition-all duration-500"
                  >
                    <td className="px-8 py-10">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-white/10 flex flex-shrink-0 items-center justify-center text-primary font-black text-sm uppercase shadow-xl group-hover/row:scale-110 transition-transform duration-500">
                          {inv.vendor?.charAt(0) || 'V'}
                        </div>
                        <div className="min-w-[140px]">
                          <span className="font-bold text-[13px] tracking-tight text-white/90 group-hover/row:text-white transition-colors block truncate">{inv.vendor}</span>
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block truncate mt-0.5 opacity-60" title={inv.buyer_name}>TO: {inv.buyer_name || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-10">
                      <div className="flex flex-col gap-2 text-left">
                        <div className="flex items-center gap-2 text-text-secondary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] w-fit">
                          <Calendar size={11} className="text-secondary opacity-60" />
                          <span>{inv.date || '---'}</span>
                        </div>
                        <div className="text-[9px] font-black text-warning/80 uppercase tracking-widest flex items-center gap-1.5 px-2.5">
                           <Clock size={10} /> DUE: {inv.due_date || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-10">
                      <div className="flex flex-col gap-2.5 items-start">
                        <code className="text-[9px] bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-md text-text-muted font-mono uppercase tracking-[0.1em] max-w-[110px] truncate block text-center opacity-80 italic">
                          {inv.invoice_number?.toUpperCase() || 'SYS-NODE'}
                        </code>
                        {getStatusBadge(inv.payment_status)}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex flex-col items-end">
                          <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em] opacity-40 mb-1">
                             {inv.currency} TAX: {inv.tax_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                          </div>
                          <div className="text-xl font-black text-white tabular-nums tracking-tighter">
                            <span className="text-[10px] text-primary mr-1.5 uppercase font-black tracking-[0.2em] opacity-60">{inv.currency}</span>
                            {inv.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <a 
                        href={inv.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] items-center justify-center text-text-muted hover:text-white hover:border-primary/50 hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300"
                      >
                        <ExternalLink size={15} />
                      </a>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30">
                       <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <FileText size={40} className="stroke-[1]" />
                       </div>
                       <p className="text-xs font-black uppercase tracking-[0.4em]">No Neural Registry Data</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
      </div>
    </div>
  );
};

/* ── Helper Components ────────────────────────────────────────── */

function getStatusBadge(status) {
  const s = (status || '').toLowerCase();
  
  if (s.includes('paid')) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 border border-success/30 rounded-md shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <Activity size={10} className="text-success animate-pulse" />
        <span className="text-[8px] font-black text-success uppercase tracking-widest">Paid</span>
      </div>
    );
  }
  
  if (s.includes('pending')) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 border border-warning/30 rounded-md shadow-[0_0_15px_rgba(245,158,11,0.1)]">
        <div className="w-1 h-1 rounded-full bg-warning animate-ping" />
        <span className="text-[8px] font-black text-warning uppercase tracking-widest">Pending</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/30 rounded-md">
      <span className="text-[8px] font-black text-primary uppercase tracking-widest">{status || 'Extracted'}</span>
    </div>
  );
}

export default InvoiceList;
