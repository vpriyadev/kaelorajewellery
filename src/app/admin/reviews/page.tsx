"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { serviceDb, Review } from '../../../lib/firebase';
import Image from 'next/image';
import { Check, X, Star } from 'lucide-react';

export default function AdminReviewsPage() {
  const { triggerToast } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterApproved, setFilterApproved] = useState<'all' | 'pending' | 'approved'>('all');

  // Load reviews
  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await serviceDb.getReviews();
      setReviews(data);
    } catch (error: any) {
      triggerToast(`Error loading reviews: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApproveReview = async (reviewId: string) => {
    try {
      setLoading(true);
      await serviceDb.approveReview(reviewId);
      triggerToast('Review approved!', 'success');
      await loadReviews();
    } catch (error: any) {
      triggerToast(`Error approving review: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      setLoading(true);
      await serviceDb.rejectOrDeleteReview(reviewId);
      triggerToast('Review deleted!', 'success');
      await loadReviews();
    } catch (error: any) {
      triggerToast(`Error deleting review: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureReview = async (reviewId: string, featured: boolean) => {
    try {
      setLoading(true);
      await serviceDb.featureReview(reviewId, !featured);
      triggerToast(featured ? 'Review unfeatured!' : 'Review featured!', 'success');
      await loadReviews();
    } catch (error: any) {
      triggerToast(`Error updating review: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filterApproved === 'pending') return !r.approved;
    if (filterApproved === 'approved') return r.approved;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-light tracking-wide mb-2">Reviews Management</h2>
          <p className="text-sm text-gray-600">Moderate and feature customer reviews.</p>
        </div>
        <button
          onClick={loadReviews}
          disabled={loading}
          className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {['all', 'pending', 'approved'].map(status => (
          <button
            key={status}
            onClick={() => setFilterApproved(status as any)}
            className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition ${
              filterApproved === status
                ? 'bg-burgundy text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
            {status === 'pending' && ` (${reviews.filter(r => !r.approved).length})`}
            {status === 'approved' && ` (${reviews.filter(r => r.approved).length})`}
          </button>
        ))}
      </div>

      {/* Reviews Cards */}
      <div className="space-y-4">
        {loading && reviews.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-3xl">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-3xl">No reviews found.</div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="bg-white border border-amber-100 rounded-3xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{review.userName}</h3>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-500'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Product ID: {review.productId}</p>
                </div>
                <div className="text-right">
                  {review.approved ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Approved
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Pending
                    </span>
                  )}
                  {review.featured && (
                    <div className="mt-2 inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      Featured
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              {review.image && (
                <Image src={review.image} alt="Review" width={80} height={80} className="w-20 h-20 rounded-lg mb-4 object-cover" />
              )}

              <p className="text-xs text-gray-500 mb-4">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>

              <div className="flex gap-2">
                {!review.approved && (
                  <button
                    onClick={() => handleApproveReview(review.id)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 text-sm font-medium"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                )}

                <button
                  onClick={() => handleRejectReview(review.id)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm font-medium"
                >
                  <X size={16} />
                  Delete
                </button>

                {review.approved && (
                  <button
                    onClick={() => handleFeatureReview(review.id, review.featured)}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${
                      review.featured
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Star size={16} />
                    {review.featured ? 'Unfeature' : 'Feature'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
