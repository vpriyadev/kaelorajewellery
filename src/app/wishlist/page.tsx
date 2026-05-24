'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { serviceDb, Product } from '../../lib/firebase';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, moveToCart, triggerToast } = useApp();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlisted products
  useEffect(() => {
    setLoading(true);
    serviceDb.getProducts().then((allProducts) => {
      const wishlisted = allProducts.filter((p) => wishlist.includes(p.id));
      setWishlistProducts(wishlisted);
      setLoading(false);
    });
  }, [wishlist]);

  const handleMoveToCart = (id: string, name: string) => {
    moveToCart(id);
    triggerToast(`✨ Moved "${name}" to shopping cart!`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Saved Treasures</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
          My Wishlist
        </h1>
        <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Accessing Jewellery Vault...</span>
        </div>
      ) : wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-[#EDE6DA] overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group"
            >
              {/* Product Image Frame */}
              <div className="relative h-64 bg-gray-50 overflow-hidden">
                <img
                  src={prod.images[0] || '/images/logo-burgundy.jpg'}
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Trash/Remove float */}
                <button
                  onClick={() => toggleWishlist(prod.id)}
                  className="absolute top-3 right-3 p-2 bg-white/95 rounded-full border border-[#EDE6DA] text-red-500 hover:bg-red-50 active:scale-95 shadow-sm transition-all"
                  title="Remove Saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Contents block */}
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    {prod.category} collection
                  </span>
                  
                  <Link href={`/product/${prod.slug}`} className="block">
                    <h3 className="text-sm font-bold text-[#1A1A1A] hover:text-[#D4AF37] transition-colors truncate mt-0.5">
                      {prod.name}
                    </h3>
                  </Link>

                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                    {prod.description}
                  </p>
                </div>

                {/* Price and Cart movement details */}
                <div className="flex items-center justify-between border-t border-[#EDE6DA]/40 pt-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1A1A1A]">
                      ₹{prod.discountPrice.toLocaleString('en-IN')}
                    </span>
                    {prod.price > prod.discountPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(prod.id, prod.name)}
                    disabled={prod.stock <= 0}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 border ${
                      prod.stock <= 0
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#1A1A1A] hover:bg-[#2A2A2A] border-gray-800 text-[#EDE6DA]'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Move To Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-[#F8F5F0] border border-dashed border-[#EDE6DA] rounded-3xl p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Heart className="w-7 h-7 text-red-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#1A1A1A] uppercase tracking-wider">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed mt-2 max-w-xs mx-auto">
            You haven&apos;t stored any articles yet. Explore our designer gold chains, bangles and hoop earrings and build your collection!
          </p>
          <Link
            href="/shop"
            className="mt-8 px-8 py-3.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md inline-flex items-center gap-1.5 group active:scale-95"
          >
            <span>Explore Lookbook</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

    </div>
  );
}
