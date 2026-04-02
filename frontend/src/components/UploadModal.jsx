import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, File, CheckCircle2, AlertCircle, 
  Loader2, Zap, ArrowRight, MousePointer2, Database, ShieldCheck, Activity
} from 'lucide-react';
import { uploadInvoice } from '../services/api';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      triggerUploadSequence(selectedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      triggerUploadSequence(selectedFile);
    }
  };

  const triggerUploadSequence = async (uploadFile) => {
    if (!uploadFile) return;
    setUploading(true);
    setStatus('uploading');
    setError(null);
    setLoadingStep('Initializing Neural Link...');

    try {
      setTimeout(() => setLoadingStep('Extracting Payload Content...'), 1500);
      setTimeout(() => setLoadingStep('AI Deep Analysis In-Progress...'), 3000);

      const result = await uploadInvoice(uploadFile);
      
      if (result.status === 'success') {
        setStatus('success');
        setLoadingStep('Synchronization Complete');
        setTimeout(() => {
          onUploadSuccess(result.data);
          onClose();
          // Reset after closing animation
          setTimeout(() => {
            setFile(null);
            setStatus('idle');
            setUploading(false);
          }, 500);
        }, 1500);
      } else if (result.status === 'duplicate') {
        setStatus('error');
        setError('This specific invoice node has already been synchronized.');
        setUploading(false);
      } else {
        setStatus('error');
        setError(result.message || 'Deployment protocol failure.');
        setUploading(false);
      }
    } catch (err) {
      setStatus('error');
      let errMsg = 'Neural link error. Please verify backend stability.';
      // Check if backend returned 500 with proper error message
      if (err.response && err.response.data && err.response.data.detail) {
         errMsg = "Supabase Database Error: " + err.response.data.detail;
      }
      setError(errMsg);
      setUploading(false);
    }
  };
  
  const handleUpload = () => triggerUploadSequence(file);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-card w-full max-w-xl p-10 relative z-10 overflow-visible border-white/10"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                    <Zap size={18} className="text-primary" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black tracking-tight text-white">Neural Uplink</h3>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mt-1">Extraction Protocol Beta</p>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-all hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step Progress */}
            <div className="flex items-center justify-between mb-12 px-8 relative">
               <div className="absolute top-5 left-16 right-16 h-[1px] bg-white/10 z-0"></div>
               <Step circle={<Database size={14} />} label="Source" active={!file} current={file && status === 'idle'} />
               <Step circle={<Zap size={14} />} label="Analyze" active={status === 'uploading'} />
               <Step circle={<ShieldCheck size={14} />} label="Verify" active={status === 'success'} />
            </div>

            {/* Upload Area */}
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-500 flex flex-col items-center justify-center gap-6 group cursor-pointer active:scale-[0.98] ${dragActive ? 'border-primary bg-primary/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-white/20'} ${status === 'success' ? 'border-success bg-success/5' : ''}`}
              onClick={() => {
                console.log('Upload area clicked, status:', status);
                if (status === 'idle' || status === 'error') {
                  fileInputRef.current?.click();
                }
              }}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                onClick={(e) => e.stopPropagation()}
              />
              
              {!file ? (
                <>
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-700 shadow-xl shadow-black/20">
                     <Upload size={32} className="text-primary animate-pulse" />
                  </div>
                  <div className="text-center pointer-events-none">
                    <p className="font-black text-lg tracking-tight mb-1">Transmit Data Object</p>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest leading-loose">
                      Drop .pdf or image files here <br/> or <span className="text-primary underline cursor-pointer">browse filesystem</span>
                    </p>
                  </div>
                  <div className="badge badge-warning scale-90 opacity-40">
                     <MousePointer2 size={12} /> Link Active
                  </div>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center gap-6"
                >
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl relative border ${status === 'success' ? 'bg-success/20 border-success/40 text-success' : 'bg-primary/10 border-primary/30 text-primary animate-float'}`}>
                     {status === 'success' ? <CheckCircle2 size={40} /> : <File size={40} />}
                  </div>
                  <div className="text-center">
                    <p className="font-black text-xl tracking-tight mb-1 truncate max-w-sm">{file.name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest italic ${status === 'success' ? 'text-success' : 'text-primary/70'}`}>
                      {status === 'success' ? 'Entity Verified & Stored' : 'Node payload ready for deployment'}
                    </p>
                  </div>
                  {(status === 'idle' || status === 'error') && (
                    <button 
                      onClick={(e) => {
                         e.stopPropagation();
                         setFile(null);
                         setStatus('idle');
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-error transition-colors underline underline-offset-4"
                    >
                      Discard Object
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-10 space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error"
                  >
                    <AlertCircle size={16} />
                    <p className="text-xs font-bold tracking-tight">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={handleUpload}
                disabled={!file || uploading || status === 'success'}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${!file || uploading || status === 'success' ? 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-100 hover:shadow-primary/60'}`}
              >
                {uploading ? (
                  <>
                     <Loader2 size={18} className="animate-spin" /> {loadingStep}
                  </>
                ) : status === 'success' ? (
                  <>
                     <CheckCircle2 size={18} /> SYNC SUCCESSFUL
                  </>
                ) : (
                  <>
                     INITIATE DEPLOYMENT <ArrowRight size={18} />
                  </>
                )}
              </button>
              
              <div className="flex justify-center items-center gap-4 opacity-30">
                 <div className="h-px w-8 bg-white" />
                 <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em]">
                   Neural-SSL-Zero Transmission
                 </p>
                 <div className="h-px w-8 bg-white" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Step = ({ circle, label, active, current }) => (
  <div className={`relative flex flex-col items-center gap-3 z-10 transition-all duration-700 ${active || current ? 'opacity-100' : 'opacity-20'}`}>
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${active || current ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10'}`}>
       {circle}
    </div>
    <span className="text-[9px] uppercase tracking-widest font-black italic">{label}</span>
  </div>
);

export default UploadModal;
