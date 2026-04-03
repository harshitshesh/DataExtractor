import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Bell, 
  HelpCircle, 
  LogOut, 
  Plus
} from 'lucide-react';
import { getInvoices } from './services/api';
import { calculateStats } from './services/statsHelper';

// New Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import DeepInsights from './components/DeepInsights';
import InvoiceList from './components/InvoiceList';
import UploadModal from './components/UploadModal';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ total_count: 0, total_spend: 0, vendor_spend: {}, monthly_spend: {}, currency_spend: {}, recent_invoices: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = React.useMemo(() => {
    if (!searchTerm) return invoices;
    const term = searchTerm.toLowerCase();
    return invoices.filter(inv => 
      inv.vendor?.toLowerCase().includes(term) || 
      inv.buyer_name?.toLowerCase().includes(term) ||
      inv.invoice_number?.toLowerCase().includes(term)
    );
  }, [invoices, searchTerm]);

  const fetchData = async () => {
    try {
      const invRes = await getInvoices();
      setInvoices(invRes);
      const newStats = calculateStats(invRes);
      setStats(newStats);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-bg-app text-text-main overflow-hidden selection:bg-primary selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Modern Top Header */}
        <header className="h-20 bg-white border-b border-border-subtle px-10 flex items-center justify-between z-40 sticky top-0">
          <div className="flex items-center gap-4 text-sm font-bold text-text-sub">
             <span className="text-text-muted">Pages</span> / 
             <span className="text-text-main capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-10">
            {/* Search Bar Placeholder */}
            <div className="hidden xl:flex items-center gap-4 text-xs font-black text-text-muted uppercase tracking-[0.2em]">
               System Status: <span className="text-success">Synchronized</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2.5 rounded-xl border border-border-medium text-text-sub hover:text-primary transition-all cursor-pointer">
                <Bell size={18} />
              </button>
              <button className="p-2.5 rounded-xl border border-border-medium text-text-sub hover:text-primary transition-all cursor-pointer">
                <HelpCircle size={18} />
              </button>
              <div className="w-px h-8 bg-border-subtle mx-2" />
              
              {/* THE BUTTON: AI Invoice Generator */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-ai-gen group"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">AI Invoice Generator</span>
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">
          <div className="max-w-[1400px] mx-auto pb-20">
            {loading ? (
               <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                  <div className="w-12 h-12 rounded-full border-2 border-primary-light border-t-primary animate-spin" />
                  <p className="text-xs font-black uppercase tracking-[0.6em] text-primary animate-pulse">Syncing nodes...</p>
               </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === 'dashboard' && <Dashboard stats={stats} />}
                  {activeTab === 'analytics' && <Analytics stats={stats} />}
                  {activeTab === 'insights' && <DeepInsights invoices={invoices} />}
                  {activeTab === 'history' && (
                    <InvoiceList 
                      invoices={filteredInvoices} 
                      searchTerm={searchTerm} 
                      setSearchTerm={setSearchTerm} 
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchData()} 
      />
    </div>
  );
}

export default App;
