"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { serviceDb } from '../../../lib/firebase';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { Save, Loader2, Phone, Facebook, Instagram, Package, Truck } from 'lucide-react';

export default function AdminSettingsPage() {
  const { triggerToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);


  const [form, setForm] = useState({
    storeName: 'KAELORA Jewellery',
    storePhone: '+91 6305517109',
    storeEmail: 'contact@kaelora.com',
    whatsappNumber: '+91 6305517109',
    instagramLink: 'https://instagram.com/kaelora',
    facebookLink: 'https://facebook.com/kaelora',
    freeShippingLimit: 299,
    standardShippingCharge: 19,
    announcementText: "",
    giftGoal: 3,
  });



  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const appSettings = await serviceDb.getSettings();
        if (appSettings) {
          setForm(prev => ({ ...prev, ...appSettings }));
        }


      } catch (error: any) {
        triggerToast(`Error loading settings: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);



  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await serviceDb.updateSettings(form);
      triggerToast('Settings saved successfully!', 'success');
    } catch (error: any) {
      triggerToast(`Error saving settings: ${error.message}`, 'error');
    } finally {
      setSaveLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-display font-light tracking-wide mb-2">Store Settings</h2>
        <p className="text-sm text-gray-600">Manage store information, shipping, and contact details.</p>
      </div>

      <div className="space-y-6">
        {/* Store Information Section */}
        <div className="bg-white border border-amber-100 rounded-3xl p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Package size={20} className="text-burgundy" />
            Store Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
              <input
                type="text"
                value={form.storeName}
                onChange={e => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
              <input
                type="email"
                value={form.storeEmail}
                onChange={e => setForm({ ...form, storeEmail: e.target.value })}
                className="w-full px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Store Phone
              </label>
              <input
                type="tel"
                value={form.storePhone}
                onChange={e => setForm({ ...form, storePhone: e.target.value })}
                className="w-full px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={form.whatsappNumber}
                onChange={e => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Banner Text</label>
            <textarea
              value={form.announcementText}
              onChange={e => setForm({ ...form, announcementText: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
            />
            <p className="text-xs text-gray-500 mt-2">This text appears in the site header banner</p>
          </div>
        </div>



        {/* Social Media Links */}
        <div className="bg-white border border-amber-100 rounded-3xl p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Instagram size={20} className="text-burgundy" />
            Social Media Links
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Facebook size={16} className="inline mr-2 text-blue-600" />
                Facebook Page URL
              </label>
              <input
                type="url"
                value={form.facebookLink}
                onChange={e => setForm({ ...form, facebookLink: e.target.value })}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Instagram size={16} className="inline mr-2 text-pink-600" />
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={form.instagramLink}
                onChange={e => setForm({ ...form, instagramLink: e.target.value })}
                placeholder="https://instagram.com/yourprofile"
                className="w-full px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
              />
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white border border-amber-100 rounded-3xl p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Truck size={20} className="text-burgundy" />
            Shipping Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Free Delivery Minimum Order</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">₹</span>
                <input
                  type="number"
                  value={form.freeShippingLimit}
                  onChange={e => setForm({ ...form, freeShippingLimit: Number(e.target.value) })}
                  className="flex-grow px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Orders above this amount get free shipping</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Standard Shipping Charge</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">₹</span>
                <input
                  type="number"
                  value={form.standardShippingCharge}
                  onChange={e => setForm({ ...form, standardShippingCharge: Number(e.target.value) })}
                  className="flex-grow px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Shipping charge for orders below the free shipping limit</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gift Unlock Goal</label>
              <input
                type="number"
                value={form.giftGoal}
                onChange={e => setForm({ ...form, giftGoal: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy"
              />
              <p className="text-xs text-gray-500 mt-2">Number of products customer must buy to unlock complimentary gift</p>
            </div>
          </div>
        </div>

        {/* Summary of Current Settings */}
        <div className="bg-gradient-to-r from-burgundy/10 to-amber-100/10 border border-amber-100 rounded-3xl p-6">
          <h3 className="text-lg font-medium mb-4">Current Configuration Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Free Shipping Applies When:</p>
              <p className="font-semibold text-burgundy">Order Total ≥ ₹{form.freeShippingLimit}</p>
            </div>
            <div>
              <p className="text-gray-600">Otherwise Shipping Cost:</p>
              <p className="font-semibold text-burgundy">₹{form.standardShippingCharge}</p>
            </div>
            <div>
              <p className="text-gray-600">Gift Unlock:</p>
              <p className="font-medium text-burgundy">After {form.giftGoal} Products Purchased</p>
            </div>
            <div>
              <p className="text-gray-600">Customer Service:</p>
              <p className="font-medium text-burgundy">{form.storePhone}</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="flex items-center gap-2 px-6 py-3 bg-burgundy text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 font-medium"
          >
            {saveLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {saveLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
