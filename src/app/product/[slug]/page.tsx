'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { serviceDb, Product } from '../../../lib/firebase';
import { useApp } from '../../../context/AppContext';
import ProductCard from '../../../components/ProductCard';
import { normalizeSlug } from '../../../lib/slugUtils';
import { Heart, ShoppingBag, Truck, Share2, Copy, CheckCircle2, ChevronRight, AlertCircle, Camera, Loader2 } from 'lucide-react';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart, addReview, user, triggerToast } = useApp();

  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);
  const [hasExistingReview, setHasExistingReview] = useState(false);
const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'faq'>('description');

  // Pincode Delivery check
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState<File | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);


  // Loading
  const [loading, setLoading] = useState(true);

  // Load product & related products
  useEffect(() => {
    if (!slug) return;
    Promise.all([
      serviceDb.getProducts(),
      serviceDb.getReviews()
    ]).then(([allProducts, allReviews]) => {
      const decodedSlug = decodeURIComponent(slug);
      const querySlug = normalizeSlug(decodedSlug);
      const match = allProducts.find(p => normalizeSlug(p.slug) === querySlug);
      if (match) {
        setProduct(match);
        // Find 4 related items (same category, excluding current)
        const rel = allProducts
          .filter(p => p.category === match.category && p.id !== match.id)
          .slice(0, 4);
        setRelatedProducts(rel);
        
        // Filter all reviews for this product, sorted by newest
        const productReviews = allReviews
          .filter(r => r.productId === match.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setApprovedReviews(productReviews);
        
        setRelatedProducts(rel);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, [slug]);

  useEffect(() => {
    if (user && approvedReviews.length > 0) {
      const existing = approvedReviews.find(r => r.userId === user.uid);
      if (existing && !hasExistingReview) {
        setHasExistingReview(true);
        setReviewRating(existing.rating);
        setReviewComment(existing.comment);
      }
    }
  }, [user, approvedReviews, hasExistingReview]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <div className="w-8 h-8 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold font-body">Opening Jewel Box...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-32 font-body max-w-md mx-auto px-6">
        <AlertCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
        <h2 className="text-xl font-serif font-semibold text-[#1A1A1A] uppercase tracking-wider">Product Not Found</h2>
        <p className="text-xs text-gray-400 leading-relaxed mt-2">
          The requested article cannot be located. It may have been retired or sold out completely.
        </p>
        <button
          onClick={() => router.push('/shop')}
          className="mt-6 px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  // Discount calculation
  const isDiscounted = product.price > product.discountPrice;
  const discountPercent = Math.round(((product.price - product.discountPrice) / product.price) * 100);

  // Wishlist check
  const isWishlisted = wishlist.includes(product.id);

  // Zoom events
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - window.scrollX - left) / width) * 100;
    const y = ((e.pageY - window.scrollY - top) / height) * 100;
    setZoomPos({ x, y });
    setZoomScale(1.8);
  };

  const handleMouseLeave = () => {
    setZoomScale(1);
    setZoomPos({ x: 0, y: 0 });
  };

  // Pincode calculation
  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      triggerToast("Please input a valid 6-digit pin code.", "error");
      return;
    }

    let days = 5;
    if (pincode.startsWith('1') || pincode.startsWith('2')) {
      days = 3; // Nearby State
    } else if (pincode.startsWith('5') || pincode.startsWith('6')) {
      days = 7; // Long Distance
    }

    const estDate = new Date();
    estDate.setDate(estDate.getDate() + days);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const dateStr1 = estDate.toLocaleDateString('en-IN', options);
    estDate.setDate(estDate.getDate() + 2);
    const dateStr2 = estDate.toLocaleDateString('en-IN', options);

    setDeliveryEstimate(`🚚 Estimated Delivery: ${dateStr1} - ${dateStr2}`);
    triggerToast("Pin code delivery estimate generated.", "success");
  };

  // Handle Review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerToast("Authentication required to write reviews.", "info");
      return;
    }
    if (!reviewComment.trim()) {
      triggerToast("Review text cannot be blank.", "error");
      return;
    }

    setSubmittingReview(true);
    try {
      await addReview(product.id, reviewRating, reviewComment, reviewPhoto);
      // Form isn't cleared if updating, because they can update again
      if (!hasExistingReview) {
        setReviewComment('');
        setReviewRating(5);
        setReviewPhoto(null);
      }
    } catch {
      triggerToast("Review submission failed.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Share methods
  const shareProduct = (platform: 'whatsapp' | 'facebook' | 'copy') => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out this gorgeous ${product.name} from KAELORA Jewellery! ₹${product.discountPrice}`;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`);
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    } else {
      navigator.clipboard.writeText(url);
      triggerToast("Article details link copied to clipboard!", "success");
    }
  };

  const handleBuyNow = () => {
    // Adds to cart and redirects to cart immediately
    addToCart(product, quantity);
    router.push('/cart');
  };

  // Filter approved product reviews
  // Reviews are now loaded from Firestore in useEffect above

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      
      {/* ----------------------------------------------------
          TOP: MAIN PRODUCT SPLIT CARD
          ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start bg-white border border-[#EDE6DA] rounded-3xl p-6 sm:p-10 shadow-sm">
        
        {/* LEFT COLUMN: MULTI-IMAGE VIEWER WITH ZOOM */}
        <div className="flex flex-col gap-4 w-full">
          {/* Main Display frame */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-square rounded-2xl overflow-hidden border border-[#EDE6DA] cursor-zoom-in bg-gray-50"
          >
            <Image
              src={(typeof product.images[activeImageIndex] === 'string' ? product.images[activeImageIndex] : product.images[activeImageIndex]?.url) || '/images/logo-burgundy.jpg'}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
              className="w-full h-full object-cover transition-transform duration-100"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
              }}
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-[#D4AF37] text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 mt-1">
                  {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-gray-50 transition-all relative ${
                    activeImageIndex === idx ? 'border-[#D4AF37] scale-95 shadow-md' : 'border-[#EDE6DA] hover:border-gray-300'
                  }`}
                >
                    <Image 
                    src={typeof img === 'string' ? img : img.url} 
                    alt={`${product.name} thumbnail ${idx}`} 
                    fill 
                    loading="lazy"
                    sizes="100px"
                    className="object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PRODUCT SPECIFICATIONS & ACTIONS */}
        <div className="flex flex-col gap-5 w-full text-[#1A1A1A]">
          {/* Header titles */}
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-bold">
              {product.category} collection
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold uppercase tracking-wider mt-1.5 leading-tight">
              {product.name}
            </h1>
            
            {/* Quick reviews summary */}
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {product.reviewCount > 0 ? (
                <>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < Math.round(product.rating || 0) ? 'text-sm' : 'text-sm text-gray-300'}>★</span>
                    ))}
                    <span className="font-bold text-gray-700 ml-1">{(product.rating || 0).toFixed(1)}</span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    {product.reviewCount} Reviews
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-sm text-gray-300">☆</span>
                    ))}
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    0 Reviews
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="flex items-baseline gap-3.5 py-3 border-y border-[#EDE6DA]/60">
            <span className="text-3xl font-bold font-serif">
              ₹{product.discountPrice.toLocaleString('en-IN')}
            </span>
            {isDiscounted && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">
                  Save ₹{(product.price - product.discountPrice).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>
<div className="flex gap-4 mt-4 border-b border-gray-200">
  {['description', 'specifications', 'reviews', 'faq'].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab as 'description' | 'specifications' | 'reviews' | 'faq')}
      className={`px-3 py-1 text-sm ${activeTab === tab ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-gray-500'}`}
    >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
    </button>
  ))}
