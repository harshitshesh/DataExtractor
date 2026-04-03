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
        setStatus('success');
        setLoadingStep('Analysis Complete');
        setTimeout(() => {
          onSuccess(result.data);
          // Don't close immediately to show success state
          setTimeout(() => {
            onClose();
            setFile(null);
            setStatus('idle');
            setUploading(false);
          }, 1000);
        }, 500);
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
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-2xl w-full max-w-lg p-8 relative z-10 shadow-2xl border border-border-subtle"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="heading-display text-xl">Generate Invoice Data</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-text-muted transition-colors">
                <X size={20} />
              </button>
            </div>

            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer ${dragActive ? 'border-primary bg-primary-light' : 'border-border-medium hover:border-primary hover:bg-gray-50'}`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              
              {!file ? (
                <>
                  <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm mb-1">Click or drag invoice to upload</p>
                    <p className="text-xs text-text-muted">PDF, PNG or JPG max 10MB</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center ${status === 'success' ? 'bg-success-bg text-success' : 'bg-primary-light text-primary'}`}>
                      {status === 'success' ? <CheckCircle2 size={32} /> : <File size={32} />}
                   </div>
                   <p className="text-xs font-bold truncate max-w-[200px]">{file.name}</p>
                </div>
              )}

              {uploading && status !== 'success' && (
                <div className="w-full mt-4">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-primary mt-2 text-center uppercase tracking-widest">{loadingStep}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-error-bg border border-error/10 flex items-center gap-2 text-error text-xs font-bold">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="mt-8">
              <button 
                disabled={!file || uploading || status === 'success'}
                onClick={() => triggerUploadSequence(file)}
                className="btn-ai-gen w-full justify-center py-4"
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : 'Run AI Analysis'}
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 justify-center text-[10px] text-text-muted font-bold uppercase tracking-widest">
              <ShieldCheck size={12} className="text-success" /> Multi-vendor Intelligence Active
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
