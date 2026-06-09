'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Shield, Sparkles, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body text-[#1A1A1A]">
      
      {/* Title */}
      <div className="text-center mb-16">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Our Story</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
          About KAELORA
        </h1>
        <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 bg-white border border-[#EDE6DA] rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Left story content */}
        <div className="flex flex-col gap-5">
          <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Timeless Splendor</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold uppercase tracking-wider text-[#1A1A1A] leading-tight">
            Elegance Made <br />
            Completely Accessible
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-body">
            Founded with the singular objective of delivering premium fashion jewellery without the customary designer markups, KAELORA bridges high-end editorial aesthetics and everyday tarnish-free durability. 
          </p>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-body">
            Each collection is thoughtfully crafted using high-quality fashion jewellery materials designed for lasting shine, resulting in brilliant finishes that remain secure for sensitive skin types. From pave butterfly drops to heavy wrist bangles, every article is chosen to complement your personal elegance.
          </p>
          <div className="w-16 h-[1.5px] bg-[#D4AF37] my-2" />
          <p className="text-xs italic tracking-wide text-gray-400 font-body">
            &quot;We believe that every woman deserves to shine in timeless splendor every single day, without breaking the bank.&quot;
          </p>
        </div>

        {/* Right floating collage */}
        <div className="relative flex justify-center py-10">
          {/* Circular border */}
          <div className="relative w-72 h-72 rounded-full border border-dashed border-[#D4AF37]/30 flex items-center justify-center bg-[#F8F5F0]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 border border-dashed border-[#D4AF37]/20 rounded-full"
            />
            {/* Center avatar */}
            <div className="w-56 h-56 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-gray-50 z-10">
              <Image 
                src="/images/logo-burgundy.jpg" 
                alt="KAELORA Designer Curation" 
                width={224} 
                height={224} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute top-2 right-2 text-2xl animate-bounce">👑</div>
          </div>
        </div>
      </div>

      {/* Grid of Values */}
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Exquisite Curation</span>
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
          Our Brand Pillars
        </h2>
        <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {[
          {
            title: 'Tarnish Resistant',
            desc: 'Premium crafted structures specifically engineered to remain waterproof and tarnish-free through showers and active daily lives.',
            icon: Sparkles
          },
          {
            title: 'Hypoallergenic',
            desc: 'Utilizing premium surgical stainless steel cores to completely eliminate nickel, lead, and green-skin reactions.',
            icon: Shield
          },
          {
            title: 'Cubic Zirconia',
            desc: 'Adorned with top-grade AAA brilliant-cut cubic zirconia crystals and shell pearl accents that shimmer like diamonds.',
            icon: Award
          },
          {
            title: 'Customer C concierge',
            desc: 'Full-time support operations, dispatch estimations, local database storage, and a robust admin dashboard.',
            icon: Heart
          }
        ].map((v) => {
          const Icon = v.icon;
          return (
            <div
              key={v.title}
              className="bg-white p-6 rounded-2xl border border-[#EDE6DA] text-center flex flex-col items-center gap-3.5 hover:shadow-md transition-shadow shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-[#EDE6DA]/30 flex items-center justify-center text-[#D4AF37]">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] font-serif">{v.title}</h4>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed font-body">{v.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="bg-[#1A1A1A] border border-[#D4AF37]/30 rounded-3xl p-8 sm:p-12 text-[#EDE6DA] text-center max-w-4xl mx-auto flex flex-col items-center gap-4 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)] animate-pulse" />
        
        <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold relative z-10">Luxury Collections</span>
        <h3 className="text-2xl font-serif uppercase tracking-wider relative z-10">Discover The Collection</h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed font-body relative z-10">
          Elevate your daily ensembles or secure the perfect complimentary gift lookbook for someone special. Standard delivery is free above ₹400.
        </p>

        <Link
          href="/shop"
          className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#c49e2f] text-[#1A1A1A] text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 mt-4 relative z-10"
        >
          Shop Collection Now
        </Link>
      </div>

    </div>
  );
}
