import React from 'react';
import { 
  Search, 
  ExternalLink, 
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';

const InvoiceList = ({ invoices, searchTerm, setSearchTerm }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="heading-display text-xl">Invoice Ledger</h3>
          <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-black">Full transaction history</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by vendor or buyer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border-medium rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-border-subtle">
                <th className="px-6 py-4 text-xs-caps">Entity</th>
                <th className="px-6 py-4 text-xs-caps">Date</th>
                <th className="px-6 py-4 text-xs-caps">Reference</th>
                <th className="px-6 py-4 text-xs-caps text-right">Amount</th>
                <th className="px-6 py-4 text-xs-caps text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv, i) => (
                  <tr key={inv.id || i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold text-[10px]">
                          {(inv.vendor || 'V')[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">{inv.vendor}</p>
                          <p className="text-[10px] text-text-muted">Buyer: {inv.buyer_name || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-text-sub text-xs font-medium">
                        <Calendar size={12} className="text-text-muted" />
                        {inv.date || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-mono font-bold text-text-sub">
                        {inv.invoice_number || '---'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-sm">
                      {inv.currency || '$'} {Number(inv.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <a 
                         href={inv.file_url} 
                         target="_blank" 
                         rel="noreferrer"
                         className="inline-flex w-8 h-8 rounded-lg border border-border-medium items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 transition-all"
                       >
                         <ExternalLink size={14} />
                       </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-text-muted opacity-40">
                    <FileText size={40} className="mx-auto mb-4 stroke-1" />
                    <p className="text-xs font-bold uppercase tracking-widest">No matching records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
