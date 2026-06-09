'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { serviceDb, Order, Address } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { User, MapPin, Package, Gift, Trash2, ShieldCheck, Award, Edit2, X } from 'lucide-react';
import { validateAddressForm, formatPhone, formatPincode, parseSafeDate } from '../../lib/validation';

export default function AccountPage() {
  const { user, loadingAuth, authModalOpen, logout, settings, setAuthModalOpen, triggerToast, deleteAddress, updateAddress, addAddress, cancelOrder, justSignedOut } = useApp();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productLookup, setProductLookup] = useState<Record<string, string>>({});
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  // Address form modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });

  // Load addresses & orders
  useEffect(() => {
    if (!user?.uid) return;
    
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

    serviceDb.getProducts().then((products) => {
      const lookup: Record<string, string> = {};
      products.forEach((product) => {
        lookup[product.id] = product.name || '';
      });
      setProductLookup(lookup);
    });
  }, [user]);

  const handleDeleteAddr = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      triggerToast("Address deleted successfully.", "success");
    } catch {
      triggerToast("Failed to delete address.", "error");
    }
  };

  const openAddressModal = (addressToEdit?: Address) => {
    if (addressToEdit) {
      setEditingAddressId(addressToEdit.id);
      setFormData({
        fullName: addressToEdit.fullName || '',
        phone: addressToEdit.phone || '',
        addressLine1: addressToEdit.addressLine1 || addressToEdit.addressLine || '',
        addressLine2: addressToEdit.addressLine2 || '',
        city: addressToEdit.city || '',
        state: addressToEdit.state || '',
        pincode: addressToEdit.pincode || '',
        country: addressToEdit.country || 'India',
        isDefault: addressToEdit.isDefault || false
      });
    } else {
      setEditingAddressId(null);
      setFormData({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false
      });
    }
    setFormErrors({});
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddressId(null);
    setFormData({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: false
    });
    setFormErrors({});
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSaveAddress = async () => {
    const validation = validateAddressForm({
      fullName: formData.fullName,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: formData.country
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      const addressData = {
        fullName: formData.fullName,
        phone: formatPhone(formData.phone),
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formatPincode(formData.pincode),
        country: formData.country,
        isDefault: formData.isDefault
      };

      if (editingAddressId) {
        // Update existing address
        await updateAddress(editingAddressId, addressData);
        setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...a, ...addressData } : a));
      } else {
        // Add new address
        const newAddr = await addAddress(addressData);
        setAddresses(prev => [...prev, newAddr]);
      }
      closeAddressModal();
    } catch (error) {
      triggerToast('Failed to save address.', 'error');
    }
  };

  /* ----------------------------------------------------
      GUEST AUTH INTERCEPT
      - Render a gentle Sign In lockscreen instead of forcing modals or returning null
      ---------------------------------------------------- */
  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 font-body text-center">
        <div className="w-14 h-14 rounded-full bg-[#EDE6DA]/30 flex items-center justify-center mx-auto mb-6 border border-[#EDE6DA]">
          <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">Secure Account Gateway</span>
        <h2 className="text-2xl font-serif font-semibold text-[#1A1A1A] uppercase tracking-wider mt-1.5 leading-tight">
          Please Sign In
        </h2>
        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed mt-3">
          To view your order history, manage saved addresses, and track your loyalty progress, please sign in to your account.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="mt-8 w-full py-3.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#EDE6DA] text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
        >
          Sign In / Register
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
            onClick={() => logout()}
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
                    const status = ord.status || ord.orderStatus || 'processing';
                    const statusColors = 
                      status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
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
                            {status}
                          </span>
                        </div>

                        {/* Order Track Progress flow */}
                        <div className="flex items-center justify-between w-full max-w-md mx-auto my-3 relative px-4">
                          {/* Connecting lines */}
                          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
                          <div
                            className="absolute top-1/2 left-4 h-0.5 bg-[#D4AF37] -translate-y-1/2 z-0 transition-all duration-500"
                            style={{
                              width: status === 'delivered' ? '100%' : status === 'shipped' ? '50%' : '0%'
                            }}
                          />
                          
                          {/* Status Nodes */}
                          {['processing', 'shipped', 'delivered'].map((step, idx) => {
                            const active = status === step || 
                              (step === 'processing') || 
                              (step === 'shipped' && status === 'delivered');
                            
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
                          {(() => {
                            console.log("Order:", ord);
                            console.log("Items:", ord.items);
                            const orderItems = Array.isArray(ord.items) && ord.items.length > 0 ? ord.items : Array.isArray(ord.products) ? ord.products : [];
                            if (orderItems.length === 0) return null;
                            return orderItems.map((item: any, i: number) => {
                              const itemName = item?.productName || item?.name || item?.title || item?.productTitle || item?.product_name || productLookup[item?.productId] || productLookup[item?.id] || item?.productId || item?.id || '';
                              const itemQty = item?.quantity || 1;
                              const itemPrice = item?.price || 0;
                              return (
                                <div key={i} className="flex items-center gap-3.5 text-xs">
                                  <div className="flex-grow min-w-0">
                                    <h4 className="font-semibold text-gray-800 truncate">{itemName}</h4>
                                    <span className="text-[10px] text-gray-400">Quantity: {itemQty}</span>
                                  </div>
                                  <span className="font-bold text-[#1A1A1A] whitespace-nowrap">₹{(itemPrice * itemQty).toLocaleString('en-IN')}</span>
                                </div>
                              );
                            });
                          })()}
                          {!ord.items?.length && !ord.products?.length && (
                            <div className="text-center py-4 text-gray-400 italic text-[10px]">
                              No product details available for this order.
                            </div>
                          )}
                        </div>

                        {/* Shipping details and totals footer */}
                        <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-500 gap-4 mt-1">
                          <div>
                            <span className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[10px] block mb-1">Shipping Recipient:</span>
                            {ord.shippingAddress ? (
                              <>
                                <p className="font-semibold">{ord.shippingAddress?.fullName || 'N/A'}</p>
                                <p className="mt-0.5 text-gray-400 font-body text-[10px] leading-relaxed max-w-xs">
                                  {ord.shippingAddress?.addressLine || 'Address not available'}, {ord.shippingAddress?.city || ''}, {ord.shippingAddress?.state || ''} - {ord.shippingAddress?.pincode || ''}
                                </p>
                              </>
                            ) : (
                              <p className="text-gray-400 italic text-[10px]">Shipping address not available</p>
                            )}
                            {(() => {
                              const cancelDate = parseSafeDate(ord.cancelledAt);
                              return cancelDate ? (
                                <p className="text-xs text-red-600 font-semibold mt-2">Cancelled on: {cancelDate.toLocaleString()}</p>
                              ) : null;
                            })()}
                          </div>
                          
                          <div className="sm:text-right flex flex-col sm:justify-end">
                            <span className="text-gray-400 font-semibold block mb-0.5">Grand Total Amount Paid:</span>
                            <span className="font-bold font-serif text-[#1A1A1A] text-sm">₹{((ord.totalAmount || 0) as number).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">via {ord.paymentMethod || 'Unknown'}</span>
                            {ord.cancelledBy && (
                              <span className="text-[10px] font-bold text-red-600 mt-1 block">Cancelled by: {ord.cancelledBy.name || ord.cancelledBy.id} ({ord.cancelledBy.role || 'user'})</span>
                            )}
                          </div>
                        </div>

                        {/* Cancel button (only for eligible statuses) */}
                        {(status === 'processing') && (
                          <div className="flex justify-end mt-3">
                            <button
                              onClick={async () => {
                                const ok = confirm('Are you sure you want to cancel this order?');
                                if (!ok) return;
                                try {
                                  await cancelOrder(ord.id);
                                  // Refresh orders list
                                  const refreshed = await serviceDb.getOrders(user.uid);
                                  const sorted = refreshed.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                                  setOrders(sorted);
                                } catch {
                                  triggerToast('Failed to cancel order.', 'error');
                                }
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700"
                            >
                              Cancel Order
                            </button>
                          </div>
                        )}

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
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-serif font-semibold uppercase tracking-widest text-[#1A1A1A]">
                  Saved Shipping Profiles
                </h3>
                <button
                  onClick={() => openAddressModal()}
                  className="px-4 py-2 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#2A2A2A] transition-colors"
                >
                  + Add Address
                </button>
              </div>

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
                      {addr.isDefault && (
                        <div className="absolute top-4 left-4 bg-[#D4AF37] text-white text-[8px] font-bold px-2 py-1 rounded-full">
                          DEFAULT
                        </div>
                      )}
                      
                      <div className="text-xs flex flex-col gap-1 pr-8 mt-2">
                        <h4 className="font-bold text-[#1A1A1A] text-sm truncate flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{addr.fullName}</span>
                        </h4>
                        <span className="text-[10px] text-gray-400 font-bold block mt-1">Mobile: {addr.phone}</span>
                        <p className="text-gray-600 mt-2 font-medium leading-relaxed font-body text-xs">
                          {addr.addressLine1}{addr.addressLine2 && <>, {addr.addressLine2}</> }<br />
                          {addr.city}, {addr.state} - <span className="font-bold text-[#1A1A1A]">{addr.pincode}</span> <br />
                          {addr.country || 'India'}
                        </p>
                      </div>

                      {/* Edit and Delete buttons */}
                      <div className="flex gap-2 absolute top-4 right-4">
                        <button
                          onClick={() => openAddressModal(addr)}
                          className="p-2 rounded-full bg-white border border-gray-100 text-[#1A1A1A] hover:bg-[#EDE6DA] transition-colors shadow-sm active:scale-95"
                          title="Edit Address"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddr(addr.id)}
                          className="p-2 rounded-full bg-white border border-gray-100 text-red-500 hover:bg-red-50 transition-colors shadow-sm active:scale-95"
                          title="Delete Address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-[#EDE6DA] rounded-xl p-4 bg-gray-50">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                    No saved addresses yet.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal font-body">
                    Add your first address to make checkout faster.
                  </p>
                  <button
                    onClick={() => openAddressModal()}
                    className="mt-4 px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xl shadow-md"
                  >
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ADDRESS FORM MODAL */}
          {showAddressModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-screen overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-serif font-semibold text-[#1A1A1A]">
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <button onClick={closeAddressModal} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleFormChange('fullName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                        formErrors.fullName ? 'border-red-500' : 'border-[#EDE6DA]'
                      }`}
                      placeholder="Your full name"
                    />
                    {formErrors.fullName && <p className="text-red-600 text-xs mt-1">{formErrors.fullName}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                        formErrors.phone ? 'border-red-500' : 'border-[#EDE6DA]'
                      }`}
                      placeholder="10-digit mobile number"
                    />
                    {formErrors.phone && <p className="text-red-600 text-xs mt-1">{formErrors.phone}</p>}
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => handleFormChange('addressLine1', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                        formErrors.addressLine1 ? 'border-red-500' : 'border-[#EDE6DA]'
                      }`}
                      placeholder="Street address, building, apartment"
                    />
                    {formErrors.addressLine1 && <p className="text-red-600 text-xs mt-1">{formErrors.addressLine1}</p>}
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => handleFormChange('addressLine2', e.target.value)}
                      className="w-full px-3 py-2 border border-[#EDE6DA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="Apt, suite, etc. (optional)"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleFormChange('city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                        formErrors.city ? 'border-red-500' : 'border-[#EDE6DA]'
                      }`}
                      placeholder="City"
                    />
                    {formErrors.city && <p className="text-red-600 text-xs mt-1">{formErrors.city}</p>}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleFormChange('state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                        formErrors.state ? 'border-red-500' : 'border-[#EDE6DA]'
                      }`}
                      placeholder="State/Province"
                    />
                    {formErrors.state && <p className="text-red-600 text-xs mt-1">{formErrors.state}</p>}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleFormChange('pincode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                        formErrors.pincode ? 'border-red-500' : 'border-[#EDE6DA]'
                      }`}
                      placeholder="6-digit postal code"
                    />
                    {formErrors.pincode && <p className="text-red-600 text-xs mt-1">{formErrors.pincode}</p>}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleFormChange('country', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                        formErrors.country ? 'border-red-500' : 'border-[#EDE6DA]'
                      }`}
                      placeholder="Country"
                    />
                    {formErrors.country && <p className="text-red-600 text-xs mt-1">{formErrors.country}</p>}
                  </div>

                  {/* Default Address Checkbox */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => handleFormChange('isDefault', e.target.checked)}
                      className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="isDefault" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Set as default shipping address
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={closeAddressModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold uppercase rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAddress}
                      className="flex-1 px-4 py-2 bg-[#1A1A1A] text-white text-xs font-semibold uppercase rounded-lg hover:bg-[#2A2A2A] transition-colors"
                    >
                      {editingAddressId ? 'Update Address' : 'Add Address'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
