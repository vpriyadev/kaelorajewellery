"use client";

import { useEffect, useMemo, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { collection, getFirestore, onSnapshot } from 'firebase/firestore';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

function getClientDb() {
  if (typeof window === 'undefined') return null;
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return getFirestore(app);
  } catch (error) {
    console.error('[Admin Dashboard] Firebase init failed:', error);
    return null;
  }
}

function safeDate(value: any) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  try {
    return new Date(value);
  } catch {
    return null;
  }
}

function formatLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function normalizeOrderItems(order: any) {
  const items: any[] = Array.isArray(order.products)
    ? order.products
    : Array.isArray(order.items)
    ? order.items
    : [];

  return items.map((item: any) => ({
    id: item.productId || item.id || item.sku || 'unknown',
    name: item.name || item.title || item.productName || 'Unnamed product',
    quantity: Number(item.quantity || item.qty || item.count || 0),
    price: Number(item.price || item.unitPrice || item.totalPrice || 0),
  }));
}

function getLocationLabel(order: any) {
  const address = order.shippingAddress || order.address || {};
  return (
    address.city || address.state || address.region || address.country || address.postalCode || 'Unknown Location'
  );
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const db = getClientDb();
    if (!db) return;

    const productsUnsub = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error('[Admin Dashboard] products listener error:', error)
    );

    const ordersUnsub = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error('[Admin Dashboard] orders listener error:', error)
    );

    const usersUnsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error('[Admin Dashboard] users listener error:', error)
    );

    const reviewsUnsub = onSnapshot(
      collection(db, 'reviews'),
      (snapshot) => {
        setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error('[Admin Dashboard] reviews listener error:', error)
    );

    return () => {
      productsUnsub();
      ordersUnsub();
      usersUnsub();
      reviewsUnsub();
    };
  }, []);

  const paidVerifiedOrders = useMemo(() => orders.filter((order) => order.paymentStatus === "paid" && order.paymentVerified === true), [orders]);
  const totals = useMemo(
    () => ({
      totalProducts: products.length,
      totalOrders: paidVerifiedOrders.length,
      totalUsers: users.length,
      totalRevenue: paidVerifiedOrders.reduce((sum, order) => {
        const amount = Number(order.totalAmount || order.totalPrice || order.amount || 0);
        return sum + (Number.isNaN(amount) ? 0 : amount);
      }, 0),
    }),
    [products, orders, paidVerifiedOrders]
  );
  // Validation logs
  console.log("Paid Orders:", paidVerifiedOrders.length);
  console.log("Revenue Calculated:", totals.totalRevenue);

  const analyticsWindow = 30;

  const chartData = useMemo(() => {
    const buckets: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = analyticsWindow - 1; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const key = date.toISOString().slice(0, 10);
      buckets[key] = { date: formatLabel(date), revenue: 0, orders: 0 };
    }

    orders.forEach((order) => {
      if (!(order.paymentStatus === "paid" && order.paymentVerified === true)) return;
      const date = safeDate(order.createdAt || order.date || order.created_at);
      if (!date) return;
      const key = new Date(date).toISOString().slice(0, 10);
      if (!buckets[key]) return;
      const amount = Number(order.totalAmount || order.totalPrice || order.amount || 0);
      buckets[key].revenue += Number.isNaN(amount) ? 0 : amount;
      buckets[key].orders += 1;
    });

    return Object.values(buckets);
  }, [orders]);

  const revenueHasData = chartData.some((row) => row.revenue > 0);
  const ordersHasData = chartData.some((row) => row.orders > 0);

  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orders.forEach((order) => {
      normalizeOrderItems(order).forEach((item) => {
        const key = item.id || item.name;
        if (!counts[key]) {
          counts[key] = { name: item.name, quantity: 0, revenue: 0 };
        }
        counts[key].quantity += item.quantity;
        // Only count revenue for paid & verified orders
        if (order.paymentStatus === "paid" && order.paymentVerified === true) {
          counts[key].revenue += item.quantity * item.price;
        }
      });
    });

    return Object.entries(counts)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  const locationData = useMemo(() => {
    const counts: Record<string, { location: string; orders: number; revenue: number }> = {};

    orders.forEach((order) => {
      const location = getLocationLabel(order);
      if (!counts[location]) counts[location] = { location, orders: 0, revenue: 0 };
      counts[location].orders += 1;
      // Only add revenue for paid & verified orders
      if (order.paymentStatus === "paid" && order.paymentVerified === true) {
        const amount = Number(order.totalAmount || order.totalPrice || order.amount || 0);
        counts[location].revenue += Number.isNaN(amount) ? 0 : amount;
      }
    });

    return Object.values(counts).sort((a, b) => b.orders - a.orders).slice(0, 6);
  }, [orders]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {
      Earrings: 0,
      Chains: 0,
      Bangles: 0,
      Other: 0,
    };

    products.forEach((product) => {
      const category = String(product.category || product.type || '').toLowerCase();
      if (category.includes('earring')) counts.Earrings += 1;
      else if (category.includes('chain')) counts.Chains += 1;
      else if (category.includes('bangle')) counts.Bangles += 1;
      else counts.Other += 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const recentOrders = useMemo(
    () =>
      paidVerifiedOrders
        .slice()
        .sort((a, b) => {
          const aDate = safeDate(a.createdAt || a.date || a.created_at);
          const bDate = safeDate(b.createdAt || b.date || b.created_at);
          return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
        })
        .slice(0, 10),
    [paidVerifiedOrders]
  );

  const recentReviews = useMemo(
    () =>
      reviews
        .slice()
        .sort((a, b) => {
          const aDate = safeDate(a.createdAt || a.date || a.created_at);
          const bDate = safeDate(b.createdAt || b.date || b.created_at);
          return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
        })
        .slice(0, 8),
    [reviews]
  );

  const locationHasData = locationData.length > 0;
  const categoryHasData = categoryData.some((item) => item.value > 0);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-body text-[#1A1A1A]">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Administrative Access</div>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-3 tracking-wider">Admin Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">Live store performance, order trends, product momentum, and review activity from Firestore.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Total Products', value: totals.totalProducts },
          { label: 'Total Orders', value: totals.totalOrders },
          { label: 'Total Users', value: totals.totalUsers },
          { label: 'Total Revenue', value: formatCurrency(totals.totalRevenue) },
        ].map((card) => (
          <div key={card.label} className="rounded-[28px] border border-[#E6DDD0] bg-white p-6 shadow-[0_25px_50px_rgba(16,24,40,0.04)] transition hover:shadow-[0_30px_75px_rgba(16,24,40,0.08)]">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-semibold">{card.label}</div>
            <div className="mt-5 text-3xl font-serif font-bold text-[#1A1A1A]">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.8fr_1.2fr] gap-5 mb-6">
        <div className="rounded-[28px] border border-[#E6DDD0] bg-white p-6 shadow-[0_25px_50px_rgba(16,24,40,0.04)]">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">Revenue Analytics</div>
              <div className="mt-2 text-lg font-semibold text-[#111827]">30-day revenue trend</div>
            </div>
            <div className="rounded-2xl bg-[#F8F4EA] px-3 py-1 text-xs font-semibold text-[#7C5F2C]">Live</div>
          </div>
          {revenueHasData ? (
            <div className="h-[200px] sm:h-[300px] md:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, bottom: 0, left: -10, right: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#EAE4DA" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} width={40} />
                  <Tooltip contentStyle={{ borderRadius: 16, borderColor: '#E6DDD0' }} formatter={(value: any) => formatCurrency(Number(value || 0))} />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-[#FEFBF7] text-center text-sm text-gray-500">
              No revenue data available yet.
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-[#E6DDD0] bg-white p-6 shadow-[0_25px_50px_rgba(16,24,40,0.04)]">
          <div className="mb-5">
            <div className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">Orders Analytics</div>
            <div className="mt-2 text-lg font-semibold text-[#111827]">Daily order volume</div>
          </div>
          {ordersHasData ? (
            <div className="h-[200px] sm:h-[300px] md:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -14, bottom: 0 }}>
                  <CartesianGrid stroke="#EAE4DA" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} width={40} />
                  <Tooltip contentStyle={{ borderRadius: 16, borderColor: '#E6DDD0' }} formatter={(value: any) => `${Number(value || 0)} orders`} />
                  <Bar dataKey="orders" fill="#1F2937" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-[#F8FAFC] text-center text-sm text-gray-500">
              No order analytics available yet.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
        <div className="rounded-[28px] border border-[#E6DDD0] bg-white p-6 shadow-[0_25px_50px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">Top Selling Products</div>
              <div className="mt-2 text-lg font-semibold text-[#111827]">Generated from order history</div>
            </div>
          </div>
          {topProducts.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-[#FEFBF7] text-center text-sm text-gray-500">
              No top selling products available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((item, index) => (
                <div key={item.id} className="rounded-3xl border border-[#E6DDD0] p-4 hover:border-[#D4AF37] transition">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#111827]">{item.name}</div>
                      <div className="text-xs uppercase tracking-[0.25em] text-gray-400">Sold quantity</div>
                    </div>
                    <div className="rounded-2xl bg-[#F8F1DD] px-3 py-1 text-xs font-semibold text-[#7C5F2C]">#{index + 1}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                    <span>{item.quantity} units</span>
                    <span>{formatCurrency(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-[#E6DDD0] bg-white p-6 shadow-[0_25px_50px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">Sales By Location</div>
              <div className="mt-2 text-lg font-semibold text-[#111827]">Order volume by shipping region</div>
            </div>
          </div>
          {locationHasData ? (
            <div className="space-y-3">
              {locationData.map((location) => (
                <div key={location.location} className="rounded-3xl border border-[#E6DDD0] p-4 hover:border-[#D4AF37] transition">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-[#111827]">{location.location}</div>
                      <div className="text-xs text-gray-500">{location.orders} orders</div>
                    </div>
                    <div className="text-sm font-semibold text-[#1F2937]">{formatCurrency(location.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-[#F8FAFC] text-center text-sm text-gray-500">
              No location sales data available yet.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
        <div className="rounded-[28px] border border-[#E6DDD0] bg-white p-6 shadow-[0_25px_50px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">Category Distribution</div>
              <div className="mt-2 text-lg font-semibold text-[#111827]">Products by category</div>
            </div>
          </div>
          {categoryHasData ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={60} paddingAngle={4}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`slice-${entry.name}`} fill={['#D4AF37', '#1F2937', '#A78BFA', '#E5E7EB'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${Number(value || 0)} products`} />
                  <Legend verticalAlign="bottom" height={40} iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-[#FEFBF7] text-center text-sm text-gray-500">
              No category distribution data available yet.
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-[#E6DDD0] bg-white p-6 shadow-[0_25px_50px_rgba(16,24,40,0.04)]">
          <div className="mb-5">
            <div className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">Recent Reviews</div>
            <div className="mt-2 text-lg font-semibold text-[#111827]">Latest customer impressions</div>
          </div>
          {recentReviews.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-[#F8FAFC] text-center text-sm text-gray-500">
              No review activity available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="rounded-3xl border border-[#E6DDD0] p-4 hover:border-[#D4AF37] transition">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#111827]">{review.userName || review.userId || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500">Product: {review.productId || 'Unknown'}</div>
                    </div>
                    <div className="rounded-2xl bg-[#F8F1DD] px-3 py-1 text-xs font-semibold text-[#7C5F2C]">{review.rating || '—'} ★</div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">{review.comment || 'No comment provided.'}</p>
                  <div className="mt-4 text-xs text-gray-400">{(safeDate(review.createdAt || review.date || review.created_at) || new Date()).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#E6DDD0] bg-white p-6 shadow-[0_25px_50px_rgba(16,24,40,0.04)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">Recent Orders</div>
            <div className="mt-2 text-lg font-semibold text-[#111827]">Latest orders from Firestore</div>
          </div>
          <button className="rounded-full bg-[#F3E7C9] px-4 py-2 text-xs font-semibold text-[#7C5F2C] hover:bg-[#E7D69A] transition">
            View all orders
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-[#FEFBF7] text-center text-sm text-gray-500">
            No successful orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-[0.25em] text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-mono text-[#111827]">{order.id}</td>
                    <td className="px-4 py-4 text-gray-700">{order.shippingAddress?.fullName || order.userId || 'Guest'}</td>
                    <td className="px-4 py-4 text-gray-700">{formatCurrency(Number(order.totalAmount || order.totalPrice || order.amount || 0))}</td>
                    <td className="px-4 py-4 text-gray-700">{getLocationLabel(order)}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-[#F8F4EA] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7C5F2C]">
                        {order.status || order.orderStatus || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
