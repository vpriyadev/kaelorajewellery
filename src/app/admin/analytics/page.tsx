"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { serviceDb } from '../../../lib/firebase';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, MessageSquare, Download, RefreshCw } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { triggerToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // Load all data
  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData, usersData, reviewsData] = await Promise.all([
        serviceDb.getProducts(),
        serviceDb.getOrders(),
        serviceDb.getUsers(),
        serviceDb.getReviews(),
      ]);

      setProducts(productsData || []);
      setOrders(ordersData || []);
      setUsers(usersData || []);
      setReviews(reviewsData || []);
      triggerToast('Analytics data refreshed', 'success');
    } catch (error: any) {
      triggerToast(`Error loading analytics: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // Parse orders
  const parsedOrders = useMemo(() => {
    return (orders || []).map(order => ({
      ...order,
      createdAt: order?.createdAt ? new Date(order.createdAt) : new Date(),
      totalAmount: Number(order?.totalAmount || order?.amount || 0),
      status: order?.status || order?.orderStatus || 'processing',
    }));
  }, [orders]);

  // Calculate metrics
  const todayDate = new Date();
  const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  const startOfYear = new Date(todayDate.getFullYear(), 0, 1);

  const revenueOrders = parsedOrders.filter(o => o && o.paymentStatus === 'paid' && o.paymentVerified === true);
  const totalRevenue = revenueOrders.reduce((acc, o) => acc + (o?.totalAmount || 0), 0);
  const monthlyRevenue = revenueOrders.filter(o => o && o.createdAt >= startOfMonth).reduce((acc, o) => acc + (o?.totalAmount || 0), 0);
  const todaysRevenue = revenueOrders.filter(o => o && o.createdAt && o.createdAt.toDateString() === todayDate.toDateString()).reduce((acc, o) => acc + (o?.totalAmount || 0), 0);
  const yearlyRevenue = revenueOrders.filter(o => o && o.createdAt >= startOfYear).reduce((acc, o) => acc + (o?.totalAmount || 0), 0);

  const statusCounts = parsedOrders.reduce((acc, o) => {
    const key = o?.status || 'processing';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalOrders = parsedOrders.length;
  const newUsersThisMonth = (users || []).filter(u => u && u.createdAt && new Date(u.createdAt) >= startOfMonth).length;
  const approvedReviews = (reviews || []).filter(r => r && r.approved).length;

  // Top selling products
  const productSales = parsedOrders.flatMap(o => (o?.products || o?.items || []).map((p: any) => ({
    productId: p?.id || p?.productId || 'Unknown',
    name: p?.name || 'Unknown',
    quantity: p?.quantity || 0,
    revenue: (p?.price || p?.discountPrice || 0) * (p?.quantity || 0),
  })));

  const productMap = productSales.reduce((acc: Record<string, any>, item) => {
    if (!item?.productId) return acc;
    if (!acc[item.productId]) acc[item.productId] = { ...item };
    else {
      acc[item.productId].quantity += item.quantity || 0;
      acc[item.productId].revenue += item.revenue || 0;
    }
    return acc;
  }, {});

  const topSellingProducts = Object.values(productMap).sort((a: any, b: any) => (b?.quantity || 0) - (a?.quantity || 0)).slice(0, 5);

  // Monthly revenue breakdown
  const revenueByMonth = revenueOrders.reduce((acc: Record<string, number>, o) => {
    if (!o?.createdAt) return acc;
    const key = o.createdAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    acc[key] = (acc[key] || 0) + (o.totalAmount || 0);
    return acc;
  }, {});

  const monthlyData = Object.entries(revenueByMonth).slice(-6).map(([month, revenue]) => ({
    month,
    revenue: Math.round(revenue as number),
  }));

  // Export CSV
  const downloadCsv = (filename: string, rows: any[]) => {
    if (!rows || rows.length === 0) {
      triggerToast('No data available to export', 'error');
      return;
    }
    const headers = Object.keys(rows[0] || {});
    if (headers.length === 0) {
      triggerToast('No data available to export', 'error');
      return;
    }
    const csv = [headers.join(','), ...rows.map(r => Object.values(r || {}).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    triggerToast('Report exported successfully', 'success');
  };

  const handleExportOrders = () => {
    if (parsedOrders.length === 0) {
      triggerToast('No data available to export', 'error');
      return;
    }
    downloadCsv('orders-report.csv', parsedOrders.map(o => ({
      'Order ID': o?.id || 'N/A',
      'Customer': (o as any)?.customerName || 'Guest',
      'Amount': '₹'+(o?.totalAmount || 0),
      'Status': o?.status || 'processing',
      'Date': o?.createdAt ? o.createdAt.toLocaleDateString('en-IN') : 'N/A',
    })));
  };

  const handleExportRevenue = () => {
    if (monthlyData.length === 0) {
      triggerToast('No data available to export', 'error');
      return;
    }
    downloadCsv('revenue-report.csv', monthlyData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif font-semibold mb-2">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600">Enterprise analytics, reports and performance metrics.</p>
        </div>
        <button
          onClick={loadAnalyticsData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <DollarSign className="text-burgundy" size={20} />
          </div>
          <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-2">All time</p>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Today's Revenue</p>
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold">₹{todaysRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <DollarSign className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold">₹{monthlyRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-2">This month</p>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Orders</p>
            <ShoppingCart className="text-amber-600" size={20} />
          </div>
          <p className="text-3xl font-bold">{totalOrders}</p>
          <p className="text-xs text-gray-400 mt-2">Orders placed</p>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Processing Orders</p>
            <Package className="text-yellow-600" size={20} />
          </div>
          <p className="text-3xl font-bold">{statusCounts['processing'] || 0}</p>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Delivered Orders</p>
            <ShoppingCart className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold">{statusCounts['delivered'] || 0}</p>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Cancelled Orders</p>
            <ShoppingCart className="text-red-600" size={20} />
          </div>
          <p className="text-3xl font-bold">{statusCounts['cancelled'] || 0}</p>
        </div>
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Customers</p>
            <Users className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold">{users.length}</p>
          <p className="text-xs text-green-600 mt-2">+{newUsersThisMonth} this month</p>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Products</p>
            <Package className="text-purple-600" size={20} />
          </div>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Reviews</p>
            <MessageSquare className="text-indigo-600" size={20} />
          </div>
          <p className="text-3xl font-bold">{reviews.length}</p>
          <p className="text-xs text-green-600 mt-2">{approvedReviews} approved</p>
        </div>

        <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Yearly Revenue</p>
            <TrendingUp className="text-emerald-600" size={20} />
          </div>
          <p className="text-3xl font-bold">₹{yearlyRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
        {topSellingProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-[#EDE6DA]">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Quantity Sold</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts.map((p, idx) => (
                  <tr key={idx} className="border-b border-[#EDE6DA] hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{p.name}</td>
                    <td className="px-6 py-3">{p.quantity}</td>
                    <td className="px-6 py-3 font-semibold">₹{p.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No sales data available</p>
        )}
      </div>

      {/* Monthly Revenue */}
      <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Monthly Revenue Breakdown</h3>
          <button
            onClick={handleExportRevenue}
            className="flex items-center gap-2 px-4 py-2 border border-[#EDE6DA] rounded-lg hover:bg-gray-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
        {monthlyData.length > 0 ? (
          <div className="space-y-2">
            {monthlyData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <div className="flex-grow bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-burgundy h-full rounded-full"
                      style={{ width: `${(item.revenue / Math.max(...monthlyData.map(m => m.revenue))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold min-w-[120px]">₹{item.revenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No revenue data available</p>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-4 py-2 border border-[#EDE6DA] rounded-lg hover:bg-gray-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
        {parsedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-[#EDE6DA]">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Order ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {parsedOrders.slice(0, 10).map(order => (
                  <tr key={order.id} className="border-b border-[#EDE6DA] hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs">{order.id?.substring(0, 8)}</td>
                    <td className="px-6 py-3 font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{order.createdAt.toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No orders found</p>
        )}
      </div>
    </div>
  );
}
