'use client';

import React, { useState, useEffect } from 'react';
import { useApp, Address } from '../../context/AppContext';
import { serviceDb } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { User, MapPin, Package, Gift, Trash2, Calendar, ShieldCheck, ChevronRight, Award, Truck } from 'lucide-react';

export default function AccountPage() {
  const { user, logout, settings, setAuthModalOpen, triggerToast } = useApp();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  // Load addresses & orders
  useEffect(() => {
    if (user) {
      setLoadingAddr(true);
      serviceDb.getAddresses(user.uid).then((addr) => {
        setAddresses(addr);
        setLoadingAddr(false);
      });

      setLoadingOrders(true);
      serviceDb.getOrders(user.uid).then((ord) => {
        // Sort orders by date descending
        const sorted = ord.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(sorted);
        setLoadingOrders(false);
      });
    }
  }, [user]);

  const handleDeleteAddr = async (id: string) => {
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      triggerToast("Address successfully removed from book.", "success");
    } catch (err) {
      triggerToast("Failed to delete address.", "error");
    }
  };

  /* ----------------------------------------------------
      GUEST LOCKSCREEN INTERCEPT
      ---------------------------------------------------- */
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 font-body text-center">
        <div className="w-14 h-14 rounded-full bg-[#EDE6DA]/30 flex items-center justify-center mx-auto mb-6 border border-[#EDE6DA]">
          <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">User Dashboard</span>
        <h2 className="text-2xl font-serif font-semibold text-[#1A1A1A] uppercase tracking-wider mt-1.5 leading-tight">
          Dashboard Locked
        </h2>
        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed mt-3">
          Please log in to your account to review saved items, address books, reward status progress, and track dispatch order details.
        </p>

        <button
          onClick={() => setAuthModalOpen(true)}
          className="mt-8 w-full py-3.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#EDE6DA] text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
        >
          Login / Register Now
        </button>
      </div>
    );
  }

  // Reward Progress calculations
  const totalBought = user.rewardStatus?.totalItemsBought || 0;
  const isGiftUnlocked = totalBought >= settings.giftGoal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body text-[#1A1A1A]">
      
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Member Area</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
          My Account
        </h1>
        <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: DESKTOP TABS MENU */}
        <aside className="w-full lg:w-64 flex flex-col gap-2 bg-[#F8F5F0] border border-[#EDE6DA] rounded-2xl p-4 shadow-sm">
          <div className="p-3 border-b border-[#EDE6DA] mb-2 text-center sm:text-left">
            <h3 className="text-sm font-bold truncate">{user.displayName}</h3>
            <span className="text-[10px] text-gray-400 block truncate">{user.email}</span>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#1A1A1A] text-[#EDE6DA]'
                : 'hover:bg-white text-gray-600 hover:text-black border border-transparent hover:border-gray-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Rewards</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#1A1A1A] text-[#EDE6DA]'
                : 'hover:bg-white text-gray-600 hover:text-black border border-transparent hover:border-gray-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors ${
              activeTab === 'addresses'
                ? 'bg-[#1A1A1A] text-[#EDE6DA]'
                : 'hover:bg-white text-gray-600 hover:text-black border border-transparent hover:border-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Address Book ({addresses.length})</span>
          </button>

          {/* Admin panel bypass */}
          {user.isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-[#D4AF37] hover:bg-[#EDE6DA]/40 transition-colors border border-dashed border-[#D4AF37]/50 mt-2 flex items-center gap-2"
            >
              👑 Admin Dashboard
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-red-700 hover:bg-red-50 transition-colors mt-4 border border-transparent hover:border-red-100"
          >
            Sign Out
          </button>
        </aside>

        {/* RIGHT COLUMN: DETAIL TABS CONTENT DISPLAY */}
        <div className="flex-1 w-full bg-white border border-[#EDE6DA] rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* ----------------------------------------------------
              TAB 1: USER PROFILE & REWARDS
              ---------------------------------------------------- */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-serif font-semibold uppercase tracking-widest text-[#1A1A1A] border-b border-gray-100 pb-3">
                Member Profile Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-gray-100 pb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Registered Name:</span>
                  <span className="font-semibold text-sm">{user.displayName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Email Address:</span>
                  <span className="font-semibold text-sm">{user.email}</span>
                </div>
              </div>

              {/* LOYALTY PROGRESS TRACKING WIDGET */}
              <div>
                <h3 className="text-base font-serif font-semibold uppercase tracking-widest text-[#1A1A1A] mb-4">
                  Kaelora Club Reward Status
                </h3>

                <div className="bg-[#F8F5F0] border border-[#EDE6DA] rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-center">
                  <div className="w-14 h-14 rounded-full bg-[#EDE6DA] flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/50 shadow-md">
                    <Gift className="w-7 h-7" />
                  </div>

                  <div className="flex-grow flex flex-col gap-2.5 text-center sm:text-left w-full">
                    {isGiftUnlocked ? (
                      <div>
                        <h4 className="text-sm font-bold text-[#1A1A1A] flex items-center justify-center sm:justify-start gap-1">
                          <Award className="w-4 h-4 text-[#D4AF37]" />
                          <span>Premium Gift Unlocked!</span>
                        </h4>
                        <p className="text-xs text-emerald-800 font-semibold leading-relaxed mt-1">
                          🎉 Congratulations! You have purchased a total of **{totalBought}** products. Your next order will automatically package a complimentary premium KAELORA accessory!
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700">Rewards Status Progress</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Buy **{settings.giftGoal} jewellery items** to receive a beautiful complimentary gift! You have currently bought **{totalBought} / {settings.giftGoal} items.**
                        </p>
                      </div>
                    )}

                    {/* Progress slider */}
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden mt-1 shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-[#EDE6DA] to-[#D4AF37]"
                        style={{ width: `${Math.min(100, (totalBought / settings.giftGoal) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              TAB 2: ORDER HISTORY LISTINGS & ORDER TRACKER
              ---------------------------------------------------- */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-serif font-semibold uppercase tracking-widest text-[#1A1A1A] border-b border-gray-100 pb-3">
                My Purchases
              </h3>

              {loadingOrders ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" />
                </div>
              ) : orders.length > 0 ? (
                <div className="flex flex-col gap-8">
                  {orders.map((ord) => {
                    const statusColors = 
                      ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      ord.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-amber-50 text-amber-700 border-amber-100';
                    
                    return (
                      <div
                        key={ord.id}
                        className="border border-[#EDE6DA] rounded-2xl p-5 shadow-sm bg-white flex flex-col gap-4"
                      >
                        {/* Order card top banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EDE6DA]/40 pb-3 gap-2">
                          <div className="text-xs">
                            <span className="font-semibold text-[#1A1A1A] block">Order ID: <span className="font-mono font-bold text-gray-800">{ord.id}</span></span>
                            <span className="text-gray-400 text-[10px] mt-0.5 block">{new Date(ord.createdAt || '').toLocaleString('en-IN')}</span>
                          </div>
                          
                          {/* Order Status */}
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full border self-start ${statusColors}`}>
                            {ord.status}
                          </span>
                        </div>

                        {/* Order Track Progress flow */}
                        <div className="flex items-center justify-between w-full max-w-md mx-auto my-3 relative px-4">
                          {/* Connecting lines */}
                          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
                          <div
                            className="absolute top-1/2 left-4 h-0.5 bg-[#D4AF37] -translate-y-1/2 z-0 transition-all duration-500"
                            style={{
                              width: ord.status === 'delivered' ? '100%' : ord.status === 'shipped' ? '50%' : '0%'
                            }}
                          />
                          
                          {/* Status Nodes */}
                          {['processing', 'shipped', 'delivered'].map((step, idx) => {
                            const active = ord.status === step || 
                              (step === 'processing') || 
                              (step === 'shipped' && ord.status === 'delivered');
                            
                            return (
                              <div key={step} className="flex flex-col items-center gap-1.5 relative z-10">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                                  active 
                                    ? 'bg-[#1A1A1A] border-[#D4AF37] text-white scale-110 shadow-md' 
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                  {idx + 1}
                                </div>
                                <span className={`text-[9px] uppercase tracking-wider font-semibold capitalize ${
                                  active ? 'text-[#1A1A1A] font-bold' : 'text-gray-400'
                                }`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* List products in order */}
                        <div className="flex flex-col gap-3 py-2 border-b border-[#EDE6DA]/40">
                          {ord.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3.5 text-xs">
                              <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                              <div className="flex-grow min-w-0">
                                <h4 className="font-semibold text-gray-800 truncate">{item.productName}</h4>
                                <span className="text-[10px] text-gray-400">Quantity: {item.quantity}</span>
                              </div>
                              <span className="font-bold text-[#1A1A1A]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>

                        {/* Shipping details and totals footer */}
                        <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-500 gap-4 mt-1">
                          <div>
                            <span className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[10px] block mb-1">Shipping Recipient:</span>
                            <p className="font-semibold">{ord.shippingAddress.fullName}</p>
                            <p className="mt-0.5 text-gray-400 font-body text-[10px] leading-relaxed max-w-xs">{ord.shippingAddress.addressLine}, {ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.pincode}</p>
                          </div>
                          
                          <div className="sm:text-right flex flex-col sm:justify-end">
                            <span className="text-gray-400 font-semibold block mb-0.5">Grand Total Amount Paid:</span>
                            <span className="font-bold font-serif text-[#1A1A1A] text-sm">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">via {ord.paymentMethod}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-[#EDE6DA] rounded-xl p-4 bg-gray-50">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                    No order history available.
                  </p>
                  <button
                    onClick={() => router.push('/shop')}
                    className="mt-4 px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xl shadow-md"
                  >
                    Go To Showcase
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------
              TAB 3: ADDRESS BOOK MANAGEMENT
              ---------------------------------------------------- */}
          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-serif font-semibold uppercase tracking-widest text-[#1A1A1A] border-b border-gray-100 pb-3">
                Saved Shipping Profiles
              </h3>

              {loadingAddr ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border border-[#EDE6DA] rounded-2xl p-5 bg-[#F8F5F0] flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-shadow relative"
                    >
                      <div className="text-xs flex flex-col gap-1 pr-8">
                        <h4 className="font-bold text-[#1A1A1A] text-sm truncate flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{addr.fullName}</span>
                        </h4>
                        <span className="text-[10px] text-gray-400 font-bold block mt-1">Mobile: {addr.phone}</span>
                        <p className="text-gray-600 mt-2 font-medium leading-relaxed font-body">
                          {addr.addressLine}, <br />
                          {addr.city}, {addr.state} - <span className="font-bold text-[#1A1A1A]">{addr.pincode}</span>
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteAddr(addr.id)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white border border-gray-100 text-red-500 hover:bg-red-50 transition-colors shadow-sm active:scale-95"
                        title="Remove Saved Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-[#EDE6DA] rounded-xl p-4 bg-gray-50">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                    No shipping addresses registered.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal font-body">
                    Addresses are automatically saved to your account book during checkout operations.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
