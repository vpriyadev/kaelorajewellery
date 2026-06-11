'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { serviceDb, Product } from '../../lib/firebase';
import ProductCard from '../../components/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search and suggestions state
  const queryParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const wearTypeParam = searchParams.get('wearType') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState(queryParam);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedWearStyles, setSelectedWearStyles] = useState<string[]>(
    wearTypeParam ? wearTypeParam.split(',') : []
  );
  const [maxPrice, setMaxPrice] = useState(3000);
  const [sortBy, setSortBy] = useState<'featured' | 'priceLow' | 'priceHigh' | 'rating' | 'newest'>('featured');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync params to filters
  useEffect(() => {
    setSearchVal(queryParam);
    setSelectedCategory(categoryParam);
    setSelectedWearStyles(wearTypeParam ? wearTypeParam.split(',') : []);
  }, [queryParam, categoryParam, wearTypeParam]);

  // Load products
  useEffect(() => {
    setLoading(true);
    serviceDb.getProducts().then((allProducts) => {
      setProducts(allProducts);
      setLoading(false);
    });
  }, []);

  // Search suggestions calculations
  useEffect(() => {
    if (searchVal.trim().length > 1) {
      serviceDb.getProducts().then((prods) => {
        const matches = prods
          .filter(p => p.name.toLowerCase().includes(searchVal.toLowerCase()))
          .map(p => p.name)
          .slice(0, 5);
        setSuggestions(matches);
        setSuggestionsOpen(matches.length > 0);
      });
    } else {
      setSuggestions([]);
      setSuggestionsOpen(false);
    }
  }, [searchVal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestionsOpen(false);
    updateParams({ search: searchVal });
  };

  const selectSuggestion = (val: string) => {
    setSearchVal(val);
    setSuggestionsOpen(false);
    updateParams({ search: val });
  };

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === 'all') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSearchVal('');
    setSelectedCategory('all');
    setSelectedWearStyles([]);
    setMaxPrice(3000);
    setSortBy('featured');
    router.push('/shop');
  };

  // Filter & Sort math
  const filteredProducts = products
    .filter((prod) => {
      // Category Match
      if (selectedCategory !== 'all' && prod.category !== selectedCategory) return false;
      // Wear Type Match
      if (selectedWearStyles.length > 0) {
        const productStyles = prod.wearStyles || [];
        const hasMatch = selectedWearStyles.some(style => productStyles.includes(style));
        if (!hasMatch) return false;
      }
      // Price range match
      if (prod.discountPrice > maxPrice) return false;
      // Search matching name / description
      if (queryParam) {
        const query = queryParam.toLowerCase();
        return (
          prod.name.toLowerCase().includes(query) ||
          prod.description.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priceLow') return a.discountPrice - b.discountPrice;
      if (sortBy === 'priceHigh') return b.discountPrice - a.discountPrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.featured ? 1 : -1; // default featured first
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body relative">
      {/* Page Title */}
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Exquisite Curation</span>
        <h1 className="text-3xl sm:text-4xl font-display font-light tracking-wide text-[#1A1A1A] uppercase mt-1 tracking-wider">
          Explore Showcase
        </h1>
        <div className="w-12 h-px bg-[#D4AF37] mx-auto mt-4" />
      </div>



      {/* Main Grid structure */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ----------------------------------------------------
            LEFT COLUMN: DESKTOP SIDEBAR FILTERS
            ---------------------------------------------------- */}
        <aside className="hidden lg:flex flex-col gap-6 w-64 bg-[#F8F5F0] border border-amber-100 rounded-2xl p-6 shadow-sm sticky top-28">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <span className="text-xs uppercase tracking-widest font-normal text-[#1A1A1A]">Filters</span>
            <button
              onClick={clearAllFilters}
              className="text-xs uppercase tracking-widest text-[#D4AF37] hover:text-amber-700 font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs uppercase tracking-wider font-medium text-[#4B352A]">Category</h4>
            <div className="flex flex-col gap-1.5 mt-1">
              {['all', 'earrings', 'chains', 'bangles'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    updateParams({ category: cat });
                  }}
                  className={`text-xs text-left py-1.5 px-2.5 rounded-lg capitalize font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#1A1A1A] text-[#EDE6DA]'
                      : 'hover:bg-white text-gray-600 hover:text-black border border-transparent hover:border-amber-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-[#4B352A]">
              <span>Max Price</span>
              <span className="font-display font-normal tracking-wide text-[#1A1A1A]">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="300"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] mt-1"
            />
          </div>

          {/* Wear Type Filter */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs uppercase tracking-wider font-medium text-[#4B352A]">Wear Style</h4>
            <div className="flex flex-col gap-1.5 mt-1">
              {['Daily Wear', 'Casual Wear', 'Party Wear', 'Traditional Wear', 'Festive Wear'].map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    let newStyles = [...selectedWearStyles];
                    if (newStyles.includes(style)) {
                      newStyles = newStyles.filter(s => s !== style);
                    } else {
                      newStyles.push(style);
                    }
                    setSelectedWearStyles(newStyles);
                    updateParams({ wearType: newStyles.length > 0 ? newStyles.join(',') : null });
                  }}
                  className={`text-xs text-left py-1.5 px-2.5 rounded-lg capitalize font-medium transition-colors ${
                    selectedWearStyles.includes(style)
                      ? 'bg-[#1A1A1A] text-[#EDE6DA]'
                      : 'hover:bg-white text-gray-600 hover:text-black border border-transparent hover:border-amber-100'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ----------------------------------------------------
            RIGHT COLUMN: PRODUCT GRID
            ---------------------------------------------------- */}
        <div className="flex-1 w-full">
          {/* Controls Bar (Filter toggle & Sorting) */}
          <div className="flex items-center justify-between bg-white border border-amber-100 rounded-xl px-4 py-3 mb-6 gap-4">
            {/* Mobile Filter toggle */}
            <button
              onClick={() => setShowFiltersMobile(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-amber-100 hover:border-[#D4AF37] text-xs font-medium uppercase tracking-wider rounded-lg transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Total count */}
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium hidden sm:inline">
              Showing {filteredProducts.length} Articles
            </span>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs ml-auto">
              <span className="text-gray-400 font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort By:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-gray-50 border border-amber-100 rounded-lg px-2 py-1.5 text-xs text-[#1A1A1A] font-medium focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="featured">Featured Articles</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Customer Ratings</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>

          {/* Grid list display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                Accessing Jewellery Box...
              </span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            /* Empty Filter State */
            <div className="text-center py-20 bg-[#F8F5F0] border border-dashed border-amber-100 rounded-2xl p-6">
              <h3 className="text-lg font-display font-medium tracking-wide text-[#1A1A1A] uppercase tracking-wider">
                No Jewellery Found
              </h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed mt-2">
                We couldn&apos;t locate articles matching your active search filters. Try loosening filters or click below to refresh.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-medium uppercase tracking-wider rounded-xl transition-transform duration-200 shadow-md active:scale-95"
              >
                View All Products
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ----------------------------------------------------
          MOBILE DRAWER FILTERS INTERFACE
          ---------------------------------------------------- */}
      <AnimatePresence>
        {showFiltersMobile && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFiltersMobile(false)}
              className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm"
            />

            {/* Slider Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-80 h-full bg-[#F8F5F0] shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                  <span className="text-xs uppercase tracking-widest font-normal text-[#1A1A1A]">Filters</span>
                  <button
                    onClick={() => setShowFiltersMobile(false)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs uppercase tracking-wider font-medium text-[#4B352A]">Category</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['all', 'earrings', 'chains', 'bangles'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          updateParams({ category: cat });
                        }}
                        className={`text-xs py-1.5 px-3 rounded-lg capitalize font-medium transition-colors border ${
                          selectedCategory === cat
                            ? 'bg-[#1A1A1A] border-[#1A1A1A] text-[#EDE6DA]'
                            : 'bg-white text-gray-600 border-amber-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-[#4B352A]">
                    <span>Max Price</span>
                    <span className="font-display font-normal tracking-wide text-[#1A1A1A]">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="3000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                  />
                </div>

                {/* Wear style */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs uppercase tracking-wider font-medium text-[#4B352A]">Wear Style</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['Daily Wear', 'Casual Wear', 'Party Wear', 'Traditional Wear', 'Festive Wear'].map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          let newStyles = [...selectedWearStyles];
                          if (newStyles.includes(style)) {
                            newStyles = newStyles.filter(s => s !== style);
                          } else {
                            newStyles.push(style);
                          }
                          setSelectedWearStyles(newStyles);
                          updateParams({ wearType: newStyles.length > 0 ? newStyles.join(',') : null });
                        }}
                        className={`text-xs py-1.5 px-3 rounded-lg capitalize font-medium transition-colors border ${
                          selectedWearStyles.includes(style)
                            ? 'bg-[#1A1A1A] border-[#1A1A1A] text-[#EDE6DA]'
                            : 'bg-white border-amber-100 text-gray-600'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer footer action */}
              <div className="flex items-center gap-4 mt-8 pt-4 border-t border-amber-100">
                <button
                  onClick={clearAllFilters}
                  className="flex-grow py-3 bg-white hover:bg-gray-50 border border-amber-100 text-[#1A1A1A] text-xs font-medium uppercase tracking-wider rounded-xl font-body"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="flex-grow py-3 bg-[#1A1A1A] text-[#EDE6DA] text-xs font-medium uppercase tracking-wider rounded-xl font-body"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-sm font-body text-neutral-400 tracking-widest uppercase animate-pulse">
          Loading...
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
