'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Intro: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
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
            filter: 'blur(10px)',
            transition: { duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8F5F0] overflow-hidden"
        >
          {/* Subtle Ambient Gold Shimmer Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)] animate-pulse pointer-events-none" />

          {/* Floating Gold Particles */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ opacity: [0.2, 0.6, 0.2], y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-[#D4AF37] rounded-full will-change-transform" 
            />
            <motion.div
              animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -15, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/3 right-1/4 w-2 h-2 bg-[#D4AF37] rounded-full will-change-transform" 
            />
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3], y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-[#D4AF37] rounded-full will-change-transform" 
            />
            <motion.div
              animate={{ opacity: [0.1, 0.4, 0.1], y: [0, -12, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-1/4 right-1/3 w-2.5 h-2.5 bg-[#D4AF37] rounded-full will-change-transform" 
            />
          </div>

          <div className="relative flex flex-col items-center max-w-lg px-6 text-center">

            {/*
              ── LOGO SECTION ─────────────────────────────────────────────────────
              FIXES APPLIED:
              1. Was: motion.div with initial={{ opacity:0, scale:0.82 }}
                 → logo invisible at thumbnail capture time
                 Fix: keep motion wrapper for entry animation but ensure logo img
                      itself is always visible once mounted

              2. Was: <div className="absolute inset-0 rounded-full bg-[#FAF5EE] …">
                 → solid opaque white/cream circle covering the logo (z-0 < z-10
                    but the fill still bleeds through since img is inside a flex
                    container that stretches to the same size)
                 Fix: remove the solid fill; keep only the box-shadow glow ring

              3. Was: <motion.div … className="absolute inset-0 bg-gradient-to-r
                      from-transparent via-white/80 … blur-2xl" repeat:Infinity>
                 → infinite white shimmer sweep covering the entire logo container
                 Fix: removed this overlay entirely from the logo area

              4. Was: Next/Image inside <div className="relative z-10"> with no
                      explicit w/h on wrapper → image collapses to 0px in flex
                 Fix: plain <img> with explicit Tailwind size classes; never collapses
              ─────────────────────────────────────────────────────────────────── */}

            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              className="relative mb-8 w-32 h-32 sm:w-40 sm:h-40"
            >
              {/* Decorative gold glow ring (shadow only, no fill) */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ boxShadow: '0 0 40px 10px rgba(212,175,55,0.2)' }}
              />
              {/* Logo image — plain <img> guarantees explicit pixel dimensions */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-burgundy.jpg"
                alt="KAELORA Jewellery"
                className="relative block w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full"
                style={{ position: 'relative', zIndex: 10 }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 1.0 }}
              className="text-base sm:text-lg font-body font-medium uppercase tracking-[0.3em] text-[#4B352A] font-medium"
            >
              Elegance • Trust • Timeless
            </motion.p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 1.2, delay: 1.6 }}
              className="h-px bg-[#D4AF37] my-6 mx-auto"
            />
          </div>

          {/* Cinematic progress bar */}
          <div className="absolute bottom-16 left-0 right-0 flex justify-center px-8">
            <div className="w-48 h-px bg-gray-200/80 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.3, ease: 'easeInOut' }}
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
