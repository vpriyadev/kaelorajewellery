'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { serviceDb, Address, Order } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { MapPin, ShieldCheck, CreditCard, ChevronRight, Loader2, Award, Gift, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, user, settings, setAuthModalOpen, checkoutCart, addAddress, triggerToast } = useApp();
  const router = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !completedOrder) {
      router.push('/cart');
    }
  }, [cart]);

  // Loading past addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  // Address Inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [saveToBook, setSaveToBook] = useState(true);

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success States
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Load user saved addresses
  useEffect(() => {
    if (user) {
      serviceDb.getAddresses(user.uid).then((addr) => {
        setSavedAddresses(addr);
        if (addr.length > 0) {
          // preselect first saved address
          const first = addr[0];
          setSelectedAddressId(first.id);
          applySavedAddress(first);
        }
      });

      // prefill defaults from user profile
      setFullName(user.displayName || '');
    }
  }, [user]);

  const applySavedAddress = (addr: Address) => {
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine(addr.addressLine);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
  };

  const handleAddressSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAddressId(val);
    if (val === 'new') {
      setFullName(user?.displayName || '');
      setPhone('');
      setAddressLine('');
      setCity('');
      setState('');
      setPincode('');
    } else {
      const found = savedAddresses.find(a => a.id === val);
      if (found) {
        applySavedAddress(found);
      }
    }
  };

  // Pricing math
  const subtotal = cart.reduce((acc, item) => acc + (item.product.discountPrice * item.quantity), 0);
  const shippingCharge = subtotal >= settings.freeShippingLimit || !settings.enableFreeShipping ? 0 : settings.standardShippingCharge;
  const codHandlingFee = paymentMethod === 'cod' ? settings.codFee : 0;
  const totalAmount = subtotal + shippingCharge + codHandlingFee;

  // Reward Progress calculations
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const profileItemsCount = user?.rewardStatus?.totalItemsBought || 0;
  const totalBoughtProgress = profileItemsCount + cartItemsCount;
  const isGiftUnlocked = totalBoughtProgress >= settings.giftGoal;

  // Calculate delivery date estimation
  const getDeliveryEstimateDate = () => {
    let days = 5;
    if (pincode.startsWith('1') || pincode.startsWith('2')) days = 3;
    else if (pincode.startsWith('5') || pincode.startsWith('6')) days = 7;
    
    const est = new Date();
    est.setDate(est.getDate() + days);
    return est.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!fullName.trim() || !phone.trim() || !addressLine.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      triggerToast("Please complete all shipping address fields.", "error");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      triggerToast("Pincode must be exactly 6 digits.", "error");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      triggerToast("Please input a valid 10-digit mobile number.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save Address if saveToBook and new
      const shippingAddress: Address = {
        id: selectedAddressId === 'new' ? Math.random().toString(36).slice(2, 9) : selectedAddressId,
        userId: user.uid,
        fullName,
        phone,
        addressLine,
        city,
        state,
        pincode
      };

      if (saveToBook && selectedAddressId === 'new') {
        await addAddress(shippingAddress);
      }

      // 2. Process Checkout
      const order = await checkoutCart(shippingAddress, paymentMethod);
      setCompletedOrder(order);

      // Trigger standard confetti dynamically
      try {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#EDE6DA', '#1A1A1A']
        });
      } catch (err) {
        // dynamic import failed, fallback gracefully
      }

      triggerToast("✨ Order successfully placed! Enjoy your KAELORA jewellery.", "success");
    } catch (err: Error | any) {
      triggerToast(err.message || "Failed to place order.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ----------------------------------------------------
      SUCCESS SCREEN RENDER
      ---------------------------------------------------- */
  if (completedOrder) {
    const estDelivery = getDeliveryEstimateDate();
    
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 font-body text-[#1A1A1A]">
        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-8 sm:p-12 shadow-xl text-center flex flex-col items-center gap-6 relative overflow-hidden">
          {/* Top golden ribbon banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#EDE6DA] via-[#D4AF37] to-[#EDE6DA]" />
          
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#D4AF37] font-bold">Transaction Complete</span>
            <h1 className="text-3xl font-serif font-semibold uppercase tracking-wider mt-1">Order Placed Successfully!</h1>
            <p className="text-xs text-gray-400 mt-2 font-medium">Order ID: <span className="font-mono font-bold text-[#1A1A1A]">{completedOrder.id}</span></p>
          </div>

          {/* Delivery dates cards */}
          <div className="w-full bg-[#F8F5F0] border border-[#EDE6DA] rounded-2xl p-5 max-w-md flex items-center gap-4 text-left">
            <Calendar className="w-10 h-10 text-[#D4AF37] flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Estimated Delivery Date:</p>
              <h4 className="text-sm font-bold text-[#1A1A1A]">{estDelivery}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Your parcel will be delivered via Express Courier.</p>
            </div>
          </div>

          {/* Order particulars grid summary */}
          <div className="w-full border-t border-b border-[#EDE6DA] py-6 flex flex-col gap-3 text-xs text-gray-500 text-left">
            <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[11px] mb-1">Shipping Particulars:</h3>
            <p><span className="font-semibold text-gray-700">Recipient Name:</span> {completedOrder.shippingAddress.fullName}</p>
            <p><span className="font-semibold text-gray-700">Contact Mobile:</span> {completedOrder.shippingAddress.phone}</p>
            <p><span className="font-semibold text-gray-700">Shipping Address:</span> {completedOrder.shippingAddress.addressLine}, {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} - {completedOrder.shippingAddress.pincode}</p>
            <p><span className="font-semibold text-gray-700">Payment Status:</span> <span className="uppercase font-bold text-[#D4AF37]">{completedOrder.paymentMethod}</span> ({completedOrder.paymentStatus})</p>
            <p><span className="font-semibold text-gray-700">Total Sum Paid:</span> <span className="font-bold text-[#1A1A1A] font-serif text-sm">₹{completedOrder.totalAmount.toLocaleString('en-IN')}</span></p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mt-2">
            <Link
              href="/account"
              className="w-full sm:w-48 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md text-center"
            >
              Track Order
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-48 py-3 bg-white border border-[#EDE6DA] hover:border-gray-300 text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider rounded-xl text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
      GUEST LOCKSCREEN INTERCEPT
      ---------------------------------------------------- */
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 font-body text-center">
        <div className="w-14 h-14 rounded-full bg-[#EDE6DA]/30 flex items-center justify-center mx-auto mb-6 border border-[#EDE6DA]">
          <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">Secure Checkout Gateway</span>
        <h2 className="text-2xl font-serif font-semibold text-[#1A1A1A] uppercase tracking-wider mt-1.5 leading-tight">
          Checkout Access Gate
        </h2>
        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed mt-3">
          To manage order shipping calculations, address book storage, and loyalty points tracking, please login or sign up below.
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body text-[#1A1A1A]">
      
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Secure Gateway</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
          Checkout
        </h1>
        <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* LEFT COLUMN: SHIPPING ADDRESS & BILLINGS FORM */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <form onSubmit={handlePlaceOrder} className="bg-white border border-[#EDE6DA] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
            
            {/* Form Section 1 Header */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-sm font-serif font-semibold uppercase tracking-widest text-[#1A1A1A]">
                Shipping Particulars
              </h3>
            </div>

            {/* SAVED ADDRESS BOOK DROPDOWN */}
            {savedAddresses.length > 0 && (
              <div className="flex flex-col gap-1.5 bg-[#F8F5F0] border border-[#EDE6DA] p-4 rounded-2xl mb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#4B352A]">
                  Select From Address Book:
                </label>
                <select
                  value={selectedAddressId}
                  onChange={handleAddressSelectChange}
                  className="bg-white border border-[#EDE6DA] rounded-xl px-3 py-2 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37] mt-1"
                >
                  <option value="new">-- Ship to a New Address --</option>
                  {savedAddresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.fullName} - {addr.addressLine.slice(0, 20)}..., {addr.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Inputs row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#4B352A]">Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#4B352A]">Contact Mobile *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-bold"
                />
              </div>
            </div>

            {/* Input Address Line */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#4B352A]">Shipping Address *</label>
              <input
                type="text"
                required
                placeholder="Flat / House No, Apartment Name, Street Name"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-semibold"
              />
            </div>

            {/* Row 3 inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#4B352A]">Town / City *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Vellore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#4B352A]">State *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Tamil Nadu"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#4B352A]">Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="6-digit PIN"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-bold"
                />
              </div>
            </div>

            {/* Save Address check box */}
            {selectedAddressId === 'new' && (
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToBook}
                  onChange={(e) => setSaveToBook(e.target.checked)}
                  className="rounded border-[#EDE6DA] text-[#D4AF37] focus:ring-[#D4AF37] w-4 h-4"
                />
                <span>Save to Address Book for future checkout</span>
              </label>
            )}

            {/* PAYMENT SIMULATOR TOGGLE */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mt-4 mb-2">
              <CreditCard className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-sm font-serif font-semibold uppercase tracking-widest text-[#1A1A1A]">
                Payment Selection
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Online Payment option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-2xl border text-left flex flex-col gap-1.5 transition-all shadow-sm ${
                  paymentMethod === 'online'
                    ? 'border-[#D4AF37] bg-[#F8F5F0]'
                    : 'border-[#EDE6DA] bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Online Payment</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'online' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'online' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Pay securely using Credit Cards, Debit Cards, Netbanking, Google Pay or PhonePe. (Simulated Gateway).
                </p>
              </button>

              {/* COD option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left flex flex-col gap-1.5 transition-all shadow-sm ${
                  paymentMethod === 'cod'
                    ? 'border-[#D4AF37] bg-[#F8F5F0]'
                    : 'border-[#EDE6DA] bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Cash On Delivery</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Pay cash upon package arrival at your door. (Includes **₹{settings.codFee}** handling charges).
                </p>
              </button>
            </div>

            {/* Glowing CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full py-4 bg-[#1A1A1A] hover:bg-[#2A2A2A] active:scale-[0.98] text-[#EDE6DA] text-xs font-semibold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 group border border-gray-800"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Place Order & Pay</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: REAL-TIME SUMMARY & REWARD ESTIMATION */}
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6 shadow-sm flex flex-col gap-5 sticky top-28">
            <h3 className="text-sm font-serif font-semibold uppercase tracking-widest text-[#1A1A1A] border-b border-[#EDE6DA] pb-3">
              Order Particulars
            </h3>

            {/* Cart products listing */}
            <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                  <div className="flex-grow min-w-0">
                    <h4 className="font-semibold text-gray-700 truncate">{item.product.name}</h4>
                    <span className="text-[10px] text-gray-400">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-[#1A1A1A]">₹{(item.product.discountPrice * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Pricing break downs */}
            <div className="flex flex-col gap-3 text-xs text-gray-500 border-t border-[#EDE6DA]/40 pt-4">
              <div className="flex justify-between items-center">
                <span>Subtotal Sum</span>
                <span className="font-semibold text-[#1A1A1A]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping Fee</span>
                <span className={`font-semibold ${shippingCharge === 0 ? 'text-emerald-700 font-bold' : 'text-[#1A1A1A]'}`}>
                  {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                </span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between items-center">
                  <span>COD Handling Fee</span>
                  <span className="font-semibold text-[#1A1A1A]">₹{codHandlingFee}</span>
                </div>
              )}
            </div>

            {/* Loyalty Alert */}
            <div className="bg-[#1A1A1A] border border-[#D4AF37]/50 rounded-2xl p-4 text-[#EDE6DA] flex gap-3 text-[10px] leading-relaxed">
              <Gift className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#D4AF37] uppercase tracking-wider block mb-0.5">KAELORA CLUB VALUE</span>
                {isGiftUnlocked ? (
                  <span>Complimentary Luxury Gift unlocked! Packed inside this parcel.</span>
                ) : (
                  <span>Check out now to progress towards your complimentary reward gift!</span>
                )}
              </div>
            </div>

            {/* Total final */}
            <div className="flex justify-between items-center border-t border-[#EDE6DA] pt-4 text-sm font-bold text-[#1A1A1A] font-serif">
              <span>Grand Total Amount</span>
              <span className="text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
