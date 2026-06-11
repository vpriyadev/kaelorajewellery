'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { serviceDb, Product } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Instagram, Facebook, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeSlug } from '../lib/slugUtils';

export default function HomePage() {
  const { triggerToast } = useApp();
// Removed static bestSellers and newArrivals state; using derived arrays from allProducts
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [heroBanner, setHeroBanner] = useState<any>(null);

  const heroImageUrl = '/images/hero banner.png';
  const heroImageAlt = heroBanner?.title || 'KAELORA Jewellery hero image';

  useEffect(() => {
    const loadHeroBanner = async () => {
      try {
        const banner = await serviceDb.getHeroBanner();
        setHeroBanner(banner);
      } catch (error) {
        console.error('[HomePage] Failed to load hero banner:', error);
      }
    };
    loadHeroBanner();
    const unsub = (serviceDb as any).onHeroBannerChanged((banner: any) => {
      setHeroBanner(banner);
    });
    return () => {
      try {
        if (typeof unsub === 'function') unsub();
      } catch {}
    };
  }, []);

  useEffect(() => {
    const unsub = (serviceDb as any).onProductsChanged((products: Product[]) => {
      setAllProducts(products);
    });
    return () => {
      try { if (typeof unsub === 'function') unsub(); } catch {}
    };
  }, []);

  // Helper: pick latest product image for a category. Prefer New Arrivals, then latest product. Exclude logo/static placeholders.
  const getCategoryImage = (categoryKey: 'earrings' | 'chains' | 'bangles') => {
    const logoMarker = 'logo-burgundy';
    // Prefer products explicitly marked to show in Shop by Category
    const byShopFlag = allProducts
      .filter(p => p.category === categoryKey && p.showInShopByCategory === true && Array.isArray(p.images) && p.images.length > 0)
      .sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    const byNewArrival = allProducts
      .filter(p => p.category === categoryKey && p.showInNewArrivals && Array.isArray(p.images) && p.images.length > 0)
      .sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    let pick = byShopFlag[0] || byNewArrival[0];
    if (!pick) {
      const byLatest = allProducts
        .filter(p => p.category === categoryKey && Array.isArray(p.images) && p.images.length > 0)
        .sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      pick = byLatest[0];
    }

    if (!pick) return undefined;
    const img = Array.isArray(pick.images) && pick.images.length > 0 ? pick.images[0] : undefined;
    const url = typeof img === 'string' ? img : img?.url;
    if (!url) return undefined;
    if (String(url).includes(logoMarker)) return undefined;
    return url;
  };

  const getProductImageUrl = (p: Product) => {
    if (!p || !Array.isArray(p.images) || p.images.length === 0) return undefined;
    const firstImage = p.images[0];
    if (typeof firstImage === 'string') return firstImage;
    if (firstImage && typeof firstImage.url === 'string') return firstImage.url;
    return undefined;
  };

  const hasValidImage = (p: Product) => {
    const logoMarker = 'logo-burgundy';
    const url = getProductImageUrl(p);
    if (!url) return false;
    const raw = url.trim();
    if (!raw) return false;
    if (raw.startsWith('data:')) return false;
    if (raw.includes(logoMarker)) return false;
    return true;
  };

  const categoriesData = [
    {
      name: 'Earrings',
      tagline: 'Delicate sparkles for your ears.',
      href: '/shop?category=earrings',
      image: getCategoryImage('earrings'),
      count: (allProducts.filter(p => p.category === 'earrings' && p.showInShopByCategory === true).length) || allProducts.filter(p => p.category === 'earrings').length,
    },
    {
      name: 'Chains',
      tagline: 'Lustrous necklaces cast in gold.',
      href: '/shop?category=chains',
      image: getCategoryImage('chains'),
      count: (allProducts.filter(p => p.category === 'chains' && p.showInShopByCategory === true).length) || allProducts.filter(p => p.category === 'chains').length,
    },
    {
      name: 'Bangles',
      tagline: 'Feminine wrist cuffs with filigree.',
      href: '/shop?category=bangles',
      image: getCategoryImage('bangles'),
      count: (allProducts.filter(p => p.category === 'bangles' && p.showInShopByCategory === true).length) || allProducts.filter(p => p.category === 'bangles').length,
    },
  ];

  // New Arrivals: prefer products flagged showInNewArrivals and with valid images; if none, fallback to latest products with valid images
  const validNewArrivals = allProducts.filter(
    p => p.showInNewArrivals === true && hasValidImage(p)
  );

  const newArrivalProducts = validNewArrivals.length > 0
    ? [...validNewArrivals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [...allProducts]
        .filter(p => hasValidImage(p))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);

  // Featured Collections: products flagged by exact Firestore field
  const rawFeatured = allProducts.filter(
    p => p.showInFeaturedCollections === true && hasValidImage(p)
  );
  const featuredProducts = rawFeatured.length > 0
    ? rawFeatured.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : allProducts.filter(p => hasValidImage(p)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  // Trending collections driven by Firestore fields
  const trendingProducts = allProducts
    .filter(p => p.showInTrending === true && hasValidImage(p))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const products = allProducts;
  console.log(products);
  console.log(products.filter(p => p.showInFeaturedCollections === true));
  console.log(products.filter(p => p.showInNewArrivals === true));
  console.log(products.filter(p => p.showInTrending === true));
  console.log('featuredProducts', featuredProducts);
  console.log('newArrivalProducts', newArrivalProducts);
  console.log('trendingProducts', trendingProducts);


// collections removed; sections will be rendered dynamically based on product flags

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
      <section className="hidden md:flex relative min-h-dvh sm:h-dvh w-full items-center justify-center overflow-hidden">
        {/* ================= DESKTOP HERO ================= */}
        <div className="hidden md:flex absolute inset-0 z-0 w-full h-full">
          {/* Desktop Hero Image Background */}
          <Image
            src={heroBanner?.imageUrl || heroImageUrl}
            alt={heroBanner?.imageUrl ? 'Hero Banner' : heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center w-full h-full"
          />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/30 z-5" />

          {/* Desktop Hero Content */}
          <div className="relative max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center z-20 h-full w-full">
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="text-lg sm:text-2xl font-body font-normal text-[#EDE6DA] tracking-[0.15em] uppercase mb-4"
            >
              Affordable • Elegant • Beautiful
            </motion.p>
            
            {/* Buttons container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto"
            >
              {heroBanner?.imageUrl && heroBanner?.buttonText && (
                <Link
                  href={heroBanner?.buttonLink?.trim() ? heroBanner.buttonLink : '/shop'}
                  className="w-full sm:w-56 py-4 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#EDE6DA] text-xs font-medium uppercase tracking-[0.2em] rounded-3xl transition-transform duration-200 shadow-xl shadow-gray-400/20 active:scale-95 flex items-center justify-center gap-1.5 group border border-gray-800"
                >
                  <span>{heroBanner.buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-56"
              >
                <Link
                  href="/shop"
                  className="w-full h-full flex items-center justify-center py-4 bg-white/85 hover:bg-white text-[#1A1A1A] text-xs font-medium uppercase tracking-[0.2em] rounded-3xl transition-transform duration-200 shadow-md active:scale-95 border border-amber-100 hover:border-[#D4AF37]"
                >
                  <span>Shop Now</span>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-8 flex flex-col items-center gap-1.5 opacity-60 text-xs text-white font-body font-medium uppercase tracking-widest cursor-pointer"
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Scroll Down</span>
              <div className="w-[1.5px] h-6 bg-[#D4AF37] rounded-full" />
            </motion.div>
          </div>
        </div>

        </section>

        {/* ================= MOBILE HERO ================= */}
        <div className="flex md:hidden relative w-full h-[75vw] max-h-[420px] px-4 mt-26">
          {/* Mobile Hero Image Container */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-amber-100/50">
            <Image
              src="/images/hero-mobile2.png"
              alt="Hero Banner Mobile"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_15%] w-full h-full"
            />
            
            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl"
              style={{background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'}}>
              <div className="p-5 pb-6">
                
                {/* Small label — no background, just clean text */}
                <p className="text-white/60 text-xs font-body tracking-[0.3em] uppercase mb-3">
                  New Collection 2025
                </p>

                {/* Main headline */}
                <h1 className="font-display font-light text-[1.75rem] text-white leading-[1.15] tracking-wide mb-5">
                  Minimal<br/>Everyday Jewellery
                </h1>

                {/* Two matching buttons — same size, same shape */}
                <div className="flex items-center gap-3">
                  <Link href="/shop"
                    className="flex-1 text-center bg-white text-[#1A1A1A] text-xs font-body font-medium tracking-[0.2em] uppercase py-2.5 rounded-full transition-colors hover:bg-white/90">
                    Shop Now
                  </Link>
                  <Link href="/shop?category=earrings"
                    className="flex-1 text-center bg-transparent border border-white/70 text-white text-xs font-body font-medium tracking-[0.2em] uppercase py-2.5 rounded-full hover:bg-white/10 transition-colors">
                    New Arrivals
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>

      <section id="categories" className="py-20 bg-[#F8F5F0] border-t border-amber-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Exquisite Selection</span>
            <h2 className="text-3xl sm:text-4xl font-display font-light text-[#1A1A1A] tracking-wide mt-1">
              Shop By Categories
            </h2>
            <div className="w-12 h-px bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categoriesData.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="group relative h-96 rounded-[2rem] overflow-hidden border border-amber-100 shadow-lg hover:shadow-2xl transition-colors duration-300 bg-white"
              >
                <div
                  className={`absolute inset-0 transition-transform duration-700 group-hover:scale-105 ${!cat.image ? 'bg-gradient-to-br from-[#F8F5F0] to-[#EFE9E2]' : 'bg-cover bg-center'}`}
                  style={cat.image ? { backgroundImage: `url('${cat.image}')` } : undefined}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/85 via-transparent to-transparent z-10" />

                <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-col justify-end gap-2 text-white">
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium font-body">
                    {cat.count} {cat.count === 1 ? 'Model' : 'Models'}
                  </span>
                  <h3 className="text-3xl font-body font-medium tracking-widest uppercase">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-200/90 font-body leading-relaxed mb-4">
                    {cat.tagline}
                  </p>
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#D4AF37] hover:text-white transition-colors font-body"
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

      <section className="py-20 bg-white border-t border-amber-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Luxury Lookbook</span>
            <h2 className="text-3xl sm:text-4xl font-display font-light text-[#1A1A1A] tracking-wide mt-1">
              Featured Collections
            </h2>
            <div className="w-12 h-px bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredProducts.slice(0, 3).map((coll, idx) => (
              <motion.div
                key={coll.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="flex flex-col rounded-[2rem] border border-amber-100 overflow-hidden bg-[#F8F5F0] hover:shadow-xl transition-colors duration-200"
              >
                <div className="h-72 overflow-hidden relative group">
                  {(() => {
                    const imgRaw = coll.images && coll.images[0] ? (typeof coll.images[0] === 'string' ? coll.images[0] : coll.images[0]?.url) : undefined;
                    if (imgRaw && !String(imgRaw).includes('logo-burgundy')) {
                      return (
                        <Image
                          src={imgRaw}
                          alt={coll.name}
                          fill
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      );
                    }
                    return <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-sm text-gray-500">No image available</div>;
                  })()}
                  <div className="absolute inset-0 bg-[#1A1A1A]/10" />
                </div>
                <div className="p-6 flex flex-col justify-between flex-grow gap-4">
                  <div>
                    <h3 className="text-xl font-body font-medium tracking-widest uppercase text-[#1A1A1A]">
                      {coll.name}
                    </h3>
                  </div>
                  <Link
                    href={`/product/${normalizeSlug(coll.slug)}`}
                    className="inline-flex items-center gap-1 px-5 py-3 bg-white border border-amber-100 hover:border-[#D4AF37] text-xs font-medium uppercase tracking-wider text-[#1A1A1A] rounded-2xl transition-colors duration-200 font-body"
                  >
                    <span>Explore Product</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-amber-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Latest Additions</span>
              <h2 className="text-3xl font-display font-light text-[#1A1A1A] tracking-wide mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[#1A1A1A] hover:text-[#D4AF37] transition-colors border-b border-[#1A1A1A] hover:border-[#D4AF37] pb-1 font-body"
            >
              <span>View All Arrivals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div
            className="grid gap-6 justify-center"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 320px))' }}
          >
            {newArrivalProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-full max-w-xs rounded-[2rem] border border-amber-100 bg-white overflow-hidden shadow-sm"
              >
                <Link href={`/product/${normalizeSlug(prod.slug)}`} className="block w-full">
                  <div className="w-full">
                    {(() => {
                      const imgRaw = prod.images && prod.images[0]
                        ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0]?.url)
                        : undefined;
                      return imgRaw ? (
                        <Image
                          src={imgRaw}
                          width={320}
                          height={380}
                          alt={prod.name}
                          className="w-full h-96 object-cover"
                        />
                      ) : (
                        <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-sm text-gray-500">
                          No image available
                        </div>
                      );
                    })()}
                  </div>
                </Link>
                <div className="p-5 flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#4B352A] font-medium">
                    {prod.category}
                  </span>
                  <Link href={`/product/${normalizeSlug(prod.slug)}`} className="text-lg font-body font-medium tracking-widest uppercase text-[#1A1A1A] hover:text-[#D4AF37] transition-colors">
                    {prod.name}
                  </Link>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[#1A1A1A] font-semibold">₹{prod.discountPrice.toLocaleString('en-IN')}</span>
                    {prod.price > prod.discountPrice && (
                      <span className="text-xs text-gray-400 line-through">₹{prod.price.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8F5F0] border-t border-amber-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Trending</span>
            <h2 className="text-3xl sm:text-4xl font-display font-light text-[#1A1A1A] tracking-wide mt-1">
              Trending Products
            </h2>
            <div className="w-12 h-px bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div
            className="grid gap-6 justify-center"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 320px))' }}
          >
            {trendingProducts.length > 0 ? (
              trendingProducts.map((prod) => (
                <div key={prod.id} className="w-full max-w-xs">
                  <ProductCard product={prod} />
                </div>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-96 rounded-2xl bg-white border border-amber-100 animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8F5F0] border-t border-amber-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Our Values</span>
            <h2 className="text-3xl sm:text-4xl font-display font-light text-[#1A1A1A] tracking-wide mt-1">
              Why Choose KAELORA
            </h2>
            <div className="w-12 h-px bg-[#D4AF37] mx-auto mt-4" />
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
                className="bg-white p-6 rounded-[2rem] border border-amber-100 text-center flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-[#EDE6DA]/30 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-base font-body font-medium tracking-widest uppercase text-[#1A1A1A]">
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

      <section className="py-20 bg-white border-t border-amber-100/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Social Verification</span>
            <h2 className="text-3xl font-display font-light text-[#1A1A1A] tracking-wide mt-1">
              Customer Reviews
            </h2>
            <div className="w-12 h-px bg-[#D4AF37] mx-auto mt-4" />
          </div>









          <div className="relative bg-[#F8F5F0] rounded-[2rem] border border-amber-100 p-6 sm:p-10 shadow-sm overflow-hidden flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-md flex-shrink-0 bg-gray-100">
              <Image
                src={clientReviews[currentReviewIndex].photo}
                alt={clientReviews[currentReviewIndex].name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-amber-500">
                <span className="text-base tracking-[0.08em]">★★★★★</span>
                <span className="text-xs text-gray-500 font-body font-medium ml-2">
                  ({Number(clientReviews[currentReviewIndex].rating).toFixed(1)})
                </span>
              </div>
              <p className="text-sm sm:text-base italic text-gray-700 leading-relaxed font-body">
                &quot;{clientReviews[currentReviewIndex].comment}&quot;
              </p>
              <div>
                <h4 className="text-base font-body font-medium tracking-widest uppercase text-[#1A1A1A]">
                  {clientReviews[currentReviewIndex].name}
                </h4>
                <span className="text-xs uppercase tracking-wider text-emerald-600 font-normal font-body">
                  {clientReviews[currentReviewIndex].role}
                </span>
              </div>
            </div>

            <div className="absolute right-4 bottom-4 flex items-center gap-2">
              <button
                onClick={handlePrevReview}
                className="p-2 bg-white rounded-full hover:bg-gray-100 border border-amber-100 shadow-sm text-gray-600 hover:text-black transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextReview}
                className="p-2 bg-white rounded-full hover:bg-gray-100 border border-amber-100 shadow-sm text-gray-600 hover:text-black transition-colors"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-t border-amber-100/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#EDE6DA]/30 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Assistance Desk</span>
          <h2 className="text-3xl font-display font-light text-[#1A1A1A] tracking-wide mt-1">
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
              className="w-full sm:w-auto px-8 py-3.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-medium text-xs uppercase tracking-wider rounded-2xl transition-transform duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2 font-body"
            >
              <span>WhatsApp Us</span>
            </a>
            <a
              href="https://www.instagram.com/kaelora.jewellery"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 text-white font-medium text-xs uppercase tracking-wider rounded-2xl transition-transform duration-200 hover:opacity-90 shadow-md active:scale-95 flex items-center justify-center gap-2 font-body"
              style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
            >
              <Instagram className="w-4 h-4 text-white" />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61590032346143"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1877F2] hover:bg-[#0C63D4] text-white font-medium text-xs uppercase tracking-wider rounded-2xl transition-transform duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2 font-body"
            >
              <Facebook className="w-4 h-4 text-white" />
              <span>Facebook</span>
            </a>
            <button
              onClick={() => triggerToast('Customer Care Desk: Call +91 6305517109. Email jashujash1107@gmail.com', 'info')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#EDE6DA] font-medium text-xs uppercase tracking-wider rounded-2xl transition-transform duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2 font-body"
            >
              <span>Contact Details</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
