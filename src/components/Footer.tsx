'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Send, Instagram, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✨ Thank you for subscribing to KAELORA Club newsletter!");
  };

  return (
    <footer className="bg-[#1A1A1A] text-[#EDE6DA] pt-16 pb-8 border-t border-[#D4AF37]/20 font-body relative overflow-hidden">
      {/* Decorative Golden Ambient Backlit */}
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#D4AF37]/5 blur-[80px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#EDE6DA]/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-800 pb-12">
          
          {/* COL 1: Logo & About description */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
              src="/images/logo-burgundy.jpg"
              alt="KAELORA Jewellery"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="font-display font-normal text-xl tracking-[0.2em] uppercase text-white group-hover:text-[#D4AF37] transition-colors">
                Kaelora
              </span>
              <span className="font-body font-normal text-[9px] tracking-[0.4em] uppercase text-[#C9A84C] -mt-1">
                Jewellery
              </span>
            </div>
            </Link>
            <p className="font-jakarta font-normal text-sm text-neutral-400 leading-relaxed max-w-xs mt-2">
              Discover beautiful earrings, chains and bangles designed to make every moment special. Elevate your everyday style with our affordable premium collections.
            </p>
            <p className="font-body font-normal text-[9px] tracking-[0.25em] uppercase text-[#C9A84C] mt-1">
              Elegant • Affordable • Beautiful
            </p>
          </div>

          {/* COL 2: Shop Category paths */}
          <div className="flex flex-col gap-4">
            <h4 className="font-body font-medium text-xs tracking-[0.2em] uppercase text-white border-l-2 border-[#C9A84C] pl-3">
              Shop Collections
            </h4>
            <ul className="flex flex-col gap-2.5 font-jakarta font-normal text-sm text-neutral-400">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors duration-200">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/shop?category=earrings" className="hover:text-white transition-colors duration-200">
                  Earrings Collection
                </Link>
              </li>
              <li>
                <Link href="/shop?category=chains" className="hover:text-white transition-colors duration-200">
                  Pendant Chains
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bangles" className="hover:text-white transition-colors duration-200">
                  Designer Bangles
                </Link>
              </li>
              <li>
                <Link href="/shop?featured=true" className="hover:text-white transition-colors duration-200">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3: Quick Policies */}
          <div className="flex flex-col gap-4">
            <h4 className="font-body font-medium text-xs tracking-[0.2em] uppercase text-white border-l-2 border-[#C9A84C] pl-3">
              Store Policies
            </h4>
            <ul className="flex flex-col gap-2.5 font-jakarta font-normal text-sm text-neutral-400">
              <li>
                <button onClick={() => alert("Free Delivery above ₹400 across all India pincodes. Orders are processed within 24 hours.")} className="hover:text-white text-left transition-colors duration-200">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => alert("We support returns and exchanges within 7 days of delivery. Jewellery items must be unworn and in original tags.")} className="hover:text-white text-left transition-colors duration-200">
                  Returns & Exchange
                </button>
              </li>
              <li>
                <button onClick={() => alert("Your payments are 100% encrypted. We support Visa, Mastercard, Google Pay and UPI transactions.")} className="hover:text-white text-left transition-colors duration-200">
                  Payment Security
                </button>
              </li>
              <li>
                <button onClick={() => alert("We utilize AAA quality cubic zirconia crystals, hypoallergenic surgical steel, and pure 18k gold double-plating.")} className="hover:text-white text-left transition-colors duration-200">
                  Product Materials Care
                </button>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors duration-200">
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 4: Newsletter Subscription */}
          <div className="flex flex-col gap-4">
            <h4 className="font-body font-medium text-xs tracking-[0.2em] uppercase text-white border-l-2 border-[#C9A84C] pl-3">
              Luxury Club
            </h4>
            <p className="font-jakarta font-normal text-sm text-neutral-400 leading-relaxed">
              Subscribe to unlock early access, birthday gifts, and custom trend reports.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center mt-1">
              <input
                type="email"
                required
                placeholder="Your email address"
                className="flex-grow border border-neutral-700 bg-neutral-800 rounded-l-full px-4 py-2 font-jakarta font-normal text-sm focus:outline-none focus:border-[#C9A84C] text-white placeholder-neutral-500"
              />
              <button
                type="submit"
                className="bg-[#C9A84C] hover:bg-[#b8962e] text-[#1A1A1A] px-4 py-2 rounded-r-full transition-colors duration-200 flex items-center justify-center"
                aria-label="Subscribe"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Social Media Link Icons */}
            <div className="flex items-center gap-4 mt-3">
              <a
                href="https://www.instagram.com/kaelora.jewellery"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800 hover:bg-[#C9A84C] hover:text-[#1A1A1A] rounded-full transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61590032346143"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800 hover:bg-[#C9A84C] hover:text-[#1A1A1A] rounded-full transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/916305517109?text=Hello%20KAELORA%20Jewellery%2C%20I'm%20interested%20in%20your%20jewellery%20collection."
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-neutral-800 hover:bg-[#C9A84C] hover:text-[#1A1A1A] rounded-full transition-colors duration-200 font-medium text-xs flex items-center justify-center font-body font-medium text-[#D4AF37]"
              >
                WA
              </a>
            </div>
          </div>

        </div>

        {/* Footer Sub-Info Row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between font-jakarta font-normal text-xs text-neutral-500 tracking-wide gap-4">
          <p>© {currentYear} KAELORA Jewellery Store. All Rights Reserved. Crafted for Timeless Elegance.</p>
          
          <div className="flex items-center gap-6">
            <span>Phone: +91 6305517109</span>
            <span>Email: jashujash1107@gmail.com</span>
            <span>Chittoor, Andhra Pradesh, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