</div>

{activeTab === 'description' && (
  <div className="mt-4">
    {/* Short Description */}
    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
      {product.description}
    </p>

    {/* Key materials and Wear styles */}
    <div className="grid grid-cols-2 gap-4 text-xs bg-[#F8F5F0] border border-[#EDE6DA] p-4 rounded-2xl">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-wider text-gray-400">Perfect For:</span>
        <span className="font-semibold capitalize text-[#4B352A]">{product.wearType} Wear</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-wider text-gray-400">Stock Availability:</span>
        <span className={`font-semibold ${product.stock <= 5 ? 'text-amber-600 font-bold' : 'text-emerald-700'}`}>
          {product.stock <= 0 ? 'Out of Stock' : product.stock <= 5 ? `Low Stock (${product.stock} left)` : 'In Stock'}
        </span>
      </div>
    </div>
  </div>
)}

          {/* QUANTITY SELECTOR */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold tracking-wider text-[#4B352A] uppercase">Quantity:</span>
              <div className="flex items-center border border-[#EDE6DA] bg-white rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3.5 py-2 hover:bg-gray-50 transition-colors text-sm font-bold border-r border-[#EDE6DA]"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold w-12 text-center select-none">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-2 hover:bg-gray-50 transition-colors text-sm font-bold border-l border-[#EDE6DA]"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* ACTIONS PANELS: ADD TO CART, BUY NOW, WISHLIST */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              onClick={() => addToCart(product, quantity)}
              disabled={product.stock <= 0}
              className={`flex-grow py-3.5 flex items-center justify-center gap-2 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 border ${
                product.stock <= 0
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-white border-[#EDE6DA] hover:border-[#D4AF37] text-[#1A1A1A] hover:bg-[#F8F5F0]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add To Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className={`flex-grow py-3.5 flex items-center justify-center gap-2 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 text-[#EDE6DA] border ${
                product.stock <= 0
                  ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#1A1A1A] border-gray-800 hover:bg-[#2A2A2A]'
              }`}
            >
              <span>Buy Now</span>
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3.5 rounded-xl border transition-all active:scale-95 shadow-sm flex items-center justify-center ${
                isWishlisted
                  ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'
                  : 'bg-white border-[#EDE6DA] hover:border-[#D4AF37] text-gray-400 hover:text-red-500'
              }`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* ----------------------------------------------------
              PINCODE SHIPPING CALCULATOR
              ---------------------------------------------------- */}
          <div className="border border-[#EDE6DA] rounded-2xl p-4 bg-gray-50 flex flex-col gap-3 mt-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4B352A] uppercase">
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              <span>Check Delivery Pincode</span>
            </div>
            
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="flex-grow bg-white border border-[#EDE6DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37] font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
              >
                Check
              </button>
            </form>
            {deliveryEstimate && (
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{deliveryEstimate}</span>
              </p>
            )}
          </div>

          {/* ----------------------------------------------------
              SHARE PRODUCTS ROW
              ---------------------------------------------------- */}
          <div className="flex items-center gap-3.5 pt-2 text-xs border-t border-[#EDE6DA]/40">
            <span className="text-gray-400 font-semibold flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Product:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => shareProduct('whatsapp')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-100 transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={() => shareProduct('facebook')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-bold border border-blue-100 transition-colors"
              >
                Facebook
              </button>
              <button
                onClick={() => shareProduct('copy')}
                className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors flex items-center justify-center"
                title="Copy Link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ----------------------------------------------------
          BOTTOM: INFORMATION SECTION & REVIEWS
          ---------------------------------------------------- */}
      <div className="mt-16 bg-white border border-[#EDE6DA] rounded-3xl p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col gap-6 text-[#1A1A1A]">
          <div className="prose max-w-none text-xs sm:text-sm text-gray-600 leading-relaxed">
            <h3 className="text-md font-serif font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">
              Materials & Care Instruction
            </h3>
              <p>
                Each KAELORA piece is crafted to complement both everyday and special occasion styling. To help maintain its appearance and finish:
              </p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5">
                <li>Avoid prolonged exposure to water, perfumes, deodorants, and harsh chemicals.</li>
                <li>Store in a clean, dry place when not in use.</li>
                <li>Wipe gently with a soft cloth after use to remove dust and moisture.</li>
                <li>Handle with care and avoid dropping or applying excessive pressure.</li>
                <li>Keep away from excessive heat and humidity to preserve its appearance over time.</li>
              </ul>
            </div>

{activeTab === 'specifications' && (
  <div className="w-full border-t border-[#EDE6DA] pt-6 mt-4">
    <h3 className="text-md font-serif font-bold uppercase tracking-wider mb-4">Product Specifications</h3>
    <table className="w-full text-xs text-left text-gray-600 border border-gray-100">
      <tbody>
        <tr className="border-b border-gray-50 bg-gray-50/50">
          <td className="px-4 py-3 font-semibold text-[#1A1A1A]">Material</td>
          <td className="px-4 py-3">{product.material || '-'}</td>
        </tr>
        <tr className="border-b border-gray-50">
          <td className="px-4 py-3 font-semibold text-[#1A1A1A]">Style</td>
          <td className="px-4 py-3">{product.style || '-'}</td>
        </tr>
        <tr className="border-b border-gray-50 bg-gray-50/50">
          <td className="px-4 py-3 font-semibold text-[#1A1A1A]">Occasion</td>
          <td className="px-4 py-3">{product.occasion || '-'}</td>
        </tr>
                  <tr className="border-b border-gray-50">
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A]">Weight</td>
                    <td className="px-4 py-3">{product.weight || '-'}</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A]">Availability</td>
                    <td className="px-4 py-3">{product.availability || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) }
        

        {/* Tab 2: Reviews moderated panels */}
        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-10">
            {/* Reviews display listing */}
            <div className="flex flex-col gap-6">
              {approvedReviews.length > 0 ? (
                approvedReviews.map((rev) => (
                  <div key={rev.id} className="border-b border-[#EDE6DA] pb-6 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-bold">{rev.userName}</h4>
                        <span className="text-[10px] text-gray-400">{new Date(rev.createdAt || '').toLocaleDateString('en-IN')}</span>
                      </div>
                      
                      {/* stars */}
                      <div className="flex text-amber-500 text-xs">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-body">
                      {rev.comment}
                    </p>

                    {rev.image && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#EDE6DA] shadow-sm bg-gray-50 mt-1 relative">
                        <Image src={rev.image} alt="User review photo" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-[#EDE6DA] rounded-xl p-4 bg-gray-50">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                    No approved reviews listed yet.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-body">
                    Be the first verified customer to share your experience!
                  </p>
                </div>
              )}
            </div>

            {/* WRITE A REVIEW FORM PANEL */}
            <div className="border-t border-[#EDE6DA] pt-8 mt-4 bg-gray-50 rounded-2xl p-6 border border-[#EDE6DA]">
              <h3 className="text-md font-serif font-bold uppercase tracking-wider mb-4 flex items-center gap-1">
                <span>Write A Customer Review</span>
              </h3>
              
              {user ? (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                  
                  {/* Stars select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4B352A]">
                      Select Star Rating:
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-2xl transition-transform hover:scale-110 active:scale-95"
                        >
                          <span className={star <= reviewRating ? 'text-amber-500' : 'text-gray-300'}>★</span>
                        </button>
                      ))}
                      <span className="text-xs text-gray-500 font-bold ml-1">({reviewRating}/5 Stars)</span>
                    </div>
                  </div>

                  {/* Comment input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4B352A]">
                      Review Comment:
                    </label>
                    <textarea
                      required
                      placeholder="Share your experience regarding delivery timeline, product packaging, and materials glow..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      className="w-full bg-white border border-[#EDE6DA] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#D4AF37] font-body resize-y"
                    />
                  </div>

                  {/* Photo upload input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4B352A]">
                      Upload Review Photo (Optional):
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setReviewPhoto(e.target.files ? e.target.files[0] : null)}
                        className="hidden"
                        id="reviewPhotoInput"
                      />
                      <label
                        htmlFor="reviewPhotoInput"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#EDE6DA] rounded-xl cursor-pointer text-xs font-semibold text-gray-600 hover:border-[#D4AF37] hover:bg-[#F8F5F0] transition-colors"
                      >
                        <Camera className="w-4 h-4 text-[#D4AF37]" />
                        <span>{reviewPhoto ? reviewPhoto.name : 'Choose Photo File'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full sm:w-56 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1"
                  >
                    {submittingReview ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{hasExistingReview ? 'Update Review' : 'Submit Review'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-500 font-semibold">
                    Please log in to your account to review this article.
                  </p>
                  <button
                    onClick={() => triggerToast("Please login from the navbar panel.", "info")}
                    className="mt-4 px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xl"
                  >
                    Login / Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

      {/* ----------------------------------------------------
          RELATED PRODUCTS SPLIT
          ---------------------------------------------------- */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Curated Pairings</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
              Related Products
            </h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
