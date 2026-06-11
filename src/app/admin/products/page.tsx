"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { serviceDb, Product } from '../../../lib/firebase';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { validateImageFiles, getFriendlyErrorMessage, processImageForUpload } from '../../../lib/imageUtils';
import { normalizeSlug } from '../../../lib/slugUtils';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';

export default function AdminProductsPage() {
  const { triggerToast } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>(''); // 'processing', 'uploading', ''

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    category: 'earrings' as 'earrings' | 'chains' | 'bangles',

    images: [] as Array<string | { url: string; public_id?: string }>,
    stock: 0,
    featured: false,
    bestSeller: false,
    // New visibility fields
    showOnHome: false,
    showInFeaturedCollections: false,
    showInEarrings: false,
    showInChains: false,
    showInBangles: false,
    showInTrending: false,
    showInNewArrivals: false,
    // Shop by Category flag
    showInShopByCategory: false,
    // Delivery settings
    deliveryFee: 0,
    freeDelivery: false,
    wearStyles: [] as string[],
    // Manual specifications
    material: '',
    style: '',
    occasion: '',
    weight: '',
    availability: '',
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await serviceDb.getProducts();
      setProducts(data);
    } catch (error: any) {
      const errorMessage = getFriendlyErrorMessage(error);
      triggerToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: 0,
      discountPrice: 0,
      category: 'earrings',

      images: [] as Array<string | { url: string; public_id?: string }>,
      stock: 0,
      featured: false,
      bestSeller: false,
      showOnHome: false,
      showInFeaturedCollections: false,
      showInEarrings: false,
      showInChains: false,
      showInBangles: false,
      showInTrending: false,
      showInNewArrivals: false,
      showInShopByCategory: false,
      deliveryFee: 0,
      freeDelivery: false,
      wearStyles: [] as string[],
      material: '',
      style: '',
      occasion: '',
      weight: '',
      availability: '',
    });
    setEditingId(null);
  };

  const handleAddProduct = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      category: product.category,

      images: product.images,
      stock: product.stock,
      featured: product.featured,
      bestSeller: product.bestSeller,
      // Populate new fields
      showOnHome: product.showOnHome ?? false,
      showInFeaturedCollections: product.showInFeaturedCollections ?? false,
      showInEarrings: product.showInEarrings ?? false,
      showInChains: product.showInChains ?? false,
      showInBangles: product.showInBangles ?? false,
      showInTrending: product.showInTrending ?? false,
      showInNewArrivals: product.showInNewArrivals ?? false,
      showInShopByCategory: product.showInShopByCategory ?? false,
      deliveryFee: product.deliveryFee ?? 0,
      freeDelivery: product.freeDelivery ?? false,
      wearStyles: product.wearStyles || [],
      material: product.material || '',
      style: product.style || '',
      occasion: product.occasion || '',
      weight: product.weight || '',
      availability: product.availability || '',
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    // Validation
    if (!form.name) {
      triggerToast('Product Name is required', 'error');
      return;
    }
    if (!form.description) {
      triggerToast('Product Description is required', 'error');
      return;
    }
    if (!form.category) {
      triggerToast('Category is required', 'error');
      return;
    }
    if (form.price <= 0) {
      triggerToast('Price must be greater than 0', 'error');
      return;
    }
    if (form.stock < 0) {
      triggerToast('Stock cannot be negative', 'error');
      return;
    }
    if (form.images.length === 0) {
      triggerToast('At least one product image is required', 'error');
      return;
    }
    const generatedSlug = normalizeSlug(form.name);
    const payload = {
      ...form,
      slug: generatedSlug,
      // SKU will be generated in backend if missing
      createdAt: new Date().toISOString(),
      rating: 0,
      reviewCount: 0,
      wearType: 'daily' as const,
      wearStyles: form.wearStyles,
    };
    try {
      setLoading(true);
      if (editingId) {
        await serviceDb.updateProduct(editingId, payload);
        triggerToast('Product saved successfully.', 'success');
      } else {
        await serviceDb.addProduct(payload);
        triggerToast('Product saved successfully.', 'success');
      }
      setShowModal(false);
      resetForm();
      await loadProducts();
    } catch (error: any) {
      // Use friendly error message
      const errorMessage = getFriendlyErrorMessage(error);
      triggerToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      setLoading(true);
      await serviceDb.deleteProduct(id);
      triggerToast('Product deleted successfully!', 'success');
      await loadProducts();
    } catch (error: any) {
      triggerToast(`Error deleting product: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (form.images.length + files.length > 3) {
      triggerToast('Maximum 3 images allowed per product.', 'error');
      return;
    }

    // Validate images before uploading
    const validationResult = validateImageFiles(files);
    if (!validationResult.valid) {
      triggerToast(validationResult.error || 'Image upload failed. Please try again.', 'error');
      return;
    }

    setUploadingImages(true);
    setUploadProgress(0);
    setUploadStatus('processing');

    try {
      const uploadedUrls: Array<string | { url: string; public_id?: string }> = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        try {
          // Process image (compress if needed)
          setUploadStatus('processing');
          const { file: processedFile, error: processingError } = await processImageForUpload(files[i]);
          
          if (processingError) {
            triggerToast(processingError, 'error');
            setUploadingImages(false);
            setUploadStatus('');
            setUploadProgress(0);
            return;
          }

          // Upload processed image to Cloudinary with per-file progress
          setUploadStatus('uploading');
          const result = await uploadToCloudinary(processedFile, (fileProgressFraction) => {
            // fileProgressFraction is 0..1 for current file
            const base = i / totalFiles;
            const combined = Math.round((base + fileProgressFraction / totalFiles) * 100);
            setUploadProgress(combined);
          });
          uploadedUrls.push({ url: result.secure_url, public_id: result.public_id });
        } catch (err: any) {
          const errorMessage = getFriendlyErrorMessage(err);
          triggerToast(errorMessage, 'error');
          setUploadingImages(false);
          setUploadStatus('');
          setUploadProgress(0);
          return;
        }
      }

      // Add uploaded URLs to form (don't replace, append)
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      setUploadProgress(0);
      setUploadingImages(false);
      setUploadStatus('');
      // Clear file input
      e.target.value = '';
    } catch (error: any) {
      const errorMessage = getFriendlyErrorMessage(error);
      triggerToast(errorMessage, 'error');
      setUploadingImages(false);
      setUploadStatus('');
      setUploadProgress(0);
    }
  };

  const removeImage = async (index: number) => {
    const img = form.images[index] as any;
    // If this image has a Cloudinary public_id, attempt to delete it immediately
    if (img && typeof img !== 'string' && img.public_id) {
      try {
        await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: img.public_id }),
        });
      } catch (err) {
        console.warn('Failed to delete cloud image', err);
      }
    }
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-light tracking-wide mb-2">Product Registry</h2>
          <p className="text-sm text-gray-600">Add, edit and remove product listings from the store.</p>
        </div>
        <button onClick={handleAddProduct} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-amber-100 rounded-3xl overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No products found. Create one to get started!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-amber-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-amber-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-700">{product.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">₹{product.discountPrice}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      <span className={product.stock === 0 ? 'text-red-600 font-semibold' : ''}>{product.stock}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700 capitalize">{product.category}</td>
                    <td className="px-6 py-3 text-center text-sm flex justify-center gap-2">
                      <button onClick={() => handleEditProduct(product)} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[900px] max-h-[90dvh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            {/* Form Fields */}
            <label className="block">
              <span className="text-sm font-medium">Product Name *</span>
              <input type="text" placeholder="Enter product name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Description *</span>
              <textarea placeholder="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full mt-1 px-4 py-2 border border-amber-100 rounded-lg" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Category *</span>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg">
                <option value="earrings">Earrings</option>
                <option value="chains">Chains</option>
                <option value="bangles">Bangles</option>
              </select>
            </label>
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700">Wear Style</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {['Daily Wear', 'Casual Wear', 'Party Wear', 'Traditional Wear', 'Festive Wear'].map((style) => (
                  <label key={style} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={form.wearStyles.includes(style)} 
                      onChange={e => {
                        if (e.target.checked) {
                          setForm({ ...form, wearStyles: [...form.wearStyles, style] });
                        } else {
                          setForm({ ...form, wearStyles: form.wearStyles.filter(s => s !== style) });
                        }
                      }} 
                    />
                    <span className="text-sm">{style}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700">Product Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <label className="block">
                  <span className="text-sm font-medium">Material</span>
                  <input type="text" placeholder="e.g. 18k Gold Plated" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Style</span>
                  <input type="text" placeholder="e.g. Minimalist" value={form.style} onChange={e => setForm({ ...form, style: e.target.value })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Occasion</span>
                  <input type="text" placeholder="e.g. Wedding, Daily" value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Weight</span>
                  <input type="text" placeholder="e.g. 15g" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Availability</span>
                  <input type="text" placeholder="e.g. Ships in 24 hours" value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg" />
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700">Homepage Visibility</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.showInFeaturedCollections} onChange={e => setForm({ ...form, showInFeaturedCollections: e.target.checked })} />
                  Show in Featured Collections
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.showInNewArrivals} onChange={e => setForm({ ...form, showInNewArrivals: e.target.checked })} />
                  Show in New Arrivals
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.showInTrending} onChange={e => setForm({ ...form, showInTrending: e.target.checked })} />
                  Show in Trending Products
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Price (₹) *</span>
                <input type="number" placeholder="Enter price" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Discount Price (₹) (Optional)</span>
                <input type="number" placeholder="Enter discount price" value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: Number(e.target.value) })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium">Stock Quantity *</span>
              <input type="number" placeholder="Enter available stock" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg" />
            </label>

            {/* Product Images Section */}
            <div className="block">
              <span className="text-sm font-medium">Product Images * ({form.images.length}/3)</span>
              <p className="text-xs text-gray-500 mt-1">Max 3 images, 10 MB each. JPG, PNG, WEBP supported. Images over 2 MB will be automatically compressed.</p>
              
              {/* Image Input */}
              <div className="mt-2">
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-amber-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={uploadingImages ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload size={20} className="mb-2 text-amber-500" />
                    <p className="text-sm font-medium">
                      {uploadingImages 
                        ? uploadStatus === 'processing' 
                          ? 'Processing image...' 
                          : `Uploading images... ${uploadProgress}%`
                        : 'Click to upload images'
                      }
                    </p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    multiple 
                    onChange={handleImageUpload}
                    disabled={uploadingImages || form.images.length >= 3}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Upload Progress */}
              {uploadingImages && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-colors duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 text-center">
                    {uploadStatus === 'processing' ? 'Compressing image...' : `Uploading... ${uploadProgress}%`}
                  </p>
                </div>
              )}

              {/* Image Previews */}
              {form.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Uploaded Images ({form.images.length}/3):</p>
                  <div className="grid grid-cols-3 gap-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <Image 
                          src={typeof img === 'string' ? img : img.url} 
                          alt={`preview-${idx}`} 
                          width={96}
                          height={96}
                          className="h-24 w-24 object-cover rounded border border-amber-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Feature Flags */}
<div className="flex gap-4 mt-4">
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
    Featured Product
  </label>
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={form.bestSeller} onChange={e => setForm({ ...form, bestSeller: e.target.checked })} />
    Best Seller
  </label>
</div>

{/* Website Visibility */}
<h3 className="mt-6 text-sm font-medium text-gray-700">Website Visibility</h3>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={form.showInEarrings} onChange={e => setForm({ ...form, showInEarrings: e.target.checked })} />
    Show in Earrings Page
  </label>
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={form.showInChains} onChange={e => setForm({ ...form, showInChains: e.target.checked })} />
    Show in Chains Page
  </label>
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={form.showInBangles} onChange={e => setForm({ ...form, showInBangles: e.target.checked })} />
    Show in Bangles Page
  </label>
</div>

{/* Product Settings */}
<h3 className="mt-6 text-sm font-medium text-gray-700">Product Settings</h3>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={Boolean(form.showInShopByCategory)} onChange={e => setForm({ ...form, showInShopByCategory: e.target.checked })} />
    Shop by Category
  </label>
</div>

{/* Delivery Settings */}
<h3 className="mt-6 text-sm font-medium text-gray-700">Delivery Settings</h3>
<div className="mt-2">
  <label className="block">
    <span className="text-sm font-medium">Delivery Fee (₹)</span>
    <input type="number" placeholder="Enter delivery fee" value={form.deliveryFee} onChange={e => setForm({ ...form, deliveryFee: Number(e.target.value) })} className="mt-1 w-full px-4 py-2 border border-amber-100 rounded-lg" />
  </label>
  <label className="flex items-center gap-2 mt-2">
    <input type="checkbox" checked={form.freeDelivery} onChange={e => setForm({ ...form, freeDelivery: e.target.checked })} />
    Free Delivery Eligible
  </label>
</div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-amber-100 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveProduct} disabled={loading || uploadingImages} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
                {loading ? 'Saving...' : uploadingImages ? 'Uploading...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
