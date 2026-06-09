'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '../lib/firebase';
import { motion } from 'framer-motion';
import { normalizeSlug } from '../lib/slugUtils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, wishlist, toggleWishlist, addToCart } = useApp();

  const isWishlisted = wishlist.includes(product.id);
  const inCart = cart.some(item => item.product.id === product.id);

  // Discount calculation
  const discountPercent = Math.round(((product.price - product.discountPrice) / product.price) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-xl border border-[#EDE6DA] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full font-body relative"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="absolute top-3 left-3 bg-[#D4AF37] text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full z-10">
          {discountPercent}% OFF
        </span>
      )}

      {/* Wishlist Heart Icon */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 border border-gray-100 shadow-sm z-10 transition-all duration-300"
        aria-label="Add to wishlist"
      >
        <Heart className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
      </button>

      {/* Image Gallery Container (Clickable links to Details) */}
      <Link href={`/product/${normalizeSlug(product.slug)}`} className="block overflow-hidden bg-gray-50">
        {(() => {
          const raw = (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) as string | undefined;
          if (!raw || raw.includes('logo-burgundy')) return null;
          return (
            <Image
              src={raw}
              alt={product.name}
              width={320}
              height={380}
              className="w-full h-[200px] sm:h-[300px] md:h-[380px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
          );
        })()}
        {!((typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) ) || (typeof product.images[0] === 'string' && product.images[0].includes('logo-burgundy')) ? (
          <div className="w-full h-[200px] sm:h-[300px] md:h-[380px] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-sm text-gray-500">No image available</div>
        ) : null}
        {/* Quick hover detail overlay */}
        <div className="absolute inset-0 bg-[#1A1A1A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <span className="bg-white/95 backdrop-blur-sm text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] px-4 py-2 rounded-xl shadow-lg border border-[#EDE6DA] flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </span>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#4B352A] font-semibold mb-1">
            <span>{product.category}</span>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span className="font-bold">{product.rating}</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/product/${normalizeSlug(product.slug)}`} className="block">
            <h3 className="text-sm font-semibold text-[#1A1A1A] tracking-wide hover:text-[#D4AF37] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Wear Type Badge */}
          <span className="inline-block bg-[#EDE6DA]/40 text-[#4B352A] text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md mt-1.5 font-medium">
            {product.wearType} wear
          </span>
        </div>

        {/* Pricing & Add Cart Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-[#EDE6DA]/40 mt-1">
          {/* Prices */}
          <div className="flex flex-col">
            <span className="text-md font-bold text-[#1A1A1A]">
              ₹{product.discountPrice.toLocaleString('en-IN')}
            </span>
            {product.price > product.discountPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className={`p-2 rounded-xl border border-[#EDE6DA] shadow-sm flex items-center justify-center transition-all duration-300 ${
              product.stock <= 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : inCart
                ? 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
                : 'bg-white hover:bg-[#F8F5F0] text-[#1A1A1A] hover:border-[#D4AF37]'
            }`}
            aria-label="Add to cart"
          >
            {product.stock <= 0 ? (
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1">Sold Out</span>
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default ProductCard;
