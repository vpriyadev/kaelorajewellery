'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { serviceAuth, serviceDb, serviceStorage, Product } from '../lib/firebase';

interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  fullName: string;
  phone: string;
  houseNumber: string;
  street: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
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
  logout: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  interceptAuthAction: (action: () => void) => void;
  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  // Wishlist actions
  toggleWishlist: (productId: string) => void;
  moveToCart: (productId: string) => void;
  // Order actions
  placeOrder: (address: Address) => Promise<string>;
  // Reviews actions
  addReview: (productId: string, rating: number, comment: string, file: File | null) => Promise<void>;
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
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    freeShippingLimit: 400,
    standardShippingCharge: 50,
    enableFreeShipping: true,
    announcementText: "✨ Buy Any 3 Products & Receive A Complimentary Gift From KAELORA ✨",
    storePhone: "+91 6305517109",
    whatsappNumber: "+91 6305517109",
    giftGoal: 3,
  });
  
  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auth Interceptor Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' | 'reward' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => dismissToast(id), 4000);
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
    serviceDb.getSettings().then(setSettings);
    serviceDb.getReviews().then(setReviews);
  }, []);

  // 2. Watch Auth State Changes
  useEffect(() => {
    const unsubscribe = serviceAuth.onStateChanged((currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      
      if (currentUser) {
        // Sync cart & wishlist from database
        setWishlist(currentUser.wishlist || []);
        setCart(currentUser.cartItems || []);
        
        // Fetch User Orders
        serviceDb.getOrders().then((allOrders) => {
          const userOrders = allOrders.filter(o => o.userId === currentUser.uid);
          setOrders(userOrders);
        });

        // Trigger pending action if any
        if (pendingAction) {
          setTimeout(() => {
            pendingAction();
            setPendingAction(null);
          }, 100);
          setAuthModalOpen(false);
        }
      } else {
        setCart([]);
        setWishlist([]);
        setOrders([]);
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

  const logout = async () => {
    await serviceAuth.logout();
    triggerToast("Logged out successfully. See you again soon!", "info");
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
    const shipping = subtotal >= settings.freeShippingLimit || !settings.enableFreeShipping ? 0 : settings.standardShippingCharge;
    const totalAmount = subtotal + shipping;

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

    const orderData = {
      userId: user.uid,
      customerName: address.fullName,
      phone: address.phone,
      address: `${address.houseNumber}, ${address.street}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`,
      products: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.discountPrice,
        image: item.product.images[0],
        quantity: item.quantity
      })),
      amount: totalAmount,
      shippingCharge: shipping,
      estimatedDelivery: estDeliveryDate.toISOString(),
      paymentStatus: 'Paid', // Assuming secure instant payment
      orderStatus: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    const newOrderId = await serviceDb.createOrder(orderData);
    
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
    return newOrderId;
  };

  // Submit Review
  const addReview = async (productId: string, rating: number, comment: string, file: File | null) => {
    if (!user) throw new Error("Auth required to review products");

    let imageUrl = '';
    if (file) {
      imageUrl = await serviceStorage.uploadImage(file);
    }

    const reviewData = {
      productId,
      userId: user.uid,
      userName: user.fullName || user.displayName || 'Luxury Guest',
      rating,
      comment,
      image: imageUrl,
      approved: false,
      featured: false
    };

    await serviceDb.addReview(reviewData);
    triggerToast("✨ Review submitted for moderation! Thank you.", "success");
    
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
      toggleWishlist, moveToCart, placeOrder, addReview,
      adminAddProduct, adminEditProduct, adminDeleteProduct, adminUpdateOrderStatus,
      adminApproveReview, adminRejectReview, adminFeatureReview, adminUpdateSettings
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
