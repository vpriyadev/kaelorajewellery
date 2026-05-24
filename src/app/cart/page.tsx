'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, ArrowRight, Trash2, Heart, Gift, Award } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, settings, user, toggleWishlist, triggerToast } = useApp();

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.product.discountPrice * item.quantity), 0);
  const shippingCharge = subtotal >= settings.freeShippingLimit || !settings.enableFreeShipping ? 0 : settings.standardShippingCharge;
  const totalAmount = subtotal + shippingCharge;

  // Reward Progress calculations
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const profileItemsCount = user?.rewardStatus?.totalItemsBought || 0;
  
  // Total ordered items (current cart + already ordered)
  const totalBoughtProgress = profileItemsCount + cartItemsCount;
  const isGiftUnlocked = totalBoughtProgress >= settings.giftGoal;

  const handleUpdateQty = (id: string, newQty: number, stock: number) => {
    if (newQty > stock) {
      triggerToast(`Unable to add: Only ${stock} pieces in stock.`, "error");
      return;
    }
    updateCartQuantity(id, newQty);
  };

  const handleToggleWishlistFromCart = (prod: Product) => {
    toggleWishlist(prod.id);
    removeFromCart(prod.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Shopping Bag</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
          Shopping Cart
        </h1>
        <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: LIST OF CART ITEMS */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* ----------------------------------------------------
                LOYALTY REWARDS DYNAMIC NOTICE BLOCK
                ---------------------------------------------------- */}
            <div className="bg-[#1A1A1A] border border-[#D4AF37]/50 rounded-2xl p-5 text-[#EDE6DA] shadow-lg flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/25 flex items-center justify-center flex-shrink-0 animate-pulse border border-[#D4AF37]/40">
                <Gift className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Kaelora Club Reward Status</span>
                </h4>
                
                {isGiftUnlocked ? (
                  <p className="text-xs mt-1.5 text-gray-200 leading-relaxed font-body font-medium">
                    🎉 **Congratulations!** Your total jewellery items (already ordered: **{profileItemsCount}** + current cart: **{cartItemsCount}**) qualify for a **Complimentary Premium KAELORA Gift**! We will pack it inside your checkout parcel box automatically.
                  </p>
                ) : (
                  <p className="text-xs mt-1.5 text-gray-300 leading-relaxed font-body">
                    Buy &quot;3 Products&quot; in total to receive a complimentary luxury gift! You currently have **{profileItemsCount}** past items. By checking out this cart of **{cartItemsCount}** items, you will be only **{Math.max(0, settings.giftGoal - totalBoughtProgress)}** product away!
                  </p>
                )}

                {/* Progress bar visual */}
                <div className="w-full h-1.5 bg-gray-700/80 rounded-full overflow-hidden mt-3 max-w-sm">
                  <div
                    className="h-full bg-gradient-to-r from-[#EDE6DA] to-[#D4AF37]"
                    style={{ width: `${Math.min(100, (totalBoughtProgress / settings.giftGoal) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cart Items list cards */}
            <div className="flex flex-col gap-4 bg-white border border-[#EDE6DA] rounded-3xl p-4 sm:p-6 shadow-sm">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-b border-[#EDE6DA]/40 pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0"
                >
                  {/* Thumbnail frame */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#EDE6DA] bg-gray-50 flex-shrink-0">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Details content */}
                  <div className="flex-grow flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                        {item.product.category}
                      </span>
                      <Link href={`/product/${item.product.slug}`} className="block">
                        <h4 className="text-sm font-semibold text-[#1A1A1A] hover:text-[#D4AF37] transition-colors">
                          {item.product.name}
                        </h4>
                      </Link>
                      <span className="inline-block bg-[#EDE6DA]/30 text-[#4B352A] text-[9px] uppercase tracking-wider px-2 py-0.5 rounded mt-1 font-medium">
                        {item.product.wearType} wear
                      </span>
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex items-center border border-[#EDE6DA] rounded-xl overflow-hidden bg-gray-50/50">
                      <button
                        onClick={() => handleUpdateQty(item.product.id, item.quantity - 1, item.product.stock)}
                        className="px-2.5 py-1 text-sm font-bold border-r border-[#EDE6DA] hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold w-10 text-center select-none">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(item.product.id, item.quantity + 1, item.product.stock)}
                        className="px-2.5 py-1 text-sm font-bold border-l border-[#EDE6DA] hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="flex flex-col sm:items-end">
                      <span className="text-sm font-bold text-[#1A1A1A]">
                        ₹{(item.product.discountPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-gray-400">
                          (₹{item.product.discountPrice} each)
                        </span>
                      )}
                    </div>

                    {/* Actions block */}
                    <div className="flex sm:flex-col gap-2">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleWishlistFromCart(item.product)}
                        className="p-2 text-gray-400 hover:text-[#D4AF37] rounded-lg hover:bg-[#EDE6DA]/30 transition-colors"
                        title="Save to wishlist"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY DETAILS CARD */}
          <div className="flex flex-col gap-6 w-full">
            <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6 shadow-sm flex flex-col gap-5 sticky top-28">
              <h3 className="text-sm font-serif font-semibold uppercase tracking-widest text-[#1A1A1A] border-b border-[#EDE6DA] pb-3">
                Order Summary
              </h3>

              {/* Items listing */}
              <div className="flex flex-col gap-3.5 text-xs text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-[#1A1A1A]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {/* Shipping charge calculator display */}
                <div className="flex justify-between items-center">
                  <span>Shipping & Delivery</span>
                  <span className={`font-semibold ${shippingCharge === 0 ? 'text-emerald-700 font-bold' : 'text-[#1A1A1A]'}`}>
                    {shippingCharge === 0 ? 'FREE DELIVERY' : `₹${shippingCharge}`}
                  </span>
                </div>

                {/* Free shipping threshold alert */}
                {shippingCharge > 0 && (
                  <div className="p-3 bg-[#F8F5F0] border border-[#EDE6DA] rounded-xl text-[10px] text-amber-700 leading-normal font-semibold">
                    💡 **Tip:** Add only **₹{(settings.freeShippingLimit - subtotal).toLocaleString('en-IN')}** more worth of articles to unlock **FREE SHIPPING!**
                  </div>
                )}
              </div>

              {/* Total final */}
              <div className="flex justify-between items-center border-t border-[#EDE6DA] pt-4 text-sm font-bold text-[#1A1A1A] font-serif">
                <span>Estimated Total</span>
                <span className="text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Secure checkout triggers */}
              <Link
                href="/checkout"
                className="w-full py-3.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] active:scale-[0.98] text-[#EDE6DA] text-xs font-semibold uppercase tracking-[0.2em] rounded-xl text-center shadow-lg transition-all flex items-center justify-center gap-1.5 group border border-gray-800"
              >
                <span>Proceed To Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Badges footer */}
              <p className="text-[10px] text-gray-400 text-center font-body mt-1">
                🔒 Secure SSL Checkout. Taxes calculated on delivery.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* Empty Cart State */
        <div className="text-center py-20 bg-[#F8F5F0] border border-dashed border-[#EDE6DA] rounded-3xl p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 border border-gray-200">
            <ShoppingBag className="w-7 h-7 text-gray-400 animate-bounce" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#1A1A1A] uppercase tracking-wider">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed mt-2 max-w-xs mx-auto">
            You haven&apos;t added any luxury articles yet. Head back to the showcase and discover tarnish-free daily wear earrings, pendants and traditional filigrees!
          </p>
          <Link
            href="/shop"
            className="mt-8 px-8 py-3.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md inline-flex items-center gap-1.5 group active:scale-95"
          >
            <span>Explore lookbook</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

    </div>
  );
}
