import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, orderBy } from 'firebase/firestore';

// Luxury Brand Initial Products Seed
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number;
  category: 'earrings' | 'chains' | 'bangles';
  images: string[];
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  wearType: 'daily' | 'casual' | 'party' | 'traditional' | 'festive';
  createdAt: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  // EARRINGS
  {
    id: 'e1',
    name: 'Butterfly Earrings',
    slug: 'butterfly-earrings',
    description: 'Enchanting 18k rose gold plated butterfly design studded with AAA grade cubic zirconia. Extremely lightweight, allergen-free and designed for premium daily charm.',
    price: 1299,
    discountPrice: 799,
    category: 'earrings',
    images: ['/images/logo-burgundy.jpg', '/images/logo-burgundy.jpg'],
    stock: 25,
    featured: true,
    bestSeller: true,
    rating: 4.8,
    reviewCount: 14,
    wearType: 'daily',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e2',
    name: 'Pearl Drop Earrings',
    slug: 'pearl-drop-earrings',
    description: 'Timeless shell pearl drop earrings suspended from elegant champagne gold plated hooks. Ideal for classic evening wear and premium formal aesthetics.',
    price: 1599,
    discountPrice: 999,
    category: 'earrings',
    images: ['/images/logo-burgundy.jpg', '/images/logo-burgundy.jpg'],
    stock: 12,
    featured: true,
    bestSeller: false,
    rating: 4.9,
    reviewCount: 8,
    wearType: 'party',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e3',
    name: 'Floral Stud Earrings',
    slug: 'floral-stud-earrings',
    description: 'Delicate five-petal flower studs finished in premium matte gold plating. Featuring a sparkling solitaire core, perfect for casual styling.',
    price: 999,
    discountPrice: 599,
    category: 'earrings',
    images: ['/images/logo-burgundy.jpg'],
    stock: 30,
    featured: false,
    bestSeller: true,
    rating: 4.5,
    reviewCount: 22,
    wearType: 'casual',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e4',
    name: 'Crystal Hoop Earrings',
    slug: 'crystal-hoop-earrings',
    description: 'Modern champagne-gold micro-pave hoop earrings lined with dazzling multi-faceted crystals. Elevates your profile for celebrations and dinners.',
    price: 1899,
    discountPrice: 1299,
    category: 'earrings',
    images: ['/images/logo-burgundy.jpg'],
    stock: 8,
    featured: true,
    bestSeller: false,
    rating: 4.7,
    reviewCount: 5,
    wearType: 'festive',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e5',
    name: 'Hoop Earrings',
    slug: 'hoop-earrings',
    description: 'Sleek, hand-polished classic circular hoops crafted in hypoallergenic surgical steel plated with pure 18k yellow gold.',
    price: 899,
    discountPrice: 499,
    category: 'earrings',
    images: ['/images/logo-burgundy.jpg'],
    stock: 40,
    featured: false,
    bestSeller: false,
    rating: 4.6,
    reviewCount: 31,
    wearType: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e6',
    name: 'Heart Shape Earrings',
    slug: 'heart-shape-earrings',
    description: 'Expressive hollow heart drop earrings cast with a lustrous gold sheen. A romantic feminine accessory suitable for special dates.',
    price: 1199,
    discountPrice: 699,
    category: 'earrings',
    images: ['/images/logo-burgundy.jpg'],
    stock: 18,
    featured: false,
    bestSeller: false,
    rating: 4.4,
    reviewCount: 10,
    wearType: 'casual',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e7',
    name: 'Party Wear Earrings',
    slug: 'party-wear-earrings',
    description: 'Chandelier style shoulder-dusting party earrings with cascading golden chains and premium simulated diamonds. Made to turn heads.',
    price: 2499,
    discountPrice: 1699,
    category: 'earrings',
    images: ['/images/logo-burgundy.jpg'],
    stock: 5,
    featured: true,
    bestSeller: true,
    rating: 5.0,
    reviewCount: 16,
    wearType: 'party',
    createdAt: new Date().toISOString(),
  },

  // CHAINS
  {
    id: 'c1',
    name: 'Butterfly Pendant Chain',
    slug: 'butterfly-pendant-chain',
    description: 'A beautiful thin-link gold-plated collar chain displaying an intricate openwork butterfly focal charm. A soft feminine favorite.',
    price: 1499,
    discountPrice: 899,
    category: 'chains',
    images: ['/images/logo-burgundy.jpg', '/images/logo-burgundy.jpg'],
    stock: 15,
    featured: true,
    bestSeller: true,
    rating: 4.7,
    reviewCount: 18,
    wearType: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Layered Chain',
    slug: 'layered-chain',
    description: 'Elegant dual-layered gold-tone chain combining a flat herringbone choker structure with a delicate drop-bead station wire.',
    price: 1999,
    discountPrice: 1199,
    category: 'chains',
    images: ['/images/logo-burgundy.jpg'],
    stock: 22,
    featured: true,
    bestSeller: false,
    rating: 4.6,
    reviewCount: 9,
    wearType: 'casual',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    name: 'Heart Pendant Chain',
    slug: 'heart-pendant-chain',
    description: 'Polished 18k yellow gold-plated standard link chain featuring a tiny solid puffed heart slider charm. Elegant simplicity at its finest.',
    price: 1299,
    discountPrice: 749,
    category: 'chains',
    images: ['/images/logo-burgundy.jpg'],
    stock: 28,
    featured: false,
    bestSeller: true,
    rating: 4.8,
    reviewCount: 20,
    wearType: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c4',
    name: 'Pearl Chain',
    slug: 'pearl-chain',
    description: 'Graceful freshwater pearl station chain crafted in premium 925 sterling silver mesh and champagne plating. Matches standard dress designs.',
    price: 2199,
    discountPrice: 1499,
    category: 'chains',
    images: ['/images/logo-burgundy.jpg'],
    stock: 7,
    featured: true,
    bestSeller: false,
    rating: 4.9,
    reviewCount: 11,
    wearType: 'traditional',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c5',
    name: 'Stone Pendant Chain',
    slug: 'stone-pendant-chain',
    description: 'Luminous pear-cut emerald green crystal pendant suspended from a shimmering gold box link chain. Perfect for festive gatherings.',
    price: 1799,
    discountPrice: 1099,
    category: 'chains',
    images: ['/images/logo-burgundy.jpg'],
    stock: 14,
    featured: false,
    bestSeller: false,
    rating: 4.5,
    reviewCount: 6,
    wearType: 'festive',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c6',
    name: 'Daily Wear Chain',
    slug: 'daily-wear-chain',
    description: 'Ultra-thin, durable gold cable chain. Tarnish-free and water-resistant structure built to survive all daily chores.',
    price: 999,
    discountPrice: 599,
    category: 'chains',
    images: ['/images/logo-burgundy.jpg'],
    stock: 50,
    featured: false,
    bestSeller: false,
    rating: 4.4,
    reviewCount: 42,
    wearType: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c7',
    name: 'Fashion Chain',
    slug: 'fashion-chain',
    description: 'Edgy link collar-chain with textured oval loops and a toggle bar lock mechanism. Made for the modern bold woman.',
    price: 1599,
    discountPrice: 999,
    category: 'chains',
    images: ['/images/logo-burgundy.jpg'],
    stock: 11,
    featured: false,
    bestSeller: false,
    rating: 4.3,
    reviewCount: 7,
    wearType: 'casual',
    createdAt: new Date().toISOString(),
  },

  // BANGLES
  {
    id: 'b1',
    name: 'Floral Bangles',
    slug: 'floral-bangles',
    description: 'Set of two intricate openwork flower bangles showcasing champagne gold plating and white seed pearl accents. Traditional elegance.',
    price: 2299,
    discountPrice: 1399,
    category: 'bangles',
    images: ['/images/logo-burgundy.jpg', '/images/logo-burgundy.jpg'],
    stock: 10,
    featured: true,
    bestSeller: true,
    rating: 4.7,
    reviewCount: 15,
    wearType: 'traditional',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b2',
    name: 'Stone Bangles',
    slug: 'stone-bangles',
    description: 'Single thick luxury statement bangle studded with rows of round emerald and rubylith AAA baguettes. Adds instant sparkle.',
    price: 1999,
    discountPrice: 1299,
    category: 'bangles',
    images: ['/images/logo-burgundy.jpg'],
    stock: 9,
    featured: true,
    bestSeller: false,
    rating: 4.8,
    reviewCount: 12,
    wearType: 'party',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b3',
    name: 'Pearl Bangles',
    slug: 'pearl-bangles',
    description: 'Flexible stretch pearl strand wristlet styled with dynamic gold spacers and a small signature floral clasp. Extremely comfortable wear.',
    price: 1499,
    discountPrice: 899,
    category: 'bangles',
    images: ['/images/logo-burgundy.jpg'],
    stock: 20,
    featured: false,
    bestSeller: true,
    rating: 4.6,
    reviewCount: 18,
    wearType: 'casual',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b4',
    name: 'Party Wear Bangles',
    slug: 'party-wear-bangles',
    description: 'Dazzling high-sheen crystal pave open-cuff bracelet completed with two sparkling tear-drop teardrops. Fits all wrist sizes.',
    price: 2499,
    discountPrice: 1799,
    category: 'bangles',
    images: ['/images/logo-burgundy.jpg'],
    stock: 4,
    featured: true,
    bestSeller: false,
    rating: 4.9,
    reviewCount: 22,
    wearType: 'party',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b5',
    name: 'Traditional Bangles',
    slug: 'traditional-bangles',
    description: 'Broad golden temple-inspired filigree bangles lined with antique finishing. An exquisite pairing for festive silk sarees.',
    price: 2799,
    discountPrice: 1999,
    category: 'bangles',
    images: ['/images/logo-burgundy.jpg'],
    stock: 6,
    featured: false,
    bestSeller: false,
    rating: 4.9,
    reviewCount: 30,
    wearType: 'traditional',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b6',
    name: 'Daily Wear Bangles',
    slug: 'daily-wear-bangles',
    description: 'Set of 4 slender, high-polished seamless gold slip-on loops. Light, noiseless, and scratch-resistant design for regular schedules.',
    price: 1199,
    discountPrice: 699,
    category: 'bangles',
    images: ['/images/logo-burgundy.jpg'],
    stock: 35,
    featured: false,
    bestSeller: true,
    rating: 4.5,
    reviewCount: 25,
    wearType: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b7',
    name: 'Designer Bangles',
    slug: 'designer-bangles',
    description: 'Modern minimalist abstract wavy ribbon torque cuff crafted in heavy brass core and thick gold leaf overlay. Ultra-modern luxury.',
    price: 1899,
    discountPrice: 1199,
    category: 'bangles',
    images: ['/images/logo-burgundy.jpg'],
    stock: 13,
    featured: false,
    bestSeller: false,
    rating: 4.4,
    reviewCount: 8,
    wearType: 'casual',
    createdAt: new Date().toISOString(),
  },
];

