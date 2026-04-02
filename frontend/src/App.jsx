import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import UploadModal from './components/UploadModal';
import Scene3D from './components/Scene3D';
import { 
  Plus, LayoutDashboard, Settings, LogOut, 
  User, Shield, BarChart3, ChevronRight, Activity, Zap
} from 'lucide-react';
import { getAnalytics, getInvoices } from './services/api';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ total_count: 0, total_spend: 0, vendor_spend: {} });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const [invRes, statRes] = await Promise.all([getInvoices(), getAnalytics()]);
      setInvoices(invRes);
      setStats(statRes);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSuccess = (newInvoice) => {
    fetchData();
    showToast('Invoice processed successfully!', 'success');
  };

  return (
    <div className="relative h-screen flex text-text-primary overflow-hidden">
      <Scene3D />

      {/* Premium Multi-layered Sidebar */}
      <aside className="w-80 h-screen flex-shrink-0 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col p-8 z-50">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-2xl shadow-primary/40 relative group cursor-pointer">
             <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             <Zap size={24} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">AI<span className="text-secondary">Extract</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mt-1">Enterprise Core</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Neural Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<Plus size={18} />} 
            label="Deploy Extraction" 
            onClick={() => setIsModalOpen(true)} 
          />
          <SidebarItem 
            icon={<Activity size={18} />} 
            label="System Health" 
          />
          <div className="pt-8 pb-3 px-4 text-[10px] uppercase tracking-[0.25em] text-text-muted font-black">Architecture</div>
          <SidebarItem icon={<BarChart3 size={18} />} label="Data Intelligence" />
          <SidebarItem icon={<Shield size={18} />} label="Security Node" />
          <SidebarItem icon={<Settings size={18} />} label="Global Config" />
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
          <div className="p-4 glass-card border-white/5 bg-white/5 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-all">
             <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                <User size={18} className="text-primary" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Root Operator</p>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Identified</p>
                </div>
             </div>
             <ChevronRight size={14} className="text-text-muted group-hover:text-white transition-colors" />
          </div>
          <button className="w-full py-4 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-white transition-colors flex items-center justify-center gap-2 border border-white/5 rounded-xl hover:bg-white/5">
             <LogOut size={14} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Orchestration Area */}
      <main className="flex-1 w-full h-screen overflow-y-auto px-8 py-8 relative z-10">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 animate-fade-up max-w-[1400px] mx-auto border-b border-white/5 pb-8 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <div className="px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                  Protocol 1.0.4
               </div>
               <div className="w-1 h-1 rounded-full bg-white/20" />
               <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Stability: Optimal</p>
            </div>
            <h2 className="text-6xl font-black tracking-tighter mb-3">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/30 italic font-medium">Orchestrator</span>
            </h2>
            <p className="text-base text-text-secondary font-medium max-w-xl leading-relaxed">
              Advanced neural logic for multi-vendor invoice extraction. All systems synchronized.
            </p>
          </div>
          <div className="flex items-center gap-6">
             <div className="h-10 w-px bg-white/10 hidden lg:block" />
             <button 
               onClick={() => setIsModalOpen(true)}
               className="btn-primary flex items-center justify-center min-w-[200px]"
             >
               <Plus size={18} className="stroke-[3]" /> NEW EXTRACTION
             </button>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
               <motion.div 
                 key="loader"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="flex flex-col items-center justify-center h-[50vh]"
               >
                 <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-[1px] border-primary/10 rounded-full" />
                    <div className="absolute inset-x-0 top-0 border-t-2 border-primary rounded-full animate-spin h-full" />
                 </div>
                 <p className="mt-8 text-[10px] font-black uppercase tracking-[0.6em] text-primary animate-pulse">Syncing Core</p>
               </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-16 pb-16"
              >
                <Dashboard stats={stats} />
                <div className="relative">
                   <div className="absolute -top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                   <InvoiceList invoices={invoices} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Premium Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`fixed top-12 right-12 px-8 py-5 rounded-2xl shadow-premium backdrop-blur-3xl border-l-4 z-[100] ${toast.type === 'success' ? 'bg-success/10 border-success text-success' : 'bg-primary/10 border-primary text-text-primary'}`}
          >
            <div className="flex items-center gap-4">
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${toast.type === 'success' ? 'bg-success/20' : 'bg-primary/20'}`}>
                  {toast.type === 'success' ? <Zap size={16} /> : <Activity size={16} />}
               </div>
               <p className="text-sm font-black tracking-tight uppercase">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`sidebar-link w-full border-none cursor-pointer ${active ? 'sidebar-link active bg-transparent' : ''}`}
  >
    <div className={`transition-transform duration-500 ${active ? 'scale-125 text-white' : ''}`}>
      {icon}
    </div>
    <span className="flex-1 text-left">{label}</span>
    {active && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />}
  </button>
);

export default App;
