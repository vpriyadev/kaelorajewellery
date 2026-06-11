'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Toast: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isReward = toast.type === 'reward';
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-colors duration-200 ${
                isReward
                  ? 'bg-[#1A1A1A]/95 text-[#EDE6DA] border-[#D4AF37]/50 shadow-[#D4AF37]/10'
                  : toast.type === 'success'
                  ? 'bg-white/95 text-[#1A1A1A] border-amber-100 shadow-gray-200/50'
                  : toast.type === 'error'
                  ? 'bg-red-50/95 text-red-800 border-red-100 shadow-red-100/30'
                  : 'bg-white/95 text-[#1A1A1A] border-amber-100 shadow-gray-200/50'
              }`}
            >
              {/* Icon Selector */}
              <div className="mt-0.5">
                {isReward && <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />}
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-[#D4AF37]" />}
              </div>

              {/* Text Body */}
              <div className="flex-1">
                {isReward && (
                  <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-0.5">
                    Loyalty Reward Unlocked
                  </p>
                )}
                <p className="text-sm font-medium leading-relaxed font-body">{toast.text}</p>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => dismissToast(toast.id)}
                className={`p-0.5 rounded-full hover:bg-gray-100/50 transition-colors ${
                  isReward ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
export default Toast;
