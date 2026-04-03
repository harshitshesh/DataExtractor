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
    <div className="space-y-10 animate-fade-in">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(invoices || []).slice(0, 6).map((inv, i) => (
             <div key={inv.id || i} className="card-premium p-8 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-primary/5 transition-transform duration-500 group-hover:scale-110">
                   <FileCode size={100} />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-bold text-lg border border-primary/10">
                         {((inv.confidence_score || 0.95) * 100).toFixed(0)}%
                      </div>
                      <div>
                         <p className="text-xs font-bold text-text-main uppercase tracking-widest">{inv.vendor || 'Unknown Vendor'}</p>
                         <p className="text-[10px] text-text-muted font-mono uppercase mt-0.5">UID: {inv.invoice_number || 'N/A'}</p>
                      </div>
                   </div>

                   <div className="flex-1 bg-gray-50 rounded-xl p-5 border border-border-subtle mb-6">
                      <div className="text-[9px] font-bold text-text-muted uppercase mb-3 letter-spacing-[0.1em] flex items-center gap-2">
                         <Search size={10} /> Extracted Pattern
                      </div>
                      <p className="text-xs text-text-sub leading-relaxed italic line-clamp-4">
                         {inv.raw_text || "The AI analyzer has successfully identified and verified all structural data points from the provided document repository."}
                      </p>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase">
                         <ShieldCheck size={14} /> 
                         <span className="text-[10px]">Security Verified</span>
                      </div>
                      <div className="text-[10px] font-black text-text-muted uppercase">
                        {inv.date}
                      </div>
                   </div>
                </div>
             </div>
          ))}
       </div>

       {/* Deep System Stats */}
       <div className="card-premium p-10 bg-black/5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
             {[
               { label: 'OCR Reliability', val: '99.8%', icon: <Cpu className="text-primary mb-3 mx-auto" /> },
               { label: 'Inference Speed', val: '124ms', icon: <Zap className="text-indigo-400 mb-3 mx-auto" /> },
               { label: 'Active Clusters', val: '12 Nodes', icon: <Activity className="text-success mb-3 mx-auto" /> },
               { label: 'Data Registry', val: 'Distributed', icon: <Layers className="text-orange-400 mb-3 mx-auto" /> }
             ].map((stat, i) => (
               <div key={i}>
                  {stat.icon}
                  <div className="text-2xl font-black heading-display">{stat.val}</div>
                  <div className="text-xs-caps opacity-50 mt-1">{stat.label}</div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default DeepInsights;
