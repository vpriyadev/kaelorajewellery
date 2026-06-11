"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { serviceDb, Address } from '../../../lib/firebase';
import { MapPin, Trash2, Edit2, X } from 'lucide-react';
import { validateAddressForm } from '../../../lib/validation';

export default function AdminAddressesPage() {
  const { triggerToast } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load all users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await serviceDb.getUsers();
      setUsers(data);
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].uid);
      }
    } catch (error: any) {
      triggerToast(`Error loading users: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load addresses for selected user
  const loadAddresses = async (uid: string) => {
    if (!uid) return;
    setLoading(true);
    try {
      const data = await serviceDb.getAddresses(uid);
      setAddresses(data);
    } catch (error: any) {
      triggerToast(`Error loading addresses: ${error.message}`, 'error');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadAddresses(selectedUserId);
    }
  }, [selectedUserId]);

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleEditAddress = (addr: Address) => {
    setFormData({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      country: addr.country || 'India',
      isDefault: addr.isDefault || false
    });
    setEditingAddressId(addr.id);
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSaveAddress = async () => {
    const validation = validateAddressForm(formData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    if (!selectedUserId || !editingAddressId) return;

    try {
      await serviceDb.updateAddress(selectedUserId, editingAddressId, formData);
      triggerToast('Address updated successfully', 'success');
      setShowEditModal(false);
      setEditingAddressId(null);
      await loadAddresses(selectedUserId);
    } catch (error: any) {
      triggerToast(`Error updating address: ${error.message}`, 'error');
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    if (!selectedUserId) return;

    try {
      await serviceDb.deleteAddress(selectedUserId, addrId);
      triggerToast('Address deleted successfully', 'success');
      await loadAddresses(selectedUserId);
    } catch (error: any) {
      triggerToast(`Error deleting address: ${error.message}`, 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-light tracking-wide mb-2">Address Management</h2>
          <p className="text-sm text-gray-600">View and manage user shipping addresses.</p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#2A2A2A] disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Users List */}
        <div className="lg:col-span-1 bg-white border border-amber-100 rounded-3xl p-4 h-fit">
          <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Users</h3>
          <input
            type="text"
            placeholder="Search users..."
            value={userSearchTerm}
            onChange={e => setUserSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-amber-100 rounded-lg text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {filteredUsers.map(user => (
              <button
                key={user.uid}
                onClick={() => setSelectedUserId(user.uid)}
                className={`p-3 rounded-lg text-left text-xs transition-colors duration-200 ${
                  selectedUserId === user.uid
                    ? 'bg-[#D4AF37] text-white font-medium'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-medium truncate">{user.displayName || 'No Name'}</div>
                <div className="text-xs opacity-75 truncate">{user.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: User Addresses */}
        <div className="lg:col-span-3 bg-white border border-amber-100 rounded-3xl p-6">
          {!selectedUserId ? (
            <div className="text-center py-12 text-gray-500">
              <p>Select a user to view their addresses</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No addresses for this user</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className="border border-amber-100 rounded-2xl p-4 bg-[#F8F5F0] flex flex-col justify-between gap-3 relative"
                >
                  {addr.isDefault && (
                    <div className="absolute top-3 left-3 bg-[#D4AF37] text-white text-xs font-normal px-2 py-1 rounded-full">
                      DEFAULT
                    </div>
                  )}

                  <div className="text-xs flex flex-col gap-1 pr-12 mt-4">
                    <h4 className="font-medium text-[#1A1A1A] text-sm flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{addr.fullName}</span>
                    </h4>
                    <span className="text-xs text-gray-400 font-normal">Mobile: {addr.phone}</span>
                    <p className="text-gray-600 mt-2 text-xs font-medium leading-relaxed">
                      {addr.addressLine1}{addr.addressLine2 && <>, {addr.addressLine2}</> }<br />
                      {addr.city}, {addr.state} - <span className="font-normal text-[#1A1A1A]">{addr.pincode}</span>
                      <br />
                      {addr.country || 'India'}
                    </p>
                  </div>

                  {/* Edit and Delete buttons */}
                  <div className="flex gap-2 absolute top-3 right-3">
                    <button
                      onClick={() => handleEditAddress(addr)}
                      className="p-2 rounded-full bg-white border border-gray-100 text-[#1A1A1A] hover:bg-[#EDE6DA] transition-colors shadow-sm active:scale-95"
                      title="Edit Address"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-2 rounded-full bg-white border border-gray-100 text-red-500 hover:bg-red-50 transition-colors shadow-sm active:scale-95"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT ADDRESS MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-dvh overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-medium tracking-wide text-[#1A1A1A]">
                Edit Address
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAddressId(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleFormChange('fullName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                    formErrors.fullName ? 'border-red-500' : 'border-amber-100'
                  }`}
                  placeholder="Full name"
                />
                {formErrors.fullName && <p className="text-red-600 text-xs mt-1">{formErrors.fullName}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                    formErrors.phone ? 'border-red-500' : 'border-amber-100'
                  }`}
                  placeholder="10-digit mobile number"
                />
                {formErrors.phone && <p className="text-red-600 text-xs mt-1">{formErrors.phone}</p>}
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => handleFormChange('addressLine1', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                    formErrors.addressLine1 ? 'border-red-500' : 'border-amber-100'
                  }`}
                  placeholder="Street address"
                />
                {formErrors.addressLine1 && <p className="text-red-600 text-xs mt-1">{formErrors.addressLine1}</p>}
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => handleFormChange('addressLine2', e.target.value)}
                  className="w-full px-3 py-2 border border-amber-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Apt, suite (optional)"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleFormChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                    formErrors.city ? 'border-red-500' : 'border-amber-100'
                  }`}
                  placeholder="City"
                />
                {formErrors.city && <p className="text-red-600 text-xs mt-1">{formErrors.city}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleFormChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                    formErrors.state ? 'border-red-500' : 'border-amber-100'
                  }`}
                  placeholder="State"
                />
                {formErrors.state && <p className="text-red-600 text-xs mt-1">{formErrors.state}</p>}
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleFormChange('pincode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                    formErrors.pincode ? 'border-red-500' : 'border-amber-100'
                  }`}
                  placeholder="6-digit postal code"
                />
                {formErrors.pincode && <p className="text-red-600 text-xs mt-1">{formErrors.pincode}</p>}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleFormChange('country', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                    formErrors.country ? 'border-red-500' : 'border-amber-100'
                  }`}
                  placeholder="Country"
                />
                {formErrors.country && <p className="text-red-600 text-xs mt-1">{formErrors.country}</p>}
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => handleFormChange('isDefault', e.target.checked)}
                  className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="isDefault" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAddressId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium uppercase rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  className="flex-1 px-4 py-2 bg-[#1A1A1A] text-white text-xs font-medium uppercase rounded-lg hover:bg-[#2A2A2A] transition-colors"
                >
                  Update Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
