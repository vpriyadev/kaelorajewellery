'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export const Intro: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Elegant timing: 3.5 seconds display, then fade out
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.08,
            filter: "blur(10px)",
            transition: { duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8F5F0] overflow-hidden"
        >
          {/* Subtle Ambient Light Gold Shimmer Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)] animate-pulse" />

          {/* Floating Gold Particles Simulator */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-[#D4AF37]/40 rounded-full blur-[1px] animate-bounce" style={{ animationDuration: '6s' }} />
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-[#D4AF37]/30 rounded-full blur-[2px] animate-bounce" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-[#D4AF37]/50 rounded-full blur-[0.5px] animate-bounce" style={{ animationDuration: '5s' }} />
            <div className="absolute bottom-1/4 right-1/3 w-2.5 h-2.5 bg-[#D4AF37]/20 rounded-full blur-[3px] animate-bounce" style={{ animationDuration: '10s' }} />
          </div>

          <div className="relative flex flex-col items-center max-w-lg px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="relative w-28 h-28 sm:w-48 sm:h-48 md:w-[220px] md:h-[220px] mb-6 flex items-center justify-center overflow-visible"
            >
              <div className="absolute inset-0 rounded-full bg-[#FAF5EE] shadow-[0_0_120px_rgba(212,175,55,0.18)]" />
              <Image
                src="/images/logo-burgundy.jpg"
                alt="KAELORA Jewellery"
                width={220}
                height={220}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <motion.div
                initial={{ left: '-120%' }}
                animate={{ left: '120%' }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-70 blur-2xl"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 1.2 }}
              className="text-base sm:text-lg font-serif uppercase tracking-[0.3em] text-[#4B352A] font-semibold"
            >
              Elegance • Trust • Timeless
            </motion.p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 1.2, delay: 1.8 }}
              className="h-[1px] bg-[#D4AF37] my-6 mx-auto"
            />
          </div>

          {/* Elegant cinematic progress line indicator */}
          <div className="absolute bottom-16 left-0 right-0 flex justify-center px-8">
            <div className="w-48 h-[1px] bg-gray-200/80 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.3, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-[#EDE6DA] via-[#D4AF37] to-[#EDE6DA]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default Intro;
