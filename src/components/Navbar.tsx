'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, Shield, Instagram, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { user, cart, wishlist, logout, setAuthModalOpen } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // Sticky Navbar background color trigger on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on page navigate
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Earrings', href: '/shop?category=earrings' },
    { name: 'Chains', href: '/shop?category=chains' },
    { name: 'Bangles', href: '/shop?category=bangles' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-serif bg-[#F8F5F0]/95 backdrop-blur-md ${scrolled ? 'shadow-md' : ''}`}
      >
        {/* Announcement Bar embedded when not scrolled */}
        {!scrolled && (
          <div className="absolute top-0 left-0 right-0 bg-[#1A1A1A] py-1 text-center select-none overflow-hidden">
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] sm:text-xs text-[#EDE6DA] font-body tracking-[0.18em] uppercase px-4 font-semibold truncate animate-pulse"
            >
              ✨ Buy Any 3 Products & Receive A Complimentary Gift From KAELORA ✨
            </motion.p>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-1 sm:px-3 lg:px-4 flex items-center justify-between py-3 sm:py-4 lg:py-5">
          
          {/* LEFT: Branding Brand Logo */}
          <div className="flex items-center h-full flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group min-w-fit overflow-visible">
              <Image
                src="/images/logo-burgundy.jpg"
                alt="KAELORA Jewellery"
                width={96}
                height={96}
                className="h-auto max-h-16 w-auto object-contain flex-shrink-0"
              />
              <div className="hidden md:flex flex-col justify-center items-center min-w-fit overflow-visible whitespace-nowrap ml-0.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-[0.12em] text-[#1A1A1A] uppercase group-hover:text-[#D4AF37] transition-colors duration-300 leading-none">
                  KAELORA
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-[0.2em] font-body text-[#4B352A] uppercase leading-none">
                  JEWELLERY
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Premium Navigation Container */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <nav className="flex items-center gap-1 sm:gap-2 lg:gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm border border-[#D4AF37]/20 rounded-full shadow-lg shadow-[#D4AF37]/5 hover:shadow-[#D4AF37]/10 transition-all duration-300">
              {navLinks.map((link) => {
                const active = pathname === link.href || (link.href !== '/' && pathname.includes(link.href.split('?')[0]));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-3 py-1.5 leading-none text-xs sm:text-sm font-medium font-body uppercase tracking-[0.12em] transition-all duration-300 rounded-full ${
                      active 
                        ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/8' 
                        : 'text-[#1A1A1A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-[#1A1A1A]">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:text-[#D4AF37] transition-colors duration-300"
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
            </button>

            {/* Profile Dashboard Dashboard */}
            {user ? (
              <div className="relative group py-2">
                <Link
                  href={user.isAdmin ? '/admin' : '/account'}
                  className="p-2 flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors"
                >
                  <User className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                  {user.isAdmin && <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </Link>
                {/* Profile Hover Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-44 bg-[#F8F5F0] border border-[#EDE6DA] shadow-xl rounded-xl p-2 hidden group-hover:block transition-all duration-300">
                  <Link
                    href={user.isAdmin ? '/admin' : '/account'}
                    className="w-full text-left block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#EDE6DA] rounded-lg transition-colors font-body"
                  >
                    {user.isAdmin ? 'Admin Panel' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-700 hover:bg-red-50 rounded-lg transition-colors font-body"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="p-2 hover:text-[#D4AF37] transition-colors duration-300"
                aria-label="Account"
              >
                <User className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              </button>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 hover:text-[#D4AF37] transition-colors duration-300 relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#D4AF37] text-white text-[9px] font-bold font-body rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="p-2 hover:text-[#D4AF37] transition-colors duration-300 relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#1A1A1A] text-[#EDE6DA] text-[9px] font-bold font-body rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            <a
              href="https://www.instagram.com/kaelora.jewellery"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex p-2 rounded-full hover:text-[#D4AF37] transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61590032346143"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex p-2 rounded-full hover:text-[#D4AF37] transition-colors duration-300"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
            </a>

            {/* Mobile Hamburguer */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden hover:text-[#D4AF37] transition-colors"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* ----------------------------------------------------
            SEARCH OVERLAY DRAWER
            ---------------------------------------------------- */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-full left-0 right-0 bg-[#F8F5F0] border-b border-[#EDE6DA] py-4 px-4 sm:px-8 shadow-lg overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search earrings, chains, bangles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow bg-white border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-body"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1A1A1A] text-[#EDE6DA] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#2A2A2A] transition-colors font-body"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ----------------------------------------------------
          MOBILE MENU SLIDER DRAWER
          ---------------------------------------------------- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 h-full bg-[#F8F5F0] shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div className="flex flex-col gap-6 mt-12">
                <div className="flex items-center gap-3 border-b border-[#EDE6DA] pb-4 mb-2">
                  <Image
                    src="/images/logo-burgundy.jpg"
                    alt="KAELORA Jewellery"
                    width={45}
                    height={45}
                    className="h-[45px] w-auto object-contain flex-shrink-0"
                  />
                  <span className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">Kaelora Jewellery</span>
                </div>
                
                {/* Links */}
                <nav className="flex flex-col gap-4 text-sm font-semibold uppercase tracking-widest text-[#1A1A1A] font-body">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="py-2 border-b border-gray-100 hover:text-[#D4AF37] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Link
                    href="/about"
                    className="py-2 border-b border-gray-100 hover:text-[#D4AF37] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    className="py-2 border-b border-gray-100 hover:text-[#D4AF37] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </nav>
              </div>

              {/* Drawer Footer info */}
              <div className="flex flex-col gap-4 border-t border-[#EDE6DA] pt-4 mt-8">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-500 font-body">Logged in as {user.displayName}</p>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 bg-red-50 text-red-700 font-semibold text-xs uppercase tracking-wider rounded-xl text-center border border-red-100 font-body"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 bg-[#1A1A1A] text-[#EDE6DA] font-semibold text-xs uppercase tracking-wider rounded-xl text-center shadow-md font-body"
                  >
                    Login / Register
                  </button>
                )}
                <div className="flex items-center justify-center gap-3">
                <a
                  href="https://www.instagram.com/kaelora.jewellery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-[#1A1A1A] text-[#EDE6DA] hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61590032346143"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-[#1A1A1A] text-[#EDE6DA] hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
              <p className="text-[10px] text-gray-400 text-center font-body">Elegant • Affordable • Beautiful</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Navbar;
