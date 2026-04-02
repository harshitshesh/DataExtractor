import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Calendar, ExternalLink, 
  Search, Filter, Activity
} from 'lucide-react';

const InvoiceList = ({ invoices }) => {
  return (
    <div className="space-y-12 animate-fade-up">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 max-w-[1400px] mx-auto">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-secondary rounded-full" />
              <h3 className="text-3xl font-black tracking-tight uppercase italic text-white">Neural Registry</h3>
           </div>
           <p className="text-sm text-text-secondary font-medium italic opacity-70">Archive of identified transaction nodes across the decentralized network.</p>
        </div>
        
        <div className="flex items-center gap-6 w-full lg:w-auto">
           <div className="relative flex-1 lg:w-[450px] group">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search transaction ID or vendor node..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-muted/40 shadow-2xl"
              />
           </div>
           <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-text-secondary hover:text-white hover:bg-white/10 transition-all shadow-xl">
              <Filter size={20} />
           </button>
        </div>
      </div>

      <div className="glass-card !p-0 overflow-hidden group border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.03]">
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted whitespace-nowrap">Vendor & Buyer</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted whitespace-nowrap">Dates (Iss/Due)</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted whitespace-nowrap">ID & Status</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted whitespace-nowrap text-right">Tax Paid</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted whitespace-nowrap text-right">Net Value</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted whitespace-nowrap text-right">Actions</th>
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
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-transparent border border-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-black text-sm uppercase shadow-lg group-hover/row:scale-110 transition-transform duration-500">
                          {inv.vendor?.charAt(0) || 'V'}
                        </div>
                        <div className="min-w-[120px]">
                          <span className="font-black text-sm tracking-tight text-white/90 group-hover/row:text-white transition-colors block truncate">{inv.vendor}</span>
                          <span className="text-[10px] font-bold text-text-muted block truncate" title={inv.buyer_name}>Billed to: {inv.buyer_name || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5 w-fit">
                        <div className="flex items-center gap-2 text-text-secondary text-[11px] font-bold bg-white/5 px-2 py-1 rounded-md border border-white/5 shadow-inner">
                          <Calendar size={12} className="opacity-50 text-secondary" />
                          <span>{inv.date || '---'}</span>
                        </div>
                        <div className="text-[9px] font-black text-warning uppercase flex items-center gap-1.5 px-2 opacity-80">
                          Due: {inv.due_date || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-2">
                        <code className="text-[10px] bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-text-muted font-mono uppercase tracking-[0.05em] shadow-inner max-w-[120px] truncate block text-center">
                          {inv.invoice_number?.toUpperCase() || 'SYS-NODE'}
                        </code>
                        <div className="badge badge-success text-[8px] px-2 py-0.5 border-success/30 mx-auto w-fit">
                           {inv.payment_status?.toUpperCase() || 'EXTRACTED'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right font-black text-sm text-text-secondary tabular-nums">
                      <span className="text-[9px] mr-1 opacity-50">{inv.currency}</span>
                      {inv.tax_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '---'}
                    </td>
                    <td className="px-6 py-6 text-right font-black text-lg text-white tabular-nums">
                      <span className="text-[10px] text-primary mr-1 font-black uppercase tracking-widest opacity-60">{inv.currency}</span>
                      {inv.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <a 
                        href={inv.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-text-muted hover:text-white hover:border-primary/50 hover:bg-primary/20 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 ml-auto"
                      >
                        <ExternalLink size={16} />
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

export default InvoiceList;
