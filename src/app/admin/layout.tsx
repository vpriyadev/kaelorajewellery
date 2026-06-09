"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loadingAuth, logout } = useApp();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-[#FFFDFC]">
      <header className="border-b border-[#EDE6DA] bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-serif font-bold text-[#1A1A1A]">KAELORA Admin</Link>
          <nav className="flex items-center gap-3">
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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}