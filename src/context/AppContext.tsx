'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { serviceAuth, serviceDb, Product, Address, Order } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { User as FirebaseUser } from 'firebase/auth';

const ADMIN_EMAIL_WHITELIST = [
  'vishnupriyareddy0711@gmail.com',
  'jashujash1107@gmail.com'
];

interface CartItem {
  product: Product;
  quantity: number;
}

interface User extends FirebaseUser {
  rewardStatus?: {
    totalItemsBought: number;
    giftUnlocked: boolean;
  };
  isAdmin?: boolean;
  role?: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info' | 'reward';
}

interface AppContextType {
  user: User | null;
  loadingAuth: boolean;
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  reviews: any[];
  settings: any;
  toasts: ToastMessage[];
  triggerToast: (text: string, type?: 'success' | 'error' | 'info' | 'reward') => void;
  dismissToast: (id: string) => void;
  // Auth actions
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: (options?: { silent?: boolean }) => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  interceptAuthAction: (action: () => void) => void;
  sanitizeError: (error: any) => string;
  justSignedOut: boolean;
  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  // Wishlist actions
  toggleWishlist: (productId: string) => void;
  moveToCart: (productId: string) => void;
  // Order actions
  placeOrder: (address: Address) => Promise<Order>;
  checkoutCart: (address: Address) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  // Address actions
  addAddress: (address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Address>;
  updateAddress: (addressId: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  // Reviews actions
  addReview: (productId: string, rating: number, comment: string, file: File | null) => Promise<void>;
  updateReview: (reviewId: string, rating: number, comment: string, file: File | null) => Promise<void>;
  // Admin actions
  adminAddProduct: (prod: Omit<Product, 'id'>) => Promise<void>;
  adminEditProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  adminDeleteProduct: (id: string) => Promise<void>;
  adminUpdateOrderStatus: (orderId: string, status: string) => Promise<void>;
  adminApproveReview: (reviewId: string) => Promise<void>;
  adminRejectReview: (reviewId: string) => Promise<void>;
  adminFeatureReview: (reviewId: string, feature: boolean) => Promise<void>;
  adminUpdateSettings: (settings: any) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    freeShippingLimit: 299,
    standardShippingCharge: 19,
    enableFreeShipping: true,
    announcementText: "✨ Buy Any 3 Products & Receive A Complimentary Gift From KAELORA ✨",
    storePhone: "+91 6305517109",
    whatsappNumber: "+91 6305517109",
    giftGoal: 3,
  });
  
  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [justSignedOut, setJustSignedOut] = useState(false);

  // Auth Interceptor Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' | 'reward' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => dismissToast(id), 4000);
  };

  const sanitizeError = (error: any) => {
    try {
      const code = error?.code || '';
      const msg = String(error?.message || error || '');
      // Map known auth/firestore codes to friendly messages
      if (code.includes('auth/user-not-found') || msg.toLowerCase().includes('user not found') || msg.toLowerCase().includes('no user')) {
        return 'Invalid email or password';
      }
      if (code.includes('auth/wrong-password') || msg.toLowerCase().includes('password')) {
        return 'Invalid email or password';
      }
      if (code.includes('permission-denied') || code.includes('unauthenticated') || msg.toLowerCase().includes('permission-denied')) {
        return 'Please sign in again to continue.';
      }
      // Generic fallback for auth issues
      if (code.startsWith('auth/') || msg.toLowerCase().includes('firebase')) {
        return 'Authentication failed. Please try again.';
      }
      // Default: return a safe, user-friendly message
      return msg || 'Something went wrong. Please try again.';
    } catch (e) {
      return 'Something went wrong. Please try again.';
    }
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Action Interceptor
  const interceptAuthAction = (action: () => void) => {
    if (!user) {
      setPendingAction(() => action);
      setAuthModalOpen(true);
      triggerToast("Please login or create an account to proceed.", "info");
    } else {
      action();
    }
  };

  // 1. Load System Settings, Reviews, and Products initially
  useEffect(() => {
    serviceDb.getSettings()
      .then(setSettings)
      .catch((error) => {
        console.error('[AppContext] Error loading settings:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'settings'
        });
      });
    
    serviceDb.getReviews()
      .then(setReviews)
      .catch((error) => {
        console.error('[AppContext] Error loading reviews:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'reviews'
        });
      });
  }, []);

  const clearUserState = () => {
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setPendingAction(null);
    setAuthModalOpen(false);
  };

  // 2. Watch Auth State Changes
  useEffect(() => {
    const unsubscribe = serviceAuth.onStateChanged((currentUser) => {
      const isWhitelistedEmail = !!currentUser?.email && ADMIN_EMAIL_WHITELIST.includes(currentUser.email.toLowerCase());
      const emailVerified = currentUser?.emailVerified === undefined ? true : currentUser.emailVerified;
      // Determine admin: explicit role 'admin' OR whitelisted email
      const isAdmin = (currentUser?.role === 'admin') || (isWhitelistedEmail && emailVerified);

      // Preserve role if provided by session
      const enrichedUser = currentUser ? { ...currentUser, role: currentUser.role ?? undefined, isAdmin } : null;
      setUser(enrichedUser);
      setLoadingAuth(false);

      if (!currentUser) {
        clearUserState();
        return;
      }

      if (isAdmin) {
        clearUserState();
      } else {
        // Sync cart & wishlist from database for normal users only
        setWishlist(currentUser.wishlist || []);
        setCart(currentUser.cartItems || []);

        // Fetch only this user's orders
        serviceDb.getOrders(currentUser.uid)
          .then((userOrders) => {
            setOrders(userOrders);
          })
          .catch((error) => {
            console.error('[AppContext] Error loading user orders:', {
              uid: currentUser.uid,
              errorCode: error.code,
              errorMessage: error.message,
              collection: 'orders'
            });
            setOrders([]);
          });
      }

      // Trigger pending action if any
      if (pendingAction) {
        setTimeout(() => {
          pendingAction();
          setPendingAction(null);
        }, 100);
        setAuthModalOpen(false);
      }
    });

    return () => unsubscribe();
  }, [pendingAction]);

  // Auth Operations
  const login = async (email: string, pass: string) => {
    await serviceAuth.login(email, pass);
    triggerToast("Welcome back to KAELORA Jewellery!", "success");
  };

  const signUp = async (email: string, pass: string, name: string) => {
    await serviceAuth.signUp(email, pass, name);
    triggerToast("Account created successfully! Welcome to Kaelora.", "success");
  };

  const googleLogin = async () => {
    await serviceAuth.googleLogin();
    triggerToast("Successfully signed in with Google!", "success");
  };

  const logout = async (options: { silent?: boolean } = {}) => {
    await serviceAuth.logout();
    setUser(null);
    clearUserState();

    // Mark recently signed out to avoid repeated auth popups/toasts
    setJustSignedOut(true);
    setTimeout(() => setJustSignedOut(false), 2500);

    if (!options.silent) {
      triggerToast('You have been signed out successfully.', 'info');
    }

    // Redirect to home after logout
    router.push('/');
  };

  // Sync Cart to db on state change
  const saveCartState = async (newCart: CartItem[]) => {
    setCart(newCart);
    if (user) {
      await serviceDb.updateUserProfile(user.uid, { cartItems: newCart });
    }
  };

  // Cart Operations
  const addToCart = (product: Product, quantity = 1) => {
    const action = async () => {
      const existing = cart.find(item => item.product.id === product.id);
      let updatedCart: CartItem[];
      
      if (existing) {
        if (existing.quantity + quantity > product.stock) {
          triggerToast(`Unable to add: Only ${product.stock} pieces in stock.`, "error");
          return;
        }
        updatedCart = cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        if (quantity > product.stock) {
          triggerToast(`Unable to add: Only ${product.stock} pieces in stock.`, "error");
          return;
        }
        updatedCart = [...cart, { product, quantity }];
      }

      await saveCartState(updatedCart);
      console.log('Cart Items:', updatedCart);
      console.log('Delivery Fees:', updatedCart.map(item => item.product.deliveryFee || 0));
      triggerToast(`✨ Added "${product.name}" to cart!`, "success");
    };

    interceptAuthAction(action);
  };

  const removeFromCart = async (productId: string) => {
    const updatedCart = cart.filter(item => item.product.id !== productId);
    await saveCartState(updatedCart);
    triggerToast("Item removed from cart.", "info");
  };

  const updateCartQuantity = async (productId: string, qty: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    if (qty > item.product.stock) {
      triggerToast(`Low inventory alert: Only ${item.product.stock} left in stock.`, "error");
      return;
    }
    if (qty < 1) return;

    const updatedCart = cart.map(i => 
      i.product.id === productId ? { ...i, quantity: qty } : i
    );
    await saveCartState(updatedCart);
  };

  const clearCart = async () => {
    await saveCartState([]);
  };

  // Wishlist Operations
  const toggleWishlist = (productId: string) => {
    const action = async () => {
      let updatedWishlist: string[];
      let message: string;
      
      if (wishlist.includes(productId)) {
        updatedWishlist = wishlist.filter(id => id !== productId);
        message = "Removed item from wishlist.";
      } else {
        updatedWishlist = [...wishlist, productId];
        message = "❤️ Added item to wishlist!";
      }

      setWishlist(updatedWishlist);
      triggerToast(message, "success");
      if (user) {
        await serviceDb.updateUserProfile(user.uid, { wishlist: updatedWishlist });
      }
    };

    interceptAuthAction(action);
  };

  const moveToCart = (productId: string) => {
    const itemInWishlist = wishlist.includes(productId);
    if (!itemInWishlist) return;

    // Find the product
    serviceDb.getProducts().then(products => {
      const prod = products.find(p => p.id === productId);
      if (prod) {
        addToCart(prod, 1);
        const updatedWishlist = wishlist.filter(id => id !== productId);
        setWishlist(updatedWishlist);
        if (user) {
          serviceDb.updateUserProfile(user.uid, { wishlist: updatedWishlist });
        }
      }
    });
  };

  // Order Operations
  const placeOrder = async (address: Address) => {
    if (!user) throw new Error("Authentication required!");

    const subtotal = cart.reduce((acc, item) => acc + (item.product.discountPrice * item.quantity), 0);
    const productDeliveryFee = cart.reduce((acc, item) => {
      return item.product.freeDelivery ? acc : acc + ((item.product.deliveryFee || 0) * item.quantity);
    }, 0);
    const shipping = subtotal >= settings.freeShippingLimit || !settings.enableFreeShipping ? 0 : settings.standardShippingCharge;
    const totalAmount = subtotal + productDeliveryFee + shipping;

    // Est delivery logic (based on pincode)
    const pincode = address.pincode;
    let days = 5;
    if (pincode.startsWith('1') || pincode.startsWith('2')) {
      days = 3; // Nearby locations
    } else if (pincode.startsWith('5') || pincode.startsWith('6')) {
      days = 7; // Long distance
    } else {
      days = 5; // Medium distance
    }

    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(estDeliveryDate.getDate() + days);

    const orderProducts = cart.map(item => ({
      id: item.product.id,
      productName: item.product.name,
      slug: item.product.slug,
      price: item.product.discountPrice,
      productImage: typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0]?.url,
      quantity: item.quantity
    }));

    const orderData = {
      userId: user.uid,
      customerName: address.fullName,
      phone: address.phone,
      shippingAddress: address,
      address: `${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode}`,
      items: orderProducts,
      products: orderProducts,
      status: 'processing' as const,
      totalAmount: totalAmount,
      subtotal: subtotal,
      productDeliveryFee: productDeliveryFee,
      shippingCharge: shipping,
      shippingFee: shipping,
      estimatedDelivery: estDeliveryDate.toISOString(),
      paymentMethod: 'online',
      paymentStatus: 'paid', // Assuming secure instant payment
      paymentVerified: true,
      orderStatus: 'processing',
      createdAt: new Date().toISOString()
    };

    const newOrderId = await serviceDb.createOrder(orderData);
    const createdOrder = {
      id: newOrderId,
      ...orderData
    } as Order;

    // Add to local state orders
    setOrders(prev => [{ orderId: newOrderId, ...orderData }, ...prev]);
    
    // Increment items count for rewards status in current session
    const currentBought = user.rewardStatus?.totalItemsBought || 0;
    const itemsBought = cart.reduce((acc, p) => acc + p.quantity, 0);
    const totalBought = currentBought + itemsBought;
    
    setUser((prev: any) => ({
      ...prev,
      rewardStatus: {
        totalItemsBought: totalBought,
        giftUnlocked: totalBought >= settings.giftGoal
      }
    }));

    // Trigger congratulations toast if gift unlocked
    if (totalBought >= settings.giftGoal && !user.rewardStatus?.giftUnlocked) {
      setTimeout(() => {
        triggerToast("🎉 Congratulations! You unlocked a complimentary KAELORA gift!", "reward");
      }, 1500);
    }

    // Deduct stock levels in products database
    for (const item of cart) {
      await serviceDb.updateProduct(item.product.id, {
        stock: Math.max(0, item.product.stock - item.quantity)
      });
    }

    await clearCart();
    return createdOrder;
  };

  // Checkout Cart (alias for placeOrder)
  const checkoutCart = async (address: Address) => {
    return await placeOrder(address);
  };

  // Address Management
  const addAddress = async (address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error("Authentication required!");
    const newAddress = await serviceDb.addAddress(user.uid, address);
    triggerToast('Address added successfully.', 'success');
    return newAddress;
  };

  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    if (!user) throw new Error("Authentication required!");
    await serviceDb.updateAddress(user.uid, addressId, updates);
    triggerToast('Address updated successfully.', 'success');
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) throw new Error("Authentication required!");
    await serviceDb.deleteAddress(user.uid, addressId);
    triggerToast('Address deleted successfully.', 'success');
  };

  // Submit Review
  const addReview = async (productId: string, rating: number, comment: string, file: File | null) => {
    if (!user) throw new Error("Auth required to review products");

    // Check for duplicate review by this user for this product
    const existingReview = reviews.find(r => r.productId === productId && r.userId === user.uid);
    if (existingReview) {
      await updateReview(existingReview.id, rating, comment, file);
      return;
    }

    let imageUrl = '';
    if (file) {
      try {
        const res = await uploadToCloudinary(file);
        imageUrl = res.secure_url;
      } catch (err) {
        console.warn('Failed to upload review image', err);
        imageUrl = '';
      }
    }

    const reviewData = {
      productId,
      userId: user.uid,
      userName: user.fullName || user.displayName || 'Luxury Guest',
      rating,
      comment,
      image: imageUrl,
      approved: true, // Auto-approve to display instantly
      featured: false,
      createdAt: new Date().toISOString()
    };

    await serviceDb.addReview(reviewData);
    triggerToast("✨ Review submitted! Thank you.", "success");
    
    // Reload reviews list
    const updatedReviews = await serviceDb.getReviews();
    setReviews(updatedReviews);
  };

  const updateReview = async (reviewId: string, rating: number, comment: string, file: File | null) => {
    if (!user) throw new Error("Auth required to review products");

    const updateData: any = {
      rating,
      comment,
      approved: true,
      updatedAt: new Date().toISOString()
    };

    if (file) {
      try {
        const res = await uploadToCloudinary(file);
        updateData.image = res.secure_url;
      } catch (err) {
        console.warn('Failed to upload review image', err);
      }
    }

    await serviceDb.updateReview(reviewId, updateData);
    triggerToast("✨ Review updated successfully!", "success");
    
    // Reload reviews list
    const updatedReviews = await serviceDb.getReviews();
    setReviews(updatedReviews);
  };

  // ADMIN DASHBOARD CRUD WRAPPERS

  const adminAddProduct = async (prod: Omit<Product, 'id'>) => {
    await serviceDb.addProduct(prod);
    triggerToast("Product successfully added to showcase!", "success");
  };

  const adminEditProduct = async (id: string, prod: Partial<Product>) => {
    await serviceDb.updateProduct(id, prod);
    triggerToast("Product details updated.", "success");
  };

  const adminDeleteProduct = async (id: string) => {
    await serviceDb.deleteProduct(id);
    triggerToast("Product removed from showcase.", "info");
  };

  const adminUpdateOrderStatus = async (orderId: string, status: string) => {
    await serviceDb.updateOrderStatus(orderId, status);
    triggerToast(`Order status updated to: ${status}`, "success");
    
    // Refresh orders in state
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: status } : o));
  };

  const cancelOrder = async (orderId: string) => {
    if (!user) throw new Error('Authentication required to cancel order');
    const metadata = { cancelledBy: { id: user.uid, name: user.displayName || user.email || 'User', role: user.isAdmin ? 'admin' : 'user' } };
    await serviceDb.updateOrderStatus(orderId, 'cancelled', metadata);
    triggerToast('Order cancelled successfully.', 'success');

    // Refresh user's orders
    try {
      const fresh = await serviceDb.getOrders(user.uid);
      setOrders(fresh);
    } catch (e) {
      // Fallback: update local orders state
      setOrders(prev => prev.map(o => {
        const id = (o.id || o.orderId);
        if (id === orderId) return { ...o, status: 'cancelled', orderStatus: 'cancelled', cancelledBy: metadata.cancelledBy, cancelledAt: new Date().toISOString() };
        return o;
      }));
    }
  };

  const adminApproveReview = async (reviewId: string) => {
    await serviceDb.approveReview(reviewId);
    triggerToast("Review approved and is now public.", "success");
    
    // Refresh reviews
    const list = await serviceDb.getReviews();
    setReviews(list);
  };

  const adminRejectReview = async (reviewId: string) => {
    await serviceDb.rejectOrDeleteReview(reviewId);
    triggerToast("Review deleted.", "info");
    
    // Refresh reviews
    const list = await serviceDb.getReviews();
    setReviews(list);
  };

  const adminFeatureReview = async (reviewId: string, feature: boolean) => {
    await serviceDb.featureReview(reviewId, feature);
    triggerToast(feature ? "Review marked as featured." : "Review unfeatured.", "success");
    
    // Refresh reviews
    const list = await serviceDb.getReviews();
    setReviews(list);
  };

  const adminUpdateSettings = async (newSettings: any) => {
    await serviceDb.updateSettings(newSettings);
    setSettings(newSettings);
    triggerToast("Settings saved successfully.", "success");
  };

  return (
    <AppContext.Provider value={{
      user, loadingAuth, cart, wishlist, orders, reviews, settings, toasts, triggerToast, dismissToast,
      login, signUp, googleLogin, logout, authModalOpen, setAuthModalOpen, interceptAuthAction,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      toggleWishlist, moveToCart, placeOrder, checkoutCart, addAddress, updateAddress, deleteAddress, addReview, updateReview,
      adminAddProduct, adminEditProduct, adminDeleteProduct, adminUpdateOrderStatus,
      cancelOrder,
      adminApproveReview, adminRejectReview, adminFeatureReview, adminUpdateSettings,
      sanitizeError, justSignedOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
