"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { serviceDb, Order } from '../../../lib/firebase';
import { parseSafeDate } from '../../../lib/validation';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';

export default function AdminOrdersPage() {
  const { triggerToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const statusColors: Record<string, string> = {
    processing: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusIcons: Record<string, any> = {
    processing: <Package size={16} />,
    shipped: <Truck size={16} />,
    delivered: <CheckCircle size={16} />,
    cancelled: <XCircle size={16} />,
  };

  // Load orders
  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await serviceDb.getOrders();
      setOrders(data);
    } catch (error: any) {
      triggerToast(`Error loading orders: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);
      await serviceDb.updateOrderStatus(orderId, newStatus);
      triggerToast(`Order status updated to ${newStatus}!`, 'success');
      await loadOrders();
    } catch (error: any) {
      triggerToast(`Error updating order: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => (o.status || o.orderStatus) === filterStatus);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-light tracking-wide mb-2">Orders Management</h2>
          <p className="text-sm text-gray-600">View and manage orders placed on the platform.</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition ${
              filterStatus === status
                ? 'bg-burgundy text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-amber-100 rounded-3xl overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-amber-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const status = order.status || order.orderStatus || 'processing';
                  const orderId = order.id;
                  return (
                    <tr key={orderId} className="border-b border-amber-100 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-mono text-gray-700">{orderId?.substring(0, 8)}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {(order as any).customerName || order.userId || 'Guest'}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-700">
                        ₹{Number(order.totalAmount || (order as any).amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.processing}`}>
                          {statusIcons[status]}
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-center text-sm">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-min-h-dvh overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="text-sm font-mono font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-sm font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="text-sm font-medium">{(selectedOrder as any).customerName || selectedOrder.userId || 'Guest'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-sm font-medium">{(selectedOrder as any).phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-sm font-medium">{(selectedOrder as any).address || 'N/A'}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Items</p>
                {((selectedOrder.products || selectedOrder.items || []) as any[]).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm mb-2">
                    <span>{item.name || item.productName} x {item.quantity}</span>
                    <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-semibold">₹{Number(selectedOrder.totalAmount || (selectedOrder as any).amount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Status</p>
                  <select
                    value={selectedOrder.status || selectedOrder.orderStatus || 'processing'}
                    onChange={e => {
                      handleStatusChange(selectedOrder.id, e.target.value);
                      setSelectedOrder(null);
                    }}
                    className="w-full px-3 py-2 border border-amber-100 rounded-lg text-sm"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {selectedOrder.cancelledBy && (
                    <div className="mt-3 text-sm text-red-600">
                      <div>Cancelled by: {selectedOrder.cancelledBy.name || selectedOrder.cancelledBy.id} ({selectedOrder.cancelledBy.role || 'user'})</div>
                        {(() => {
                          const cancelDate = parseSafeDate(selectedOrder.cancelledAt);
                          return cancelDate ? <div>Cancelled at: {cancelDate.toLocaleString()}</div> : null;
                        })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-amber-100 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
