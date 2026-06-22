"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loadingAuth, logout } = useApp();
  const router = useRouter();



  // State for mobile menu and hydration guard
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by rendering only after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!loadingAuth) {
      if (!user) {
        router.push('/');
        return;
      }
      if (!(user.role === 'admin' || user.isAdmin)) {
        router.push('/');
      }
    }
  }, [user, loadingAuth, router]);

  if (loadingAuth) return null;
if (!mounted) return null;

  return (
    <div className="min-h-dvh bg-[#FFFDFC]">
      <header className="border-b border-amber-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-display font-normal tracking-wide text-[#1A1A1A]">
            KAELORA Admin
          </Link>
          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:text-[#D4AF37] transition-colors"
            aria-label="Toggle admin menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-black">Dashboard</Link>
            <Link href="/admin/orders" className="text-sm text-gray-600 hover:text-black">Orders</Link>
            <Link href="/admin/products" className="text-sm text-gray-600 hover:text-black">Products</Link>
            <Link href="/admin/users" className="text-sm text-gray-600 hover:text-black">Users</Link>
            <Link href="/admin/analytics" className="text-sm text-gray-600 hover:text-black">Analytics</Link>
            <Link href="/admin/reviews" className="text-sm text-gray-600 hover:text-black">Reviews</Link>
            <Link href="/admin/settings" className="text-sm text-gray-600 hover:text-black">Settings</Link>
            <button
              onClick={async () => { await logout({ silent: true }); router.push('/'); }}
              className="ml-4 px-3 py-2 rounded-lg bg-[#1A1A1A] text-[#EDE6DA] text-xs font-semibold"
            >
              Sign Out
            </button>
          </nav>
        </div>
        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#FFFDFC] border-t border-amber-100"
            >
              <nav className="flex flex-col px-4 py-2 space-y-2">
                <Link href="/admin" className="text-sm text-gray-600 hover:text-black" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link href="/admin/orders" className="text-sm text-gray-600 hover:text-black" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                <Link href="/admin/products" className="text-sm text-gray-600 hover:text-black" onClick={() => setMobileMenuOpen(false)}>Products</Link>
                <Link href="/admin/users" className="text-sm text-gray-600 hover:text-black" onClick={() => setMobileMenuOpen(false)}>Users</Link>
                <Link href="/admin/analytics" className="text-sm text-gray-600 hover:text-black" onClick={() => setMobileMenuOpen(false)}>Analytics</Link>
                <Link href="/admin/reviews" className="text-sm text-gray-600 hover:text-black" onClick={() => setMobileMenuOpen(false)}>Reviews</Link>
                <Link href="/admin/settings" className="text-sm text-gray-600 hover:text-black" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                <button
                  onClick={async () => { await logout({ silent: true }); router.push('/'); }}
                  className="mt-2 px-3 py-2 rounded-lg bg-[#1A1A1A] text-[#EDE6DA] text-xs font-semibold"
                >
                  Sign Out
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}