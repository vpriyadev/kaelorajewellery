'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { serviceDb, Product } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Instagram, Facebook, MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { triggerToast } = useApp();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    serviceDb.getProducts().then((products) => {
      setBestSellers(products.filter((item) => item.bestSeller).slice(0, 4));
      setNewArrivals(
        [...products]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4)
      );
    });
  }, []);

  const categories = [
    {
      name: 'Earrings',
      tagline: 'Delicate sparkles for your ears.',
      href: '/shop?category=earrings',
      image: '/images/logo-burgundy.jpg',
      count: '7 Models',
    },
    {
      name: 'Chains',
      tagline: 'Lustrous necklaces cast in gold.',
      href: '/shop?category=chains',
      image: '/images/logo-burgundy.jpg',
      count: '7 Models',
    },
    {
      name: 'Bangles',
      tagline: 'Feminine wrist cuffs with filigree.',
      href: '/shop?category=bangles',
      image: '/images/logo-burgundy.jpg',
      count: '7 Models',
    },
  ];

  const collections = [
    {
      title: 'Daily Wear Collection',
      description: 'Elegant, lightweight tarnish-free articles optimized for active daily lives.',
      href: '/shop?wearType=daily',
      image: '/images/logo-burgundy.jpg',
    },
    {
      title: 'Party Wear Collection',
      description: 'Stunning AAA pave drops and statement wrist cuffs designed to wow crowds.',
      href: '/shop?wearType=party',
      image: '/images/logo-burgundy.jpg',
    },
    {
      title: 'Trending Collection',
      description: 'Modern filigree work, butterfly charms, and shell pearls picked by top editors.',
      href: '/shop?featured=true',
      image: '/images/logo-burgundy.jpg',
    },
  ];

  const clientReviews = [
    {
      name: 'Priya Sharma',
      role: 'Verified Purchase',
      comment:
        'Absolutely stunning! The butterfly earrings glow beautifully under sunlight. Extremely lightweight and comfortable. I got my free gift as well!',
      rating: 5,
      photo: '/images/logo-burgundy.jpg',
    },
    {
      name: 'Meera Nair',
      role: 'Verified Purchase',
      comment:
        'The Daily Wear Chain is extremely durable. I have been wearing it in shower and there is zero tarnish! Excellent design quality.',
      rating: 5,
      photo: '/images/logo-burgundy.jpg',
    },
    {
      name: 'Komal Patel',
      role: 'Verified Purchase',
      comment:
        'Highly premium pearl and gold shine, very elegant. Fast delivery within 3 days to Mumbai! Will definitely buy more.',
      rating: 4.8,
      photo: '/images/logo-burgundy.jpg',
    },
  ];

  const handleNextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % clientReviews.length);
  };

  const handlePrevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + clientReviews.length) % clientReviews.length);
  };

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <section className="relative h-[90vh] sm:h-screen w-full flex items-center justify-center bg-[#F8F5F0] overflow-hidden -mt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#EDE6DA]/20 to-[#F8F5F0] z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_60%)] z-10" />
        <motion.div
          initial={{ opacity: 0.08, scale: 1.0 }}
          animate={{ opacity: 0.10, scale: 1 }}
          transition={{ duration: 2.4 }}
          className="absolute inset-0 z-0 bg-center bg-no-repeat filter blur-[1px] bg-[length:72%_auto] sm:bg-[length:84%_auto] md:bg-[length:96%_auto] lg:bg-[length:108%_auto]"
          style={{
            backgroundImage: `url('/images/logo-burgundy.jpg')`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <div className="absolute inset-0 opacity-40 z-10 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-2 h-2 bg-[#D4AF37]/40 rounded-full blur-lg" style={{ animationDuration: '7s' }} />
          <div className="absolute bottom-2/5 right-14 w-3 h-3 bg-[#D4AF37]/30 rounded-full blur-xl" style={{ animationDuration: '8.5s' }} />
          <div className="absolute top-1/2 right-24 w-1.5 h-1.5 bg-[#D4AF37]/50 rounded-full blur-sm" style={{ animationDuration: '5.4s' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center z-20 h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-white/80 backdrop-blur-sm shadow-xl mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#4B352A] font-bold font-serif">
              Elegant • Affordable • Beautiful
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-serif font-semibold text-[#1A1A1A] tracking-wide leading-tight uppercase max-w-4xl"
          >
            Every Piece <br className="sm:hidden" />
            <span className="italic text-[#4B352A] font-light bg-gradient-to-r from-[#4B352A] via-[#D4AF37] to-[#4B352A] bg-clip-text text-transparent">
              Completes
            </span>{' '}
            Your Style
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="text-xs sm:text-base text-[#4B352A] max-w-2xl mt-5 font-body leading-relaxed uppercase tracking-widest font-medium"
          >
            Discover beautiful earrings, chains and bangles designed to make every moment special.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto"
          >
            <Link
              href="/shop"
              className="w-full sm:w-56 py-4 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#EDE6DA] text-xs font-semibold uppercase tracking-[0.2em] rounded-3xl transition-all shadow-xl shadow-gray-400/20 active:scale-95 flex items-center justify-center gap-1.5 group border border-gray-800"
            >
              <span>Shop Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/shop?featured=true"
              className="w-full sm:w-56 py-4 bg-white/85 hover:bg-white text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.2em] rounded-3xl transition-all shadow-md active:scale-95 border border-[#EDE6DA] flex items-center justify-center hover:border-[#D4AF37]"
            >
              <span>New Arrivals</span>
            </Link>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 flex flex-col items-center gap-1.5 opacity-60 text-xs text-[#4B352A] font-body font-semibold uppercase tracking-widest cursor-pointer"
            onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span>Scroll Down</span>
            <div className="w-[1.5px] h-6 bg-[#D4AF37] rounded-full" />
          </motion.div>
        </div>
      </section>

      <section id="categories" className="py-20 bg-[#F8F5F0] border-t border-[#EDE6DA]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Exquisite Selection</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
              Shop By Categories
            </h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="group relative h-96 rounded-[2rem] overflow-hidden border border-[#EDE6DA] shadow-lg hover:shadow-2xl transition-all duration-500 bg-white"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${cat.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/85 via-transparent to-transparent z-10" />

                <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-col justify-end gap-2 text-white">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold font-body">
                    {cat.count}
                  </span>
                  <h3 className="text-3xl font-serif font-semibold uppercase tracking-wider">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-200/90 font-body leading-relaxed mb-4">
                    {cat.tagline}
                  </p>
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] hover:text-white transition-colors font-body"
                  >
                    <span>View Category</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-[#EDE6DA]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Luxury Lookbook</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
              Featured Collections
            </h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {collections.map((coll, idx) => (
              <motion.div
                key={coll.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="flex flex-col rounded-[2rem] border border-[#EDE6DA] overflow-hidden bg-[#F8F5F0] hover:shadow-xl transition-all duration-300"
              >
                <div className="h-72 overflow-hidden relative group">
                  <img
                    src={coll.image}
                    alt={coll.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#1A1A1A]/10" />
                </div>
                <div className="p-6 flex flex-col justify-between flex-grow gap-4">
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-[#1A1A1A] uppercase tracking-wide">
                      {coll.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-body mt-3">
                      {coll.description}
                    </p>
                  </div>
                  <Link
                    href={coll.href}
                    className="inline-flex items-center gap-1 px-5 py-3 bg-white border border-[#EDE6DA] hover:border-[#D4AF37] text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] rounded-2xl transition-all font-body"
                  >
                    <span>Explore Lookbook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8F5F0] border-t border-[#EDE6DA]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Customer Favorites</span>
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
                Best Sellers
              </h2>
            </div>
            <Link
              href="/shop?featured=true"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] hover:text-[#D4AF37] transition-colors border-b border-[#1A1A1A] hover:border-[#D4AF37] pb-1 font-body"
            >
              <span>View All Best Sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.length > 0 ? (
              bestSellers.map((prod) => <ProductCard key={prod.id} product={prod} />)
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-96 rounded-2xl bg-white border border-[#EDE6DA] animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-[#EDE6DA]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Latest Additions</span>
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] hover:text-[#D4AF37] transition-colors border-b border-[#1A1A1A] hover:border-[#D4AF37] pb-1 font-body"
            >
              <span>View All Arrivals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.length > 0 ? (
              newArrivals.map((prod) => <ProductCard key={prod.id} product={prod} />)
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-96 rounded-2xl bg-white border border-[#EDE6DA] animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8F5F0] border-t border-[#EDE6DA]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Our Values</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
              Why Choose KAELORA
            </h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Trendy Designs',
                desc: 'Exquisite curation of modern butterfly shapes, filigrees and classics matched to contemporary wardrobes.',
              },
              {
                title: 'Affordable Prices',
                desc: 'Premium double-plated articles without luxury markup tags. Pure elegance made completely accessible.',
              },
              {
                title: 'Premium Quality',
                desc: 'Hypoallergenic surgical steel bodies, AAA cubic zirconia and shell pearl finishes designed to last.',
              },
              {
                title: 'Secure Shopping',
                desc: 'Local storage plus Firestore-ready persistence, encrypted checkout flow, fast support via WhatsApp.',
              },
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white p-6 rounded-[2rem] border border-[#EDE6DA] text-center flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-[#EDE6DA]/30 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-base font-serif font-semibold text-[#1A1A1A] uppercase tracking-wide">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-body mt-3">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-[#EDE6DA]/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Social Verification</span>
            <h2 className="text-3xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
              Customer Reviews
            </h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="relative bg-[#F8F5F0] rounded-[2rem] border border-[#EDE6DA] p-6 sm:p-10 shadow-sm overflow-hidden flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-md flex-shrink-0 bg-gray-100">
              <img
                src={clientReviews[currentReviewIndex].photo}
                alt={clientReviews[currentReviewIndex].name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-amber-500">
                <span className="text-base tracking-[0.08em]">★★★★★</span>
                <span className="text-xs text-gray-500 font-body font-semibold ml-2">
                  ({Number(clientReviews[currentReviewIndex].rating).toFixed(1)})
                </span>
              </div>
              <p className="text-sm sm:text-base italic text-gray-700 leading-relaxed font-body">
                &quot;{clientReviews[currentReviewIndex].comment}&quot;
              </p>
              <div>
                <h4 className="text-base font-serif font-semibold text-[#1A1A1A]">
                  {clientReviews[currentReviewIndex].name}
                </h4>
                <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold font-body">
                  {clientReviews[currentReviewIndex].role}
                </span>
              </div>
            </div>

            <div className="absolute right-4 bottom-4 flex items-center gap-2">
              <button
                onClick={handlePrevReview}
                className="p-2 bg-white rounded-full hover:bg-gray-100 border border-[#EDE6DA] shadow-sm text-gray-600 hover:text-black transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextReview}
                className="p-2 bg-white rounded-full hover:bg-gray-100 border border-[#EDE6DA] shadow-sm text-gray-600 hover:text-black transition-colors"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8F5F0] border-t border-[#EDE6DA]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Most Loved</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
              Customer Favorites
            </h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-[#EDE6DA]/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#EDE6DA]/30 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Assistance Desk</span>
          <h2 className="text-3xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
            Need Help Choosing?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed mt-4 font-body">
            Get styling recommendations or track active orders directly with our customer concierge specialists. We are online 24/7!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a
              href="https://wa.me/916305517109?text=Hello%20KAELORA%20Jewellery%2C%20I'm%20interested%20in%20your%20jewellery%20collection."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 font-body"
            >
              <span>WhatsApp Us</span>
            </a>
            <a
              href="https://www.instagram.com/kaelora.jewellery"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#EDE6DA] hover:border-[#D4AF37] text-[#1A1A1A] font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 font-body"
            >
              <Instagram className="w-4 h-4 text-[#D4AF37]" />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61590032346143"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#EDE6DA] hover:border-[#D4AF37] text-[#1A1A1A] font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 font-body"
            >
              <Facebook className="w-4 h-4 text-[#D4AF37]" />
              <span>Facebook</span>
            </a>
            <button
              onClick={() => triggerToast('Customer Care Desk: Call +91 6305517109. Email jashujash1107@gmail.com', 'info')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#EDE6DA] font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 font-body"
            >
              <span>Contact Details</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
