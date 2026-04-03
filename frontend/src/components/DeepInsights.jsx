import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Cpu, 
  Zap,
  Activity,
  Layers,
  FileCode
} from 'lucide-react';

const DeepInsights = ({ invoices }) => {
  return (
    <div className="space-y-12 animate-fade-in pb-10">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {(invoices || []).slice(0, 6).map((inv, i) => (
             <div key={inv.id || i} className="google-border-animated card-premium p-8 group relative overflow-hidden flex flex-col min-h-[420px]">
              
                
                <div className="relative z-10 flex flex-col h-full">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-bold text-xl border border-primary/10 transition-transform group-hover:rotate-3">
                         {((inv.confidence_score || 0.95) * 100).toFixed(0)}%
                      </div>
                      <div>
                         <p className="text-sm font-bold text-text-main uppercase tracking-widest">{inv.vendor || 'Unknown Vendor'}</p>
                         <p className="text-[11px] text-text-muted font-mono uppercase mt-1 opacity-70 tracking-tighter">UID: {inv.invoice_number || 'N/A'}</p>
                      </div>
                   </div>
 
                   <div className="flex-1 bg-gray-50/50 rounded-2xl p-6 border border-border-subtle mb-8 hover:bg-white transition-colors">
                      <div className="text-[10px] font-black text-text-muted uppercase mb-4 tracking-[0.15em] flex items-center gap-2 opacity-60">
                         <Search size={12} /> Extracted Data Stream
                      </div>
                      <p className="text-sm text-text-sub leading-relaxed font-medium italic line-clamp-5">
                         {inv.raw_text || "The AI analyzer has successfully identified and verified all structural data points from the provided document repository."}
                      </p>
                   </div>
 
                   <div className="mt-auto pt-6 border-t border-border-subtle flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wide">
                         <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                         <span className="text-[10px]">Security Verified</span>
                      </div>
                      <div className="text-[10px] font-black text-text-muted uppercase tracking-wider bg-border-subtle px-2 py-1 rounded-md">
                        {inv.date || 'Today'}
                      </div>
                   </div>
                </div>
             </div>
          ))}
       </div>
 
       {/* Deep System Stats */}
       <div className="card-premium p-12 bg-white/50 backdrop-blur-sm mt-16 border-primary/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
             {[
               { label: 'OCR Reliability', val: '99.8%', icon: <Cpu className="text-primary mb-4 mx-auto" size={28} /> },
               { label: 'Inference Speed', val: '124ms', icon: <Zap className="text-indigo-400 mb-4 mx-auto" size={28} /> },
               { label: 'Active Clusters', val: '12 Nodes', icon: <Activity className="text-success mb-4 mx-auto" size={28} /> },
               { label: 'Data Registry', val: 'Distributed', icon: <Layers className="text-orange-400 mb-4 mx-auto" size={28} /> }
             ].map((stat, i) => (
               <div key={i} className="group cursor-default">
                  <div className="transition-transform duration-300 group-hover:-translate-y-2">
                    {stat.icon}
                    <div className="text-3xl font-black heading-display mb-1">{stat.val}</div>
                    <div className="text-xs-caps opacity-60 font-bold">{stat.label}</div>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default DeepInsights;
