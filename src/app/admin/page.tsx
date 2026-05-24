'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { serviceDb, Product, Order, Address, Review, dbSimulator } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Plus, Pencil, Trash, Check, X, ShieldAlert, Award, Package, ShoppingBag, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, settings, updateGlobalSettings, addProduct, updateProduct, deleteProduct, triggerToast } = useApp();
  const router = useRouter();

  // Admin access gatekeeper check
  useEffect(() => {
    if (user && !user.isAdmin) {
      triggerToast("Access restricted: Administrators only.", "error");
      router.push('/account');
    }
  }, [user]);

  // Tab controllers
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'reviews' | 'settings'>('products');

  // Dynamic lists from DB simulator
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Statistics counters
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    reviews: 0,
    sales: 0
  });

  // Modal open/close frames
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Configuration forms
  const [shipLimit, setShipLimit] = useState(settings.freeShippingLimit);
  const [shipFee, setShipFee] = useState(settings.standardShippingCharge);
  const [codFee, setCodFee] = useState(settings.codFee);
  const [giftGoal, setGiftGoal] = useState(settings.giftGoal);

  // New Product inputs
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState(1200);
  const [pDiscPrice, setPDiscPrice] = useState(999);
  const [pCategory, setPCategory] = useState('earrings');
  const [pWearType, setPWearType] = useState('daily');
  const [pStock, setPStock] = useState(15);
  const [pDesc, setPDesc] = useState('');
  const [pFeatured, setPFeatured] = useState(false);
  const [pBestSeller, setPBestSeller] = useState(false);

  // Sync settings when loaded
  useEffect(() => {
    setShipLimit(settings.freeShippingLimit);
    setShipFee(settings.standardShippingCharge);
    setCodFee(settings.codFee);
    setGiftGoal(settings.giftGoal);
  }, [settings]);

  // Refresh lists
  const loadDatabaseRecords = () => {
    serviceDb.getProducts().then((p) => {
      setProducts(p);
      setStats(prev => ({ ...prev, products: p.length }));
    });

    // fetch all orders simulation (pass undefined to get all)
    serviceDb.getOrders().then((o) => {
      setOrders(o);
      const totalSales = o.reduce((acc, order) => acc + order.totalAmount, 0);
      setStats(prev => ({ ...prev, orders: o.length, sales: totalSales }));
    });

    // fetch reviews direct
    const revs = dbSimulator.getReviews();
    setReviews(revs);
    setStats(prev => ({ ...prev, reviews: revs.length }));
  };

  useEffect(() => {
    loadDatabaseRecords();
  }, []);

  /* ----------------------------------------------------
      ADMIN BYPASS RESTRICTION GATES
      ---------------------------------------------------- */
  if (!user || !user.isAdmin) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 font-body text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-7 h-7 text-red-500" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-red-500 font-bold">Admin Portal Lock</span>
        <h2 className="text-2xl font-serif font-semibold text-[#1A1A1A] uppercase tracking-wider mt-1.5 leading-tight">
          Restricted Access
        </h2>
        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed mt-3">
          This portal remains locked under high-grade administrative key vaults. Log in using credential profiles endowed with full admin role parameters.
        </p>

        <button
          onClick={() => setAuthModalOpen(true)}
          className="mt-8 w-full py-3.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#EDE6DA] text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
        >
          Sign In to Admin Profile
        </button>
      </div>
    );
  }

  // Handle Product CRUD
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pDesc.trim()) {
      triggerToast("Name and Description must not be blank.", "error");
      return;
    }

    try {
      if (editingProduct) {
        // Update product
        const updated: Product = {
          ...editingProduct,
          name: pName,
          price: pPrice,
          discountPrice: pDiscPrice,
          category: pCategory,
          wearType: pWearType,
          stock: pStock,
          description: pDesc,
          featured: pFeatured,
          bestSeller: pBestSeller
        };
        await updateProduct(updated);
        triggerToast("Product details updated successfully.", "success");
      } else {
        // Add product
        const newP: Omit<Product, 'id' | 'slug' | 'rating' | 'createdAt'> = {
          name: pName,
          price: pPrice,
          discountPrice: pDiscPrice,
          category: pCategory,
          wearType: pWearType,
          stock: pStock,
          description: pDesc,
          featured: pFeatured,
          bestSeller: pBestSeller,
          images: pCategory === 'earrings' ? ['/images/logo-burgundy.jpg'] : ['/images/logo-burgundy.jpg']
        };
        await addProduct(newP);
        triggerToast("New article appended to registry successfully.", "success");
      }

      setProductModalOpen(false);
      clearProductForm();
      loadDatabaseRecords();
    } catch (err) {
      triggerToast("Registry modification failed.", "error");
    }
  };

  const clearProductForm = () => {
    setEditingProduct(null);
    setPName('');
    setPPrice(1200);
    setPDiscPrice(999);
    setPCategory('earrings');
    setPWearType('daily');
    setPStock(15);
    setPDesc('');
    setPFeatured(false);
    setPBestSeller(false);
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPPrice(prod.price);
    setPDiscPrice(prod.discountPrice);
    setPCategory(prod.category);
    setPWearType(prod.wearType);
    setPStock(prod.stock);
    setPDesc(prod.description);
    setPFeatured(prod.featured);
    setPBestSeller(prod.bestSeller);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you confident you want to delete this article registry profile?")) {
      try {
        await deleteProduct(id);
        triggerToast("Product successfully purged from registry.", "success");
        loadDatabaseRecords();
      } catch (err) {
        triggerToast("Purge failed.", "error");
      }
    }
  };

  // Orders Dispatch Status update
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: 'processing' | 'shipped' | 'delivered') => {
    try {
      await dbSimulator.updateOrderStatus(orderId, nextStatus);
      triggerToast(`Order status updated to "${nextStatus}"`, "success");
      loadDatabaseRecords();
    } catch (err) {
      triggerToast("Status update failed.", "error");
    }
  };

  // Review approval moderation
  const handleApproveReview = (reviewId: string) => {
    dbSimulator.approveReview(reviewId);
    triggerToast("Review published to public listings page.", "success");
    loadDatabaseRecords();
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm("Delete this user review comments?")) {
      dbSimulator.deleteReview(reviewId);
      triggerToast("Review successfully removed.", "success");
      loadDatabaseRecords();
    }
  };

  // Platform configs update
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGlobalSettings({
      freeShippingLimit: shipLimit,
      standardShippingCharge: shipFee,
      codFee,
      giftGoal
    });
    triggerToast("✨ Platform configuration saved successfully.", "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body text-[#1A1A1A]">
      
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Administrative Access</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
          Admin Dashboard
        </h1>
        <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
      </div>

      {/* ----------------------------------------------------
          STATISTICS COUNTERS HIGHLIGHT
          ---------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <div className="bg-white border border-[#EDE6DA] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#EDE6DA]/30 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Total Articles</span>
            <h4 className="text-lg font-serif font-bold mt-0.5">{stats.products}</h4>
          </div>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#EDE6DA]/30 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Total Orders</span>
            <h4 className="text-lg font-serif font-bold mt-0.5">{stats.orders}</h4>
          </div>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#EDE6DA]/30 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Reviews Received</span>
            <h4 className="text-lg font-serif font-bold mt-0.5">{stats.reviews}</h4>
          </div>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Simulated Sales</span>
            <h4 className="text-lg font-serif font-bold mt-0.5 text-emerald-700">₹{stats.sales.toLocaleString('en-IN')}</h4>
          </div>
        </div>
      </div>

      {/* Tabs Menu bar & Refresh Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-[#EDE6DA] mb-8 gap-4">
        <div className="flex overflow-x-auto pb-1 flex-nowrap gap-1">
          {['products', 'orders', 'reviews', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-3 px-5 font-serif font-semibold text-xs uppercase tracking-widest border-b-2 transition-all capitalize -mb-[2px] whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#D4AF37] text-[#1A1A1A]'
                  : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              {tab === 'products' ? 'Product Registry' : tab === 'orders' ? 'Orders dispatch' : tab === 'reviews' ? 'Review Moderation' : 'Platform config'}
            </button>
          ))}
        </div>

        <button
          onClick={loadDatabaseRecords}
          className="self-start sm:self-auto px-4 py-2 border border-[#EDE6DA] rounded-xl hover:bg-gray-50 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* ----------------------------------------------------
          TAB 1: PRODUCT REGISTRY & CRUD CONTROLS
          ---------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-serif font-semibold uppercase tracking-widest">
              Showcase Registry Management
            </h3>
            <button
              onClick={() => {
                clearProductForm();
                setProductModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Jewellery</span>
            </button>
          </div>

          {/* Table of products */}
          <div className="overflow-x-auto rounded-2xl border border-[#EDE6DA] shadow-sm">
            <table className="w-full text-xs text-left text-gray-600">
              <thead className="bg-gray-50 uppercase text-[9px] tracking-wider text-gray-500 border-b border-[#EDE6DA]">
                <tr>
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price / Discount</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-center">Tags</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white font-body">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#1A1A1A] truncate">{prod.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono truncate block">ID: {prod.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize font-semibold">{prod.category}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#1A1A1A]">₹{prod.discountPrice}</span>{' '}
                      <span className="text-gray-400 line-through text-[10px]">₹{prod.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${prod.stock <= 5 ? 'text-amber-600 font-bold' : 'text-emerald-700'}`}>
                        {prod.stock} Units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {prod.featured && <span className="bg-[#EDE6DA] text-[#4B352A] text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">Featured</span>}
                        {prod.bestSeller && <span className="bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">Bestseller</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEditProduct(prod)}
                          className="p-2 border border-[#EDE6DA] rounded-lg hover:bg-gray-50 text-gray-600 hover:text-black transition-colors"
                          title="Edit Details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 border border-red-100 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                          title="Purge Article"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: ORDERS MODERATION DISPATCH TRACKER
          ---------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-6">
          <h3 className="text-base font-serif font-semibold uppercase tracking-widest">
            Dispatch Moderation Dashboard
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-[#EDE6DA] shadow-sm">
            <table className="w-full text-xs text-left text-gray-600">
              <thead className="bg-gray-50 uppercase text-[9px] tracking-wider text-gray-500 border-b border-[#EDE6DA]">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Recipient Info</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status & Dispatch</th>
                  <th className="px-6 py-4 text-right">Moderations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white font-body">
                {orders.map((ord) => {
                  const statusColors = 
                    ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                    ord.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                    'bg-amber-50 text-amber-700';

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-[#1A1A1A]">{ord.id}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{new Date(ord.createdAt || '').toLocaleDateString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#1A1A1A] block">{ord.shippingAddress.fullName}</span>
                        <span className="text-gray-400 text-[10px] block mt-0.5">{ord.shippingAddress.city}, PIN: {ord.shippingAddress.pincode}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#1A1A1A]">₹{ord.totalAmount}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5 uppercase font-bold">{ord.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${statusColors}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ord.status === 'processing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'shipped')}
                              className="px-2.5 py-1.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors"
                            >
                              Dispatch Order
                            </button>
                          )}
                          {ord.status === 'shipped' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                              className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors"
                            >
                              Confirm Delivery
                            </button>
                          )}
                          {ord.status === 'delivered' && (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 pr-2">
                              <Check className="w-3.5 h-3.5" />
                              <span>Delivered</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: CUSTOMER REVIEW MODERATION CONTROL
          ---------------------------------------------------- */}
      {activeTab === 'reviews' && (
        <div className="flex flex-col gap-6">
          <h3 className="text-base font-serif font-semibold uppercase tracking-widest">
            Customer Comments Moderations
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-[#EDE6DA] shadow-sm">
            <table className="w-full text-xs text-left text-gray-600">
              <thead className="bg-gray-50 uppercase text-[9px] tracking-wider text-gray-500 border-b border-[#EDE6DA]">
                <tr>
                  <th className="px-6 py-4">Reviewer Details</th>
                  <th className="px-6 py-4">Ratings & Comments</th>
                  <th className="px-6 py-4">Attached Asset</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Moderations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white font-body">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#1A1A1A] block">{rev.userName}</span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">Product ID: {rev.productId}</span>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex text-amber-500 text-[10px] mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-600 leading-normal line-clamp-2">{rev.comment}</p>
                    </td>
                    <td className="px-6 py-4">
                      {rev.image ? (
                        <img src={rev.image} alt="User asset attachment" className="w-10 h-10 rounded object-cover border border-gray-100" />
                      ) : (
                        <span className="text-gray-400 italic text-[10px]">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                        rev.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {rev.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!rev.approved && (
                          <button
                            onClick={() => handleApproveReview(rev.id)}
                            className="p-1.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors flex items-center justify-center"
                            title="Approve Review"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-500 rounded-lg transition-colors flex items-center justify-center"
                          title="Purge Review Comments"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 4: PLATFORM CONFIGURATOR (SETTINGS)
          ---------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-6 max-w-2xl bg-white border border-[#EDE6DA] rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-base font-serif font-semibold uppercase tracking-widest text-[#1A1A1A] border-b border-gray-100 pb-3">
            Core Pricing & Logistics Configurator
          </h3>

          <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-4 text-xs font-semibold text-[#4B352A]">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider">Free Shipping Threshold *</label>
                <input
                  type="number"
                  required
                  value={shipLimit}
                  onChange={(e) => setShipLimit(Number(e.target.value))}
                  className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider">Standard Shipping Charge *</label>
                <input
                  type="number"
                  required
                  value={shipFee}
                  onChange={(e) => setShipFee(Number(e.target.value))}
                  className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider">COD Handling Fee *</label>
                <input
                  type="number"
                  required
                  value={codFee}
                  onChange={(e) => setCodFee(Number(e.target.value))}
                  className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider">Complimentary Gift Goal (Count) *</label>
                <input
                  type="number"
                  required
                  value={giftGoal}
                  onChange={(e) => setGiftGoal(Number(e.target.value))}
                  className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Save Configuration Settings
            </button>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------
          SLIDING PRODUCT CREATION/EDIT MODALDRAWER
          ---------------------------------------------------- */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setProductModalOpen(false)}
            className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm"
          />

          {/* Drawer Panel content */}
          <div className="relative w-[500px] max-w-full h-full bg-[#F8F5F0] shadow-2xl p-6 flex flex-col z-10 overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EDE6DA] pb-4 mb-5">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider">
                {editingProduct ? 'Modify Article Profile' : 'Add New Jewellery'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleProductSubmit} className="flex flex-col gap-4 text-xs font-semibold text-[#4B352A]">
              
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider">Article Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Filigree Butterfly Hoop Earrings"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="bg-white border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider">Description *</label>
                <textarea
                  required
                  placeholder="Description of double plating, crystals setting details, wear profiles..."
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  rows={3}
                  className="bg-white border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37] resize-y"
                />
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider">Standard Price *</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="bg-white border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider">Discount Price *</label>
                  <input
                    type="number"
                    required
                    value={pDiscPrice}
                    onChange={(e) => setPDiscPrice(Number(e.target.value))}
                    className="bg-white border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Category & Wear style */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider">Collection Category *</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="bg-white border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="earrings">Earrings</option>
                    <option value="chains">Gold Chains</option>
                    <option value="bangles">Bangles</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider">Optimal Wear Style *</label>
                  <select
                    value={pWearType}
                    onChange={(e) => setPWearType(e.target.value)}
                    className="bg-white border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="daily">Daily Wear</option>
                    <option value="casual">Casual Wear</option>
                    <option value="party">Party Wear</option>
                    <option value="traditional">Traditional Wear</option>
                    <option value="festive">Festive Wear</option>
                  </select>
                </div>
              </div>

              {/* Stock units */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider">Available Stock Units *</label>
                <input
                  type="number"
                  required
                  value={pStock}
                  onChange={(e) => setPStock(Number(e.target.value))}
                  className="bg-white border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Badges toggles */}
              <div className="flex items-center gap-6 mt-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pFeatured}
                    onChange={(e) => setPFeatured(e.target.checked)}
                    className="rounded border-[#EDE6DA] text-[#D4AF37] focus:ring-[#D4AF37] w-4 h-4"
                  />
                  <span>Mark as Featured Look</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pBestSeller}
                    onChange={(e) => setPBestSeller(e.target.checked)}
                    className="rounded border-[#EDE6DA] text-[#D4AF37] focus:ring-[#D4AF37] w-4 h-4"
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              {/* Submit btn */}
              <button
                type="submit"
                className="mt-6 w-full py-3.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                {editingProduct ? 'Commit Changes' : 'Append Article'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