// Firebase Web Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app-id"
};

// Check if credentials exist and are real
const isRealFirebase = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "mock-api-key";

let app;
let realAuth: any = null;
let realDb: any = null;

if (isRealFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    realAuth = getAuth(app);
    realDb = getFirestore(app);
  } catch (error) {
    console.warn("Real Firebase failed to initialize, falling back to Simulator:", error);
  }
}

// ----------------------------------------------------
// STATE SIMULATOR LAYER (Local Storage persistence)
// ----------------------------------------------------

class DatabaseSimulator {
  private getStorageItem(key: string, defaultValue: any) {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(`kaelora_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  }

  private setStorageItem(key: string, value: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`kaelora_${key}`, JSON.stringify(value));
  }

  // Collections
  getProducts(): Product[] {
    return this.getStorageItem('products', INITIAL_PRODUCTS);
  }

  saveProducts(products: Product[]) {
    this.setStorageItem('products', products);
  }

  getOrders(): any[] {
    return this.getStorageItem('orders', []);
  }

  saveOrders(orders: any[]) {
    this.setStorageItem('orders', orders);
  }

  getUsers(): any[] {
    return this.getStorageItem('users', []);
  }

  saveUsers(users: any[]) {
    this.setStorageItem('users', users);
  }

  getReviews(): any[] {
    // Initial Seed Reviews
    const initialReviews = [
      {
        id: 'rev1',
        productId: 'e1',
        userId: 'u1',
        userName: 'Priya Sharma',
        rating: 5,
        comment: 'Absolutely stunning! The butterfly earrings glow beautifully under sunlight. Extremely lightweight.',
        image: '/images/logo-burgundy.jpg',
        approved: true,
        featured: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'rev2',
        productId: 'e2',
        userId: 'u2',
        userName: 'Aishwarya Sen',
        rating: 5,
        comment: 'Wore it for my cousins sangeet. Highly premium pearl and gold shine, very elegant.',
        image: '',
        approved: true,
        featured: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    return this.getStorageItem('reviews', initialReviews);
  }

  saveReviews(reviews: any[]) {
    this.setStorageItem('reviews', reviews);
  }

  getSettings() {
    const defaultSettings = {
      freeShippingLimit: 400,
      standardShippingCharge: 50,
      enableFreeShipping: true,
      announcementText: "✨ Buy Any 3 Products & Receive A Complimentary Gift From KAELORA ✨",
      storePhone: "+91 6305517109",
      whatsappNumber: "+91 6305517109",
      giftGoal: 3,
    };
    return this.getStorageItem('settings', defaultSettings);
  }

  saveSettings(settings: any) {
    this.setStorageItem('settings', settings);
  }
}

export const dbSimulator = new DatabaseSimulator();

// ----------------------------------------------------
// DUAL-MODE SERVICE LAYER EXPORTS
// ----------------------------------------------------

export const serviceAuth = {
  // Triggers user state changes callback
  onStateChanged: (callback: (user: any) => void) => {
    if (realAuth) {
      return onAuthStateChanged(realAuth, (user) => {
        if (user) {
          // fetch user profile details
          serviceDb.getUserProfile(user.uid).then((profile) => {
            callback({
              uid: user.uid,
              email: user.email,
              displayName: profile?.fullName || user.displayName || 'Kaelora Guest',
              photoURL: user.photoURL,
              ...profile
            });
          });
        } else {
          callback(null);
        }
      });
    } else {
      // Local Storage auth observer simulator
      const pollAuth = () => {
        if (typeof window === 'undefined') return;
        const currentSession = localStorage.getItem('kaelora_session');
        if (currentSession) {
          const user = JSON.parse(currentSession);
          // fetch full profile details
          const users = dbSimulator.getUsers();
          const profile = users.find(u => u.uid === user.uid) || {};
          callback({ ...user, ...profile });
        } else {
          callback(null);
        }
      };
      
      pollAuth();
      // Setup window event to sync across tabs if needed
      window.addEventListener('storage', pollAuth);
      // Expose poll trigger for internal login/logout calls
      (window as any).__triggerAuthSync = pollAuth;
      
      return () => {
        window.removeEventListener('storage', pollAuth);
      };
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    if (realAuth && realDb) {
      const cred = await createUserWithEmailAndPassword(realAuth, email, password);
      // save profile doc in firestore
      const profile = {
        uid: cred.user.uid,
        fullName,
        email,
        phone: '',
        addressList: [],
        wishlist: [],
        cartItems: [],
        orders: [],
        rewardStatus: { totalItemsBought: 0, giftUnlocked: false },
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(realDb, 'users', cred.user.uid), profile);
      return { uid: cred.user.uid, email, fullName };
    } else {
      const users = dbSimulator.getUsers();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already registered!");
      }
      const newUid = 'sim-' + Math.random().toString(36).substr(2, 9);
      const profile = {
        uid: newUid,
        fullName,
        email,
        phone: '',
        addressList: [],
        wishlist: [],
        cartItems: [],
        orders: [],
        rewardStatus: { totalItemsBought: 0, giftUnlocked: false },
        createdAt: new Date().toISOString()
      };
      users.push(profile);
      dbSimulator.saveUsers(users);
      
      localStorage.setItem('kaelora_session', JSON.stringify({ uid: newUid, email, displayName: fullName }));
      if ((window as any).__triggerAuthSync) (window as any).__triggerAuthSync();
      return profile;
    }
  },

  login: async (email: string, password: string) => {
    if (realAuth) {
      const cred = await signInWithEmailAndPassword(realAuth, email, password);
      return cred.user;
    } else {
      const users = dbSimulator.getUsers();
      // Pre-seed an admin account for test
      if (email === 'admin@kaelora.com' && password === 'admin123') {
        const adminSession = { uid: 'admin-uid', email: 'admin@kaelora.com', displayName: 'KAELORA Admin', isAdmin: true };
        localStorage.setItem('kaelora_session', JSON.stringify(adminSession));
        if ((window as any).__triggerAuthSync) (window as any).__triggerAuthSync();
        return adminSession;
      }
      
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error("User not found!");
      }
      // Simple passcheck (any pass works for simulator except admin check)
      localStorage.setItem('kaelora_session', JSON.stringify({ uid: user.uid, email: user.email, displayName: user.fullName }));
      if ((window as any).__triggerAuthSync) (window as any).__triggerAuthSync();
      return user;
    }
  },

  googleLogin: async () => {
    if (realAuth) {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(realAuth, provider);
      // check if profile doc exists, else create it
      const docRef = doc(realDb, 'users', cred.user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const profile = {
          uid: cred.user.uid,
          fullName: cred.user.displayName || 'Google User',
          email: cred.user.email || '',
          phone: '',
          addressList: [],
          wishlist: [],
          cartItems: [],
          orders: [],
          rewardStatus: { totalItemsBought: 0, giftUnlocked: false },
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, profile);
      }
      return cred.user;
    } else {
      const newUid = 'google-' + Math.random().toString(36).substr(2, 9);
      const profile = {
        uid: newUid,
        fullName: 'Google Luxury Guest',
        email: 'guest@gmail.com',
        phone: '',
        addressList: [],
        wishlist: [],
        cartItems: [],
        orders: [],
        rewardStatus: { totalItemsBought: 0, giftUnlocked: false },
        createdAt: new Date().toISOString()
      };
      const users = dbSimulator.getUsers();
      users.push(profile);
      dbSimulator.saveUsers(users);
      
      localStorage.setItem('kaelora_session', JSON.stringify({ uid: newUid, email: profile.email, displayName: profile.fullName }));
      if ((window as any).__triggerAuthSync) (window as any).__triggerAuthSync();
      return profile;
    }
  },

  logout: async () => {
    if (realAuth) {
      await signOut(realAuth);
    } else {
      localStorage.removeItem('kaelora_session');
      if ((window as any).__triggerAuthSync) (window as any).__triggerAuthSync();
    }
  }
};

export const serviceDb = {
  // User Profile methods
  getUserProfile: async (uid: string) => {
    if (realDb) {
      const snap = await getDoc(doc(realDb, 'users', uid));
      return snap.exists() ? snap.data() : null;
    } else {
      const users = dbSimulator.getUsers();
      return users.find(u => u.uid === uid) || null;
    }
  },

  updateUserProfile: async (uid: string, data: any) => {
    if (realDb) {
      await updateDoc(doc(realDb, 'users', uid), data);
    } else {
      const users = dbSimulator.getUsers();
      const index = users.findIndex(u => u.uid === uid);
      if (index !== -1) {
        users[index] = { ...users[index], ...data };
        dbSimulator.saveUsers(users);
        if ((window as any).__triggerAuthSync) (window as any).__triggerAuthSync();
      }
    }
  },

  // Products CRUD
  getProducts: async (): Promise<Product[]> => {
    if (realDb) {
      const snap = await getDocs(collection(realDb, 'products'));
      const list: Product[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Product);
      });
      return list.length > 0 ? list : INITIAL_PRODUCTS;
    } else {
      return dbSimulator.getProducts();
    }
  },

  addProduct: async (product: Omit<Product, 'id'>) => {
    if (realDb) {
      const docRef = await addDoc(collection(realDb, 'products'), product);
      return docRef.id;
    } else {
      const products = dbSimulator.getProducts();
      const newProduct = { ...product, id: 'prod-' + Math.random().toString(36).substr(2, 9) };
      products.push(newProduct);
      dbSimulator.saveProducts(products);
      return newProduct.id;
    }
  },

  updateProduct: async (id: string, data: Partial<Product>) => {
    if (realDb) {
      await updateDoc(doc(realDb, 'products', id), data as any);
    } else {
      const products = dbSimulator.getProducts();
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...data };
        dbSimulator.saveProducts(products);
      }
    }
  },

  deleteProduct: async (id: string) => {
    // Delete in real or simulated
    if (realDb) {
      // In real firestore, delete doc logic
    } else {
      const products = dbSimulator.getProducts();
      const filtered = products.filter(p => p.id !== id);
      dbSimulator.saveProducts(filtered);
    }
  },

  // Orders CRUD
  getOrders: async (): Promise<any[]> => {
    if (realDb) {
      const snap = await getDocs(collection(realDb, 'orders'));
      const list: any[] = [];
      snap.forEach(doc => {
        list.push({ orderId: doc.id, ...doc.data() });
      });
      return list;
    } else {
      return dbSimulator.getOrders();
    }
  },

  createOrder: async (order: any) => {
    if (realDb) {
      const docRef = await addDoc(collection(realDb, 'orders'), order);
      return docRef.id;
    } else {
      const orders = dbSimulator.getOrders();
      const orderId = 'KAEL-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder = { ...order, orderId };
      orders.unshift(newOrder);
      dbSimulator.saveOrders(orders);
      
      // Update items bought reward
      const profile = await serviceDb.getUserProfile(order.userId);
      if (profile) {
        const currentCount = profile.rewardStatus?.totalItemsBought || 0;
        const newCount = currentCount + order.products.reduce((acc: number, p: any) => acc + p.quantity, 0);
        const giftUnlocked = newCount >= 3;
        await serviceDb.updateUserProfile(order.userId, {
          rewardStatus: {
            totalItemsBought: newCount,
            giftUnlocked
          }
        });
      }
      
      return orderId;
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    if (realDb) {
      await updateDoc(doc(realDb, 'orders', orderId), { orderStatus: status });
    } else {
      const orders = dbSimulator.getOrders();
      const index = orders.findIndex(o => o.orderId === orderId);
      if (index !== -1) {
        orders[index].orderStatus = status;
        dbSimulator.saveOrders(orders);
      }
    }
  },

  // Reviews CRUD
  getReviews: async (): Promise<any[]> => {
    if (realDb) {
      const snap = await getDocs(collection(realDb, 'reviews'));
      const list: any[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } else {
      return dbSimulator.getReviews();
    }
  },

  addReview: async (review: any) => {
    if (realDb) {
      await addDoc(collection(realDb, 'reviews'), review);
    } else {
      const reviews = dbSimulator.getReviews();
      const newReview = { 
        ...review, 
        id: 'rev-' + Math.random().toString(36).substr(2, 9),
        approved: false, // Default is pending moderation
        featured: false,
        createdAt: new Date().toISOString()
      };
      reviews.unshift(newReview);
      dbSimulator.saveReviews(reviews);
    }
  },

  approveReview: async (reviewId: string) => {
    if (realDb) {
      await updateDoc(doc(realDb, 'reviews', reviewId), { approved: true });
    } else {
      const reviews = dbSimulator.getReviews();
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index !== -1) {
        reviews[index].approved = true;
        dbSimulator.saveReviews(reviews);
      }
    }
  },

  rejectOrDeleteReview: async (reviewId: string) => {
    if (realDb) {
      // In real firestore, delete doc logic
    } else {
      const reviews = dbSimulator.getReviews();
      const filtered = reviews.filter(r => r.id !== reviewId);
      dbSimulator.saveReviews(filtered);
    }
  },

  featureReview: async (reviewId: string, feature: boolean) => {
    if (realDb) {
      await updateDoc(doc(realDb, 'reviews', reviewId), { featured: feature });
    } else {
      const reviews = dbSimulator.getReviews();
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index !== -1) {
        reviews[index].featured = feature;
        dbSimulator.saveReviews(reviews);
      }
    }
  },

  // Settings CRUD
  getSettings: async () => {
    if (realDb) {
      const snap = await getDoc(doc(realDb, 'settings', 'global'));
      return snap.exists() ? snap.data() : dbSimulator.getSettings();
    } else {
      return dbSimulator.getSettings();
    }
  },

  updateSettings: async (settings: any) => {
    if (realDb) {
      await setDoc(doc(realDb, 'settings', 'global'), settings);
    } else {
      dbSimulator.saveSettings(settings);
    }
  }
};

export const serviceStorage = {
  uploadImage: async (file: File): Promise<string> => {
    // Simulator reads the file as base64 string
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
