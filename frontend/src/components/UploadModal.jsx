import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  File, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { uploadInvoice } from '../services/api';

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [progress, setProgress] = useState(0);
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
    setProgress(0);
    setLoadingStep('Initializing AI Analysis...');

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + (prev < 50 ? 5 : 1);
      });
    }, 100);

    try {
      const result = await uploadInvoice(uploadFile);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.status === 'success') {
        setProgress(95);
        setLoadingStep('Synchronizing Data...');
        
        // Wait for parent to finish fetching
        try {
          await onSuccess(result.data);
        } catch(e) { }
        
        setProgress(100);
        setStatus('success');
        setLoadingStep('Analysis Complete');
        
        setTimeout(() => {
          onClose();
          setTimeout(() => {
            setFile(null);
            setStatus('idle');
            setUploading(false);
          }, 400);
        }, 1500);
      } else {
        setStatus('error');
        setError(result.message || 'Processing failed.');
        setUploading(false);
      }
    } catch (err) {
      setStatus('error');
      setError('Connection error or invalid file format.');
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(!uploading || status === 'success') ? onClose : undefined}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2rem] w-full max-w-md p-8 relative z-10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="heading-display text-2xl font-black">Upload Invoice</h3>
                <p className="text-xs text-text-muted mt-1 font-medium">Extract data using AI</p>
              </div>
              <button 
                disabled={uploading && status !== 'success'} 
                onClick={onClose} 
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-text-muted hover:bg-gray-100 hover:text-error transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Interactive Area */}
            <div className="flex flex-col gap-6">

              {/* Upload Zone OR Selected File Card */}
              {!file ? (
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[240px] ${
                    dragActive ? 'border-primary bg-primary-light scale-[0.98]' : 'border-border-medium hover:border-primary hover:bg-gray-50 group'
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-border-subtle flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Upload size={28} strokeWidth={1.5} />
                  </div>
                  <div className="text-center mt-2">
                    <p className="font-bold text-sm text-text-main">Click or drop file here</p>
                    <p className="text-xs text-text-muted mt-1.5 font-medium">Supports PDF, PNG, JPG (Max 10MB)</p>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-6">
                   {/* Selected File Card */}
                   <div className="p-4 rounded-2xl bg-gray-50 border border-border-subtle flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${status === 'success' ? 'bg-success text-white' : 'bg-white text-primary shadow-sm border border-border-subtle'}`}>
                         {status === 'success' ? <CheckCircle2 size={24} /> : <File size={24} strokeWidth={1.5} />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="font-bold text-sm text-text-main truncate pr-2">{file.name}</p>
                         <p className="text-xs text-text-muted mt-1 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      {(!uploading && status !== 'success') && (
                        <button onClick={() => setFile(null)} className="p-2.5 text-text-muted hover:text-error hover:bg-error-bg rounded-xl transition-colors">
                           <X size={18} />
                        </button>
                      )}
                   </div>

                   {/* Extracted Progress Visualizer */}
                   {(uploading || status === 'success') && (
                     <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{loadingStep}</span>
                           <span className="text-xs font-bold text-primary bg-white px-2 py-1 rounded-md shadow-sm border border-primary/10">{progress}%</span>
                        </div>
                        <div className="h-2.5 bg-primary/10 rounded-full overflow-hidden shadow-inner">
                           <motion.div 
                             className="h-full bg-primary"
                             initial={{ width: 0 }}
                             animate={{ width: `${progress}%` }}
                             transition={{ duration: 0.3, ease: 'easeOut' }}
                           />
                        </div>
                     </div>
                   )}
                </div>
              )}

              {/* Error Message Box */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="p-4 rounded-xl bg-error-bg border border-error/20 flex gap-3 text-error text-xs font-bold leading-relaxed items-start mt-2"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /> 
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Primary Action Button */}
              <button 
                disabled={!file || uploading || status === 'success'}
                onClick={() => triggerUploadSequence(file)}
                className={`btn-ai-gen w-full justify-center py-4 rounded-xl text-sm font-bold mt-4 transition-all ${
                  (!file || uploading || status === 'success') ? 'opacity-50 cursor-not-allowed bg-border-medium text-text-sub shadow-none' : 'shadow-xl shadow-primary/20 hover:-translate-y-1 bg-primary text-white'
                }`}
              >
                {uploading && status !== 'success' && <Loader2 size={18} className="animate-spin" />}
                {status === 'success' && <CheckCircle2 size={18} />}
                {!uploading && status !== 'success' && <Upload size={18} />}
                
                {uploading && status !== 'success' ? 'Processing Document...' : status === 'success' ? 'Data Extracted' : 'Start Extraction'}
              </button>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest mt-2 mb-2">
                <ShieldCheck size={14} className="text-success" /> 
                <span>Encrypted & Secured</span>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
