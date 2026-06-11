"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { serviceDb } from '../../../lib/firebase';
import { Mail, Users } from 'lucide-react';

export default function AdminUsersPage() {
  const { triggerToast } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await serviceDb.getUsers();
      setUsers(data);
    } catch (error: any) {
      triggerToast(`Error loading users: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(user =>
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-light tracking-wide mb-2">Users Management</h2>
          <p className="text-sm text-gray-600">View and manage registered users.</p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
        />
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-amber-100 rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <Users className="text-burgundy" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-normal">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-amber-100 rounded-3xl overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-amber-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Orders</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id || user.uid} className="border-b border-amber-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">
                      {user.fullName || user.displayName || 'N/A'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      <span className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {user.email}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {user.phone || (
                        <span className="text-gray-400 text-xs">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-700">
                      {user.orders?.length || 0}
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
