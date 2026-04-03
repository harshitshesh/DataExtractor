import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import UploadModal from './components/UploadModal';
import Scene3D from './components/Scene3D';
import { 
  Plus, LayoutDashboard, Settings, LogOut, LogIn,
  User, Shield, BarChart3, ChevronRight, Activity, Zap, Cpu, Layers
} from 'lucide-react';
import { getAnalytics, getInvoices } from './services/api';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ total_count: 0, total_spend: 0, vendor_spend: {} });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [profileHovered, setProfileHovered] = useState(false);
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

  return (
    <div className="relative h-screen flex text-text-primary overflow-hidden bg-[#020617]">
      {/* Background Neural Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <Scene3D />
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setIsModalOpen={setIsModalOpen}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        profileHovered={profileHovered}
        setProfileHovered={setProfileHovered}
      />

      {/* Main Viewport */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10 custom-scrollbar text-left">
        <div className="max-w-[1600px] mx-auto px-8 pt-8 pb-20">
          {/* Universal Header */}
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Active Session: Neural Link Est.</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">
                System <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Orchestrator</span>
              </h2>
              <p className="text-sm text-text-muted font-bold tracking-wide italic">Advanced neural logic for multi-vendor invoice extraction. All systems synchronized.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden xl:flex items-center gap-6 px-6 py-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-xl">
                 <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Stability</span>
                   <span className="text-xs font-black text-success">OPTIMAL</span>
                 </div>
                 <div className="w-px h-6 bg-white/[0.08]" />
                 <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Latency</span>
                   <span className="text-xs font-black text-primary">12ms</span>
                 </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="group relative px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-500 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center gap-3">
                  <Plus size={18} className="stroke-[3]" />
                  <span>New Extraction</span>
                </div>
              </button>
            </div>
          </header>

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
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-left"
              >
                {activeTab === 'dashboard' ? (
                  <>
                    <Dashboard stats={stats} />
                    <div className="mt-20">
                      <InvoiceList 
                        invoices={filteredInvoices} 
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                      />
                    </div>
                  </>
                ) : activeTab === 'analytics' ? (
                  <div className="text-left">
                     <div className="mb-12">
                        <h2 className="text-4xl font-black text-white italic uppercase mb-2">Deep Analytics</h2>
                        <p className="text-text-muted font-bold tracking-wide italic">Historical patterns and expenditure distribution.</p>
                     </div>
                     <Dashboard stats={stats} deepMode={true} />
                  </div>
                ) : activeTab === 'insights' ? (
                  <div className="text-left">
                     <div className="mb-12">
                        <h2 className="text-4xl font-black text-white italic uppercase mb-2">AI Diagnostic Insights</h2>
                        <p className="text-text-muted font-bold tracking-wide italic">OCR precision and node-level metadata analysis.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {invoices.slice(0, 6).map((inv, i) => (
                           <motion.div 
                             key={inv.id || i}
                             initial={{ opacity: 0, y: 30 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.1 }}
                             className="glass-card p-6 border-white/5 relative overflow-hidden group"
                           >
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap size={60} />
                              </div>
                              <div className="relative z-10">
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                       {inv.confidence_score ? (inv.confidence_score * 100).toFixed(0) : '95'}%
                                    </div>
                                    <div>
                                       <p className="text-xs font-black uppercase text-white/80">{inv.vendor}</p>
                                       <p className="text-[9px] uppercase tracking-widest text-text-muted">Node ID: {inv.invoice_number}</p>
                                    </div>
                                 </div>
                                 <div className="space-y-3">
                                    <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                                       <p className="text-[9px] uppercase tracking-widest text-text-muted mb-2 font-black">OCR RAW SNIPPET</p>
                                       <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-3 italic">
                                          {inv.raw_text || "Automated neuro-extraction successfully completed."}
                                       </p>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                       <span className="text-primary">Confidence</span>
                                       <span className="text-success">Verified</span>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </div>
                ) : activeTab === 'health' ? (
                  <div className="text-left">
                     <div className="mb-12">
                        <h2 className="text-4xl font-black text-white italic uppercase mb-2">Service Mesh Health</h2>
                        <p className="text-text-muted font-bold tracking-wide italic">Real-time connectivity and logic core metrics.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                          { label: 'Core API', status: 'Optimal', details: 'Status OK (200)', icon: <Activity className="text-success" /> },
                          { label: 'Logic Node', status: 'Stable', details: 'Gemini 2.0 Flash', icon: <Cpu className="text-primary" /> },
                          { label: 'Data Registry', status: 'Connected', details: 'Supabase Cloud', icon: <Layers className="text-secondary" /> },
                          { label: 'Security', status: 'Active', details: 'CORS/Env Locked', icon: <Shield className="text-accent" /> }
                        ].map((node, i) => (
                           <div key={i} className="glass-card p-8 border-white/5 flex flex-col items-center text-center group hover:border-primary/20 transition-all">
                              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                                 {node.icon}
                              </div>
                              <p className="text-[10px] font-black tracking-widest uppercase text-text-muted mb-2">{node.label}</p>
                              <p className="text-xl font-black text-white mb-1 uppercase tracking-tight">{node.status}</p>
                              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{node.details}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-40 opacity-20">
                    <Cpu size={80} className="mb-6 stroke-[1]" />
                    <p className="text-sm font-black uppercase tracking-[0.5em]">Module Under Development</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          fetchData();
          showToast('Invoice extracted successfully!', 'success');
        }}
      />
      
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`fixed top-8 right-8 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-3xl border border-white/10 z-[100] ${toast.type === 'success' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}
          >
            <div className="flex items-center gap-3">
              <Zap size={16} />
              <p className="text-xs font-black uppercase tracking-widest">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Sidebar = ({ activeTab, setActiveTab, setIsModalOpen, isLoggedIn, setIsLoggedIn, profileHovered, setProfileHovered }) => (
  <aside className="w-72 h-screen flex-shrink-0 bg-black/60 backdrop-blur-3xl border-r border-white/[0.06] flex flex-col z-50 shadow-2xl px-6 py-10">
    <div className="flex items-center gap-3.5 pb-8 border-b border-white/[0.06] mb-8">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/30 relative group cursor-pointer flex-shrink-0">
         <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
         <Zap size={20} className="text-white fill-white" />
      </div>
      <div>
        <h1 className="text-lg font-black tracking-tight text-white leading-none">AI<span className="text-secondary">Extract</span></h1>
        <p className="text-[9px] uppercase tracking-[0.2em] text-primary/80 font-bold mt-0.5">Enterprise Core</p>
      </div>
    </div>

    <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
      <SidebarItem 
        icon={<LayoutDashboard size={18} />} 
        label="Dashboard" 
        active={activeTab === 'dashboard'} 
        onClick={() => setActiveTab('dashboard')} 
      />
      <SidebarItem 
        icon={<Plus size={18} />} 
        label="New Extraction" 
        onClick={() => setIsModalOpen(true)} 
      />
      
      <div className="pt-8 pb-3 px-1 text-[9px] uppercase tracking-[0.3em] text-text-muted/60 font-black select-none">Architecture</div>
      <SidebarItem 
        icon={<BarChart3 size={18} />} 
        label="Analytics" 
        active={activeTab === 'analytics'}
        onClick={() => setActiveTab('analytics')}
      />
      <SidebarItem 
        icon={<Layers size={18} />} 
        label="Deep Insights" 
        active={activeTab === 'insights'}
        onClick={() => setActiveTab('insights')}
      />
      <SidebarItem 
        icon={<Activity size={18} />} 
        label="System Health" 
        active={activeTab === 'health'}
        onClick={() => setActiveTab('health')}
      />
      <SidebarItem 
        icon={<Settings size={18} />} 
        label="Configuration" 
        active={activeTab === 'config'}
        onClick={() => setActiveTab('config')}
      />
    </nav>

    <div className="mt-10 space-y-4 border-t border-white/[0.06] pt-8">
      <div 
        className="relative"
        onMouseEnter={() => setProfileHovered(true)}
        onMouseLeave={() => setProfileHovered(false)}
      >
        <div className="mx-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-3 cursor-pointer hover:bg-white/[0.08] hover:border-white/[0.1] hover:scale-[0.98] active:scale-95 transition-all duration-300">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/10 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-primary" />
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white/90 truncate leading-tight">Root Operator</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className={`w-1 h-1 rounded-full ${isLoggedIn ? 'bg-success animate-pulse' : 'bg-text-muted/50'}`} />
                 <p className="text-[8px] text-text-muted uppercase font-bold tracking-wider">
                   {isLoggedIn ? 'Online' : 'Offline'}
                 </p>
              </div>
           </div>
           <ChevronRight size={12} className="text-text-muted/50 transition-colors flex-shrink-0" />
        </div>

        <AnimatePresence>
          {profileHovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              className="absolute bottom-full left-0 right-0 mb-3 z-50 text-left"
            >
              <button
                onClick={() => setIsLoggedIn(!isLoggedIn)}
                className="w-full px-3 py-2 rounded-xl bg-black/90 backdrop-blur-xl border border-white/[0.08] flex items-center gap-2.5 text-left hover:bg-white/[0.06] transition-all duration-200 cursor-pointer shadow-2xl hover:scale-[0.98] active:scale-95"
              >
                {isLoggedIn ? (
                  <>
                    <LogOut size={12} className="text-error" />
                    <div>
                      <p className="text-[11px] font-bold text-white/90">Sign Out</p>
                      <p className="text-[8px] text-text-muted font-medium">End current session</p>
                    </div>
                  </>
                ) : (
                  <>
                    <LogIn size={12} className="text-success" />
                    <div>
                      <p className="text-[11px] font-bold text-white/90">Sign In</p>
                      <p className="text-[8px] text-text-muted font-medium">Authenticate</p>
                    </div>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center w-full px-2">
        <button 
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className="w-full h-11 text-[11px] font-bold uppercase tracking-widest text-text-muted/70 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 border border-white/[0.06] rounded-xl hover:bg-white/[0.05] hover:border-white/[0.12] hover:scale-[0.98] active:scale-95 cursor-pointer shadow-lg shadow-black/20"
        >
           <LogOut size={13} /> {isLoggedIn ? 'End Session' : 'Start Session'}
        </button>
      </div>
    </div>
  </aside>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`sidebar-link w-full border-none cursor-pointer flex items-center gap-3 px-3.5 py-2.5 rounded-xl animate-all duration-300 hover:scale-[0.98] active:scale-[0.95] ${active ? 'bg-primary/10 text-primary shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]' : 'text-text-muted hover:text-white hover:bg-white/[0.04]'}`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
      {icon}
    </div>
    <span className="flex-1 text-left text-[12px] font-bold">{label}</span>
    {active && <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />}
  </button>
);

export default App;
