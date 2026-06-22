'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, Shield, Instagram, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NavbarContent: React.FC = () => {
  const { user, cart, wishlist, logout, setAuthModalOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchActive, setMobileSearchActive] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

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
    { name: 'Home', href: '/', desc: 'Back to homepage' },
    { name: 'Shop', href: '/shop', desc: 'Browse all jewellery' },
    { name: 'Earrings', href: '/shop?category=earrings', desc: 'Studs, hoops & drops' },
    { name: 'Chains', href: '/shop?category=chains', desc: 'Delicate & bold chains' },
    { name: 'Bangles', href: '/shop?category=bangles', desc: 'Wrist essentials' },
    { name: 'About', href: '/about', desc: 'Our story & values' },
    { name: 'Contact', href: '/contact', desc: 'Get in touch with us' },
  ];

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8F5F0] border-b border-amber-100 flex flex-col md:block">
        
        {/* ================= MOBILE NAVBAR ================= */}
        <div className="md:hidden flex flex-col w-full">
          {/* ROW 1: Top Bar */}
          <div className="flex items-center justify-between h-14 px-4 w-full">
            <Link href="/" className="font-display font-normal text-xl tracking-[0.15em] text-[#1A1A1A]">
              KAELORA
            </Link>
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <Link href={user?.isAdmin ? '/admin' : '/account'} className="hover:text-[#D4AF37] transition-colors"><User className="w-4 h-4" /></Link>
              <Link href="/wishlist" className="hover:text-[#D4AF37] transition-colors"><Heart className="w-4 h-4" /></Link>
              <Link href="/cart" className="hover:text-[#D4AF37] transition-colors"><ShoppingBag className="w-4 h-4" /></Link>
              <a href="https://www.instagram.com/kaelora.jewellery" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-[#D4AF37] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61590032346143" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-[#D4AF37] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="hover:text-[#D4AF37] transition-colors" aria-label="Open menu">
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* ROW 2: Search Bar Row */}
          <div className="w-full px-4 pb-2 h-11">
            {mobileSearchActive ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search earrings, chains, bangles..."
                  className="flex-grow rounded-full px-4 py-2 text-xs font-body text-[#1A1A1A] placeholder-neutral-400 focus:outline-none"
                  style={{
                    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #a78f5f, #D4AF37, #f5e6a3, #b8962e) border-box',
                    border: '1.5px solid transparent',
                  }}
                />
                <button type="button" onClick={() => setMobileSearchActive(false)}
                  className="text-neutral-400 p-1">
                  <X className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setMobileSearchActive(true)}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body text-neutral-400 tracking-wide"
                style={{
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #a78f5f, #D4AF37, #f5e6a3, #b8962e, #D4AF37) border-box',
                  border: '1.5px solid transparent',
                }}
              >
                <Search className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Search earrings, chains, bangles...</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= DESKTOP NAVBAR ================= */}
        <div className="hidden md:flex max-w-7xl mx-auto w-full items-center justify-between h-16 px-6">
          
          {/* LEFT: Branding Brand Logo */}
          <div className="flex items-center h-full flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group min-w-fit overflow-visible">
              <Image
                src="/images/logo-burgundy.jpg"
                alt="KAELORA Jewellery"
                width={96}
                height={96}
                priority
                sizes="96px"
                className="h-auto max-h-16 w-auto object-contain flex-shrink-0"
              />
              <div className="hidden md:flex flex-col justify-center min-w-fit overflow-visible whitespace-nowrap ml-0.5">
                <span className="text-2xl sm:text-3xl font-display font-normal tracking-[0.12em] text-[#1A1A1A] uppercase group-hover:text-[#C9A84C] transition-colors duration-300 leading-none">
                  KAELORA
                </span>
                <span className="text-xs tracking-[0.4em] font-body font-normal text-[#4B352A] uppercase leading-none mt-1">
                  JEWELLERY
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Premium Navigation Container */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => {
                const currentFull = pathname + (searchParams?.toString() ? '?' + searchParams.toString() : '');
                const active = link.href === '/'
                  ? pathname === '/'
                  : currentFull === link.href
                    || (
                        !link.href.includes('?') && 
                        pathname === link.href
                       );
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative py-1 text-sm font-body uppercase tracking-[0.1em] transition-colors duration-200 focus:outline-none outline-none border-none bg-transparent ${
                      active 
                        ? 'text-[#C9A84C] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[#C9A84C] after:rounded-full' 
                        : 'text-[#1A1A1A] font-normal hover:text-[#C9A84C]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 text-[#1A1A1A]">
            {/* Search Icon */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:text-[#C9A84C] transition-colors duration-300" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>

            {/* Profile Dashboard Dashboard */}
            {user ? (
              <div className="relative group py-2">
                <Link
                  href={user.isAdmin ? '/admin' : '/account'}
                  className="p-2 flex items-center gap-1.5 hover:text-[#C9A84C] transition-colors"
                >
                  <User className="w-5 h-5" />
                  {user.isAdmin && <Shield className="w-3.5 h-3.5 text-[#C9A84C]" />}
                </Link>
                {/* Profile Hover Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-44 bg-[#F8F5F0] border border-amber-100 shadow-xl rounded-xl p-2 hidden group-hover:block transition-colors duration-200">
                  <Link
                    href={user.isAdmin ? '/admin' : '/account'}
                    className="w-full text-left block px-3 py-2 text-xs font-medium uppercase tracking-wider text-[#1A1A1A] hover:bg-[#EDE6DA] rounded-lg transition-colors font-body"
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
                className="p-2 hover:text-[#C9A84C] transition-colors duration-300"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 hover:text-[#C9A84C] transition-colors duration-300 relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#C9A84C] text-white text-[9px] font-normal font-body rounded-full flex items-center justify-center shadow-md">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="p-2 hover:text-[#C9A84C] transition-colors duration-300 relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#1A1A1A] text-[#EDE6DA] text-[9px] font-normal font-body rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

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
              className="hidden md:block absolute top-full left-0 right-0 bg-[#F8F5F0] border-b border-amber-100 py-4 px-4 sm:px-8 shadow-lg overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search earrings, chains, bangles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow bg-white border border-amber-100 rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-body"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1A1A1A] text-[#EDE6DA] text-xs font-medium uppercase tracking-wider rounded-xl hover:bg-[#2A2A2A] transition-colors font-body"
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] md:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="absolute top-0 right-0 w-[80vw] max-w-xs h-full bg-[#F8F5F0] flex flex-col shadow-2xl z-10"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-amber-100">
                <span className="font-display font-normal text-lg tracking-[0.15em] text-[#1A1A1A]">
                  KAELORA
                </span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:text-[#D4AF37] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col px-6 py-4 gap-1 flex-grow overflow-y-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3.5 border-b border-neutral-100 flex flex-col gap-0.5 group"
                  >
                    <span className="text-sm font-body font-medium uppercase tracking-[0.15em] text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">
                      {link.name}
                    </span>
                    <span className="text-xs font-body font-normal text-neutral-400 tracking-wide normal-case">
                      {link.desc}
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Drawer Footer */}
              <div className="px-6 py-5 border-t border-amber-100 flex flex-col gap-3">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-neutral-400 font-body">
                      {user.displayName}
                    </p>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full py-2.5 bg-red-50 text-red-700 text-xs font-body font-medium uppercase tracking-wider rounded-xl border border-red-100"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full py-3 bg-[#1A1A1A] text-[#EDE6DA] text-xs font-body font-medium uppercase tracking-[0.15em] rounded-full"
                  >
                    Login / Register
                  </button>
                )}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <a href="https://www.instagram.com/kaelora.jewellery" target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#1A1A1A] text-white hover:bg-[#D4AF37] transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61590032346143" target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#1A1A1A] text-white hover:bg-[#D4AF37] transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-neutral-400 text-center font-body tracking-widest">
                  ELEGANT • AFFORDABLE • BEAUTIFUL
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export const Navbar: React.FC = () => {
  return (
    <Suspense fallback={<div className="h-16 bg-[#F8F5F0] border-b border-amber-100" />}>
      <NavbarContent />
    </Suspense>
  );
};

export default Navbar;
