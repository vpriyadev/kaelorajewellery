import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc, serverTimestamp, onSnapshot, query } from 'firebase/firestore';

// Luxury Brand Initial Products Seed
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number;
  category: 'earrings' | 'chains' | 'bangles';
  images: Array<string | { url: string; public_id?: string }>;
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  wearType: 'daily' | 'casual' | 'party' | 'traditional' | 'festive';
  wearStyles?: string[];
  createdAt: string;
  sku?: string; // optional SKU for product code
  // New visibility fields
  showOnHome?: boolean;
  showInFeaturedCollections?: boolean;
  showInEarrings?: boolean;
  showInChains?: boolean;
  showInBangles?: boolean;
  showInTrending?: boolean;
  showInNewArrivals?: boolean;
  showInRecommended?: boolean;
  showInShopByCategory?: boolean;
  // Delivery settings
  deliveryFee?: number;
  freeDelivery?: boolean;
  // Manual specifications
  material?: string;
  style?: string;
  occasion?: string;
  weight?: string;
  availability?: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy field for backwards compatibility
  addressLine?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: any[];
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderStatus?: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  products?: any[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: 'cod' | 'online';
  paymentStatus: string;
  createdAt: string;
  cancelledBy?: { id: string; name?: string; role?: string };
  cancelledAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  image?: string;
  approved: boolean;
  featured: boolean;
  createdAt: string;
  editedAt?: string;
  adminReply?: string;
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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verify that we have a complete real config – if any key is missing we will error at build time
const isRealFirebase = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

let app;
let realAuth: any = null;
let realDb: any = null;

if (isRealFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    realAuth = getAuth(app);
    realDb = getFirestore(app);
    console.log('[Firebase] ✓ REAL Firebase initialized successfully', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket,
    });
  } catch (error) {
    console.error("[Firebase] ✗ Real Firebase failed to initialize, falling back to Simulator:", error);
    realAuth = null;
    realDb = null;
  }
} else {
  console.warn('[Firebase] ⚠ MISSING ENVIRONMENT VARIABLES - Using simulator mode', {
    apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
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
    const initialReviews: any[] = [];
    return this.getStorageItem('reviews', initialReviews);
  }

  saveReviews(reviews: any[]) {
    this.setStorageItem('reviews', reviews);
  }

  getSettings() {
    const defaultSettings = {
      freeShippingLimit: 299,
      standardShippingCharge: 19,
      enableFreeShipping: true,
      announcementText: "",
      storePhone: "+91 6305517109",
      whatsappNumber: "+91 6305517109",
      giftGoal: 3,
    };
    return this.getStorageItem('settings', defaultSettings);
  }

  getAddresses(uid: string): any[] {
    const allAddresses = this.getStorageItem('addresses', {});
    return allAddresses[uid] || [];
  }

  addAddress(uid: string, address: Address) {
    const allAddresses = this.getStorageItem('addresses', {});
    if (!allAddresses[uid]) {
      allAddresses[uid] = [];
    }
    allAddresses[uid].push(address);
    this.setStorageItem('addresses', allAddresses);
  }

  updateAddress(uid: string, addressId: string, updates: Partial<Address>) {
    const allAddresses = this.getStorageItem('addresses', {});
    if (allAddresses[uid]) {
      const index = allAddresses[uid].findIndex((a: Address) => a.id === addressId);
      if (index !== -1) {
        allAddresses[uid][index] = { ...allAddresses[uid][index], ...updates };
        this.setStorageItem('addresses', allAddresses);
      }
    }
  }

  deleteAddress(uid: string, addressId: string) {
    const allAddresses = this.getStorageItem('addresses', {});
    if (allAddresses[uid]) {
      allAddresses[uid] = allAddresses[uid].filter((a: Address) => a.id !== addressId);
      this.setStorageItem('addresses', allAddresses);
    }
  }

  saveSettings(settings: any) {
    this.setStorageItem('settings', settings);
  }

  getHeroBanner() {
    const settings = this.getStorageItem('settings', {
      freeShippingLimit: 299,
      standardShippingCharge: 19,
      enableFreeShipping: true,
      announcementText: "",
      storePhone: "+91 6305517109",
      whatsappNumber: "+91 6305517109",
      giftGoal: 3,
    });
    return settings.heroBanner || null;
  }

  saveHeroBanner(heroBanner: any) {
    const settings = this.getStorageItem('settings', {
      freeShippingLimit: 299,
      standardShippingCharge: 19,
      enableFreeShipping: true,
      announcementText: "",
      storePhone: "+91 6305517109",
      whatsappNumber: "+91 6305517109",
      giftGoal: 3,
    });
    settings.heroBanner = heroBanner;
    this.setStorageItem('settings', settings);
  }
}

export const dbSimulator = new DatabaseSimulator();

// Helper: Check if email is admin (fetch from Firestore settings)
async function isEmailAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  try {
    if (realDb) {
      const snap = await getDoc(doc(realDb, 'settings', 'admin_emails'));
      if (snap.exists()) {
        const data = snap.data() as any;
        const adminEmails: string[] = (data?.emails || data?.adminEmails || []).map((e: string) => e.toLowerCase());
        return adminEmails.includes(email.toLowerCase());
      }
    }

    // Firestore document missing or DB not available -> fallback to hardcoded admins
    const FALLBACK_ADMINS = [
      'vishnupriyareddy0711@gmail.com',
      'jashujash1107@gmail.com'
    ];
    return FALLBACK_ADMINS.includes(email.toLowerCase());
  } catch (error) {
    console.warn('[Firebase] Error checking admin status:', error);
    // On error, fall back to hardcoded admin emails
    const FALLBACK_ADMINS = [
      'vishnupriyareddy0711@gmail.com',
      'jashujash1107@gmail.com'
    ];
    return FALLBACK_ADMINS.includes(email.toLowerCase());
  }
}

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
              displayName: profile?.displayName || profile?.fullName || user.displayName || 'User',
              photoURL: profile?.photoURL || user.photoURL,
              ...profile
            });
          }).catch((error) => {
            console.error('[Firestore] Error fetching user profile after auth state change:', {
              uid: user.uid,
              errorCode: error.code,
              errorMessage: error.message,
              collection: 'users'
            });
            // Still callback with basic user info to prevent app freeze
            callback({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'User',
              photoURL: user.photoURL
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
      await sendEmailVerification(cred.user);
      
      // Check if email is admin
      const isAdmin = await isEmailAdmin(email);
      const userRole = isAdmin ? 'admin' : 'user';
      
      // Create user document in Firestore with Kaelora specific fields
      const userDoc = {
        uid: cred.user.uid,
        email: email,
        role: userRole,
        createdAt: serverTimestamp()
      };
      
      // Also save extended profile data
      const profile = {
        uid: cred.user.uid,
        email,
        fullName,
        phone: '',
        role: userRole,
        addressList: [],
        wishlist: [],
        cartItems: [],
        orders: [],
        rewardStatus: { totalItemsBought: 0, giftUnlocked: false },
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(realDb, 'users', cred.user.uid), profile);
      // set client cookie so server middleware can read role on subsequent requests
      if (typeof window !== 'undefined') {
        try {
          const session = { uid: cred.user.uid, email, displayName: fullName, role: userRole };
          document.cookie = `kaelora_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60*60*24*7}`;
        } catch (e) {}
      }
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
        role: "user",
        addressList: [],
        wishlist: [],
        cartItems: [],
        orders: [],
        rewardStatus: { totalItemsBought: 0, giftUnlocked: false },
        createdAt: new Date().toISOString()
      };
      users.push(profile);
      dbSimulator.saveUsers(users);
      
      const session = { uid: newUid, email, displayName: fullName, role: 'user' };
      localStorage.setItem('kaelora_session', JSON.stringify(session));
      if (typeof window !== 'undefined') {
        try { document.cookie = `kaelora_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60*60*24*7}`; } catch(e){}
      }
      if ((window as any).__triggerAuthSync) (window as any).__triggerAuthSync();
      return profile;
    }
  },

  login: async (email: string, password: string) => {
    if (realAuth && realDb) {
      const cred = await signInWithEmailAndPassword(realAuth, email, password);
      
      // Check if user document exists in Firestore
      const userDocRef = doc(realDb, 'users', cred.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      // If user document doesn't exist, create it
      if (!userDocSnap.exists()) {
        const isAdmin = await isEmailAdmin(email);
        const userDoc = {
          uid: cred.user.uid,
          email: cred.user.email,
          role: isAdmin ? "admin" : "user",
          createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, userDoc);
      } else {
        // Check if user needs admin role update
        const currentRole = (userDocSnap.data() as any).role;
        const isAdmin = await isEmailAdmin(email);
        if (isAdmin && currentRole !== 'admin') {
          await updateDoc(userDocRef, { role: 'admin' });
          console.log('[Firebase] Admin role updated for:', email);
        }
      }
      
      // ensure cookie contains role from user document
      try {
        const refreshed = await getDoc(userDocRef);
        const role = refreshed.exists() ? (refreshed.data() as any).role : 'user';
        if (typeof window !== 'undefined') {
          try {
            const session = { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName || '', role };
            document.cookie = `kaelora_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60*60*24*7}`;
          } catch (e) {}
        }
      } catch (e) {}

      return cred.user;
    } else {
      const users = dbSimulator.getUsers();
      // Pre-seed an admin account for test
      if (email === 'admin@kaelora.com' && password === 'admin123') {
        const adminSession = { uid: 'admin-uid', email: 'admin@kaelora.com', displayName: 'KAELORA Admin', role: 'admin', isAdmin: true };
        localStorage.setItem('kaelora_session', JSON.stringify(adminSession));
        if (typeof window !== 'undefined') {
          try { document.cookie = `kaelora_session=${encodeURIComponent(JSON.stringify(adminSession))}; path=/; max-age=${60*60*24*7}`; } catch(e){}
        }
        if ((window as any).__triggerAuthSync) (window as any).__triggerAuthSync();
        return adminSession;
      }
      
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error("User not found!");
      }
      // Simple passcheck (any pass works for simulator except admin check)
      const session = { uid: user.uid, email: user.email, displayName: user.fullName, role: user.role || 'user' };
      localStorage.setItem('kaelora_session', JSON.stringify(session));
      if (typeof window !== 'undefined') {
        try { document.cookie = `kaelora_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60*60*24*7}`; } catch(e){}
      }
      if ((window as any).__triggerAuthSync) (window as any).__triggerAuthSync();
      return user;
    }
  },

  googleLogin: async () => {
    if (!realAuth || !realDb) {
      throw new Error(
        "Google Sign-In requires Firebase credentials. Please configure NEXT_PUBLIC_FIREBASE_* environment variables."
      );
    }

    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(realAuth, provider);

      // Create or update user document in Firestore
      const docRef = doc(realDb, 'users', cred.user.uid);
      
      try {
        const docSnap = await getDoc(docRef);
        const isAdmin = await isEmailAdmin(cred.user.email || '');

        if (!docSnap.exists()) {
          // Create new user document with real Google account data
          const profile = {
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: cred.user.displayName,
            photoURL: cred.user.photoURL,
            role: isAdmin ? "admin" : "user",
            phone: '',
            addressList: [],
            wishlist: [],
            cartItems: [],
            orders: [],
            rewardStatus: { totalItemsBought: 0, giftUnlocked: false },
            createdAt: serverTimestamp()
          };
          try {
            await setDoc(docRef, profile);
            console.log('[Firestore] New user document created:', { uid: cred.user.uid, email: cred.user.email, role: profile.role });
          } catch (writeError: any) {
            console.error('[Firestore] Error creating user document:', {
              uid: cred.user.uid,
              errorCode: writeError.code,
              errorMessage: writeError.message,
              collection: 'users',
              operation: 'setDoc'
            });
            throw writeError;
          }
        } else {
          // Update existing user with latest Google profile info
          const currentRole = (docSnap.data() as any).role;
          const updateData: any = {
            displayName: cred.user.displayName,
            photoURL: cred.user.photoURL,
            lastLoginAt: serverTimestamp()
          };
          
          // Update role if needed
          if (isAdmin && currentRole !== 'admin') {
            updateData.role = 'admin';
            console.log('[Firebase] Admin role updated for:', cred.user.email);
          }
          
          try {
            await setDoc(docRef, updateData, { merge: true });
            console.log('[Firestore] Existing user document merged with latest Google profile:', { uid: cred.user.uid });
          } catch (updateError: any) {
            console.error('[Firestore] Error merging user document:', {
              uid: cred.user.uid,
              errorCode: updateError.code,
              errorMessage: updateError.message,
              collection: 'users',
              operation: 'setDoc(merge)'
            });
            throw updateError;
          }
        }
        // set cookie with final role from user document
        try {
          const finalSnap = await getDoc(docRef);
          const finalRole = finalSnap.exists() ? (finalSnap.data() as any).role : 'user';
          if (typeof window !== 'undefined') {
            try {
              const session = { uid: cred.user.uid, email: cred.user.email, displayName: (finalSnap.exists() ? (finalSnap.data() as any).displayName : cred.user.displayName) || '', role: finalRole };
              document.cookie = `kaelora_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60*60*24*7}`;
            } catch (e) {}
          }
        } catch (e) {}
      } catch (firestoreError: any) {
        console.error('[Firestore] Error in googleLogin - user document operation:', {
          uid: cred.user.uid,
          errorCode: firestoreError.code,
          errorMessage: firestoreError.message,
          collection: 'users'
        });
        throw firestoreError;
      }

      return cred.user;
    } catch (error: unknown) {
      const authError = error as { code?: string; message?: string };
      const errorCode = authError?.code;
      const errorMessage = authError?.message || String(error) || 'Google Sign-In failed.';

      console.error('[Auth] Google Sign-In failed:', {
        errorCode,
        errorMessage,
        error
      });

      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    if (realAuth) {
      await signOut(realAuth);
    }

    if (typeof window !== 'undefined') {
      try { localStorage.removeItem('kaelora_session'); } catch (e) {}
      try { document.cookie = 'kaelora_session=; path=/; max-age=0'; } catch (e) {}
      if ((window as any).__triggerAuthSync) {
        (window as any).__triggerAuthSync();
      }
    }
  }
};

export const serviceDb = {
  // User Profile methods
  getUserProfile: async (uid: string) => {
    if (!uid) return null;
    if (realDb) {
      try {
        const snap = await getDoc(doc(realDb, 'users', uid));
        if (snap.exists()) {
          return snap.data();
        }
        console.warn('[Firestore] User profile not found:', { uid, collection: 'users' });
        return null;
      } catch (error: any) {
        // Silently return null on auth errors (e.g., permission-denied after logout)
        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
          return null;
        }
        console.error('[Firestore] Error reading user profile:', {
          uid,
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'users',
          operation: 'getDoc'
        });
        throw error;
      }
    } else {
      const users = dbSimulator.getUsers();
      return users.find(u => u.uid === uid) || null;
    }
  },

  updateUserProfile: async (uid: string, data: any) => {
    if (realDb) {
      try {
        await setDoc(doc(realDb, 'users', uid), data, { merge: true });
        console.log('[Firestore] User profile set/merged:', { uid, collection: 'users' });
      } catch (error: any) {
        console.error('[Firestore] Error updating user profile:', {
          uid,
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'users',
          operation: 'updateDoc',
          fieldsAttempted: Object.keys(data)
        });
        throw error;
      }
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

  getAddresses: async (uid: string): Promise<Address[]> => {

    if (realDb) {
      try {
        const userRef = collection(realDb, `users/${uid}/addresses`);
        const q = query(userRef);
        const snapshot = await getDocs(q);
        const addresses = snapshot.docs.map(doc => ({ id: doc.id, userId: uid, ...doc.data() } as Address));
        console.log('[Firestore] Retrieved addresses:', { uid, count: addresses.length });
        return addresses;
      } catch (error: any) {
        // Silently return empty on auth errors (e.g., permission-denied after logout)
        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
          return [];
        }
        console.error('[Firestore] Error fetching addresses:', { uid, errorCode: error.code, errorMessage: error.message });
        return [];
      }
    } else {
      const addresses = dbSimulator.getAddresses(uid);
      console.log('[Simulator] Retrieved addresses:', { uid, count: addresses.length });
      return addresses;
    }
  },

  addAddress: async (uid: string, address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newAddress: Address = {
      id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: uid,
      ...address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (realDb) {
      try {
        await setDoc(doc(realDb, `users/${uid}/addresses/${newAddress.id}`), {
          ...newAddress,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('[Firestore] Address added:', { uid, addressId: newAddress.id });
        return newAddress;
      } catch (error: any) {
        console.error('[Firestore] Error adding address:', { uid, errorCode: error.code, errorMessage: error.message });
        throw error;
      }
    } else {
      dbSimulator.addAddress(uid, newAddress);
      console.log('[Simulator] Address added:', { uid, addressId: newAddress.id });
      return newAddress;
    }
  },

  updateAddress: async (uid: string, addressId: string, updates: Partial<Address>) => {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (realDb) {
      try {
        await setDoc(doc(realDb, `users/${uid}/addresses/${addressId}`), {
          ...updateData,
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log('[Firestore] Address updated:', { uid, addressId });
      } catch (error: any) {
        console.error('[Firestore] Error updating address:', { uid, addressId, errorCode: error.code, errorMessage: error.message });
        throw error;
      }
    } else {
      dbSimulator.updateAddress(uid, addressId, updateData);
      console.log('[Simulator] Address updated:', { uid, addressId });
    }
  },

  deleteAddress: async (uid: string, addressId: string) => {
    if (realDb) {
      try {
        await deleteDoc(doc(realDb, `users/${uid}/addresses/${addressId}`));
        console.log('[Firestore] Address deleted:', { uid, addressId });
      } catch (error: any) {
        console.error('[Firestore] Error deleting address:', { uid, addressId, errorCode: error.code, errorMessage: error.message });
        throw error;
      }
    } else {
      dbSimulator.deleteAddress(uid, addressId);
      console.log('[Simulator] Address deleted:', { uid, addressId });
    }
  },

  // Products CRUD
  getProducts: async (): Promise<Product[]> => {
    if (realDb) {
      try {
        const snap = await getDocs(collection(realDb, 'products'));
        const list: Product[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as Product);
        });
        console.log('[Firestore] Products loaded:', { count: list.length, collection: 'products' });
        return list.length > 0 ? list : INITIAL_PRODUCTS;
      } catch (error: any) {
        console.error('[Firestore] Error fetching products:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'products',
          operation: 'getDocs'
        });
        // Fallback to initial products on error
        return INITIAL_PRODUCTS;
      }
    } else {
      return dbSimulator.getProducts();
    }
  },

  // Real-time products listener. Returns unsubscribe function.
  onProductsChanged: (callback: (products: Product[]) => void) => {
    if (realDb) {
      try {
        const q = collection(realDb, 'products');
        const unsub = onSnapshot(q, (snap) => {
          const list: Product[] = [];
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Product));
          callback(list.length > 0 ? list : INITIAL_PRODUCTS);
        }, (error) => {
          console.error('[Firestore] onProductsChanged error:', {
            errorCode: (error as any).code,
            errorMessage: (error as any).message,
            collection: 'products',
            operation: 'onSnapshot'
          });
          // fallback to one-time fetch on error
          serviceDb.getProducts().then(products => callback(products));
        });
        return unsub;
      } catch (e) {
        console.error('[Firestore] Failed to attach onSnapshot:', e);
        // fallback to no-op
        return () => {};
      }
    } else {
      // Simulator: poll and listen to localStorage events. Return unsubscribe.
      const poll = () => callback(dbSimulator.getProducts());
      const interval = setInterval(poll, 2000);
      const onStorage = (e: StorageEvent) => {
        if (e.key && e.key.includes('kaelora_products')) poll();
      };
      if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
      // initial
      poll();
      return () => {
        clearInterval(interval);
        if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
      };
    }
  },

  addProduct: async (product: Omit<Product, 'id'>) => {
    // Ensure SKU is generated if not provided
    const generateSku = (p: Omit<Product, 'id'>) => {
      const source = p.name || p.category || '';
      const prefix = source.slice(0, 3).toUpperCase();
      const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();
      return `${prefix}-${suffix}`;
    };
    const productWithSku = { ...product, sku: product.sku ?? generateSku(product) };

    if (realDb) {
      try {
        const docRef = await addDoc(collection(realDb, 'products'), productWithSku);
        console.log('[Firestore] Product added:', { id: docRef.id, collection: 'products' });
        return docRef.id;
      } catch (error: any) {
        console.error('[Firestore] Error adding product:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'products',
          operation: 'addDoc'
        });
        throw error;
      }
    } else {
      const products = dbSimulator.getProducts();
      const newProduct = { ...productWithSku, id: 'prod-' + Math.random().toString(36).substr(2, 9) };
      products.push(newProduct);
      dbSimulator.saveProducts(products);
      return newProduct.id;
    }
  },

  updateProduct: async (id: string, data: Partial<Product>) => {
    if (realDb) {
      try {
        // If images are being updated, remove any Cloudinary images that were removed
        try {
          const existing = await getDoc(doc(realDb, 'products', id));
          const existingData = existing.data() as any;
          const oldImages: any[] = existingData?.images || [];
          const newImages: any[] = (data as any)?.images || oldImages;
          // Find removed images
          const removed = oldImages.filter(oi => !newImages.some(ni => {
            const oiId = typeof oi === 'string' ? null : oi?.public_id;
            const niId = typeof ni === 'string' ? null : ni?.public_id;
            return oi === ni || (oiId && niId && oiId === niId);
          }));
          for (const r of removed) {
            try {
              const public_id = typeof r === 'string' ? null : r?.public_id;
              if (public_id) {
                await fetch('/api/cloudinary/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ public_id }),
                });
              }
            } catch (e) {
              console.warn('Failed to cleanup removed image', e);
            }
          }
        } catch (e) {
          // Ignore errors in cleanup path
        }

        await setDoc(doc(realDb, 'products', id), data as any, { merge: true });
        console.log('[Firestore] Product set/merged:', { id, collection: 'products' });
      } catch (error: any) {
        console.error('[Firestore] Error updating product:', {
          id,
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'products',
          operation: 'updateDoc'
        });
        throw error;
      }
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
    if (realDb) {
      try {
        // First fetch product to remove associated Cloudinary images (if any)
        const pDoc = await getDoc(doc(realDb, 'products', id));
        const data = pDoc.data() as any;
        const imgs = data?.images || [];
        for (const img of imgs) {
          try {
            const public_id = typeof img === 'string' ? null : img?.public_id;
            if (public_id) {
              await fetch('/api/cloudinary/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ public_id }),
              });
            }
          } catch (innerErr) {
            console.warn('[Cloudinary] failed to delete image for product', id, innerErr);
          }
        }

        await deleteDoc(doc(realDb, 'products', id));
        console.log('[Firestore] Product deleted:', { id, collection: 'products' });
      } catch (error: any) {
        console.error('[Firestore] Error deleting product:', {
          id,
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'products',
          operation: 'deleteDoc'
        });
        throw error;
      }
    } else {
      const products = dbSimulator.getProducts();
      const filtered = products.filter(p => p.id !== id);
      dbSimulator.saveProducts(filtered);
    }
  },

  // Orders CRUD
  getOrders: async (uid?: string): Promise<any[]> => {

    if (realDb) {
      try {
        const snap = await getDocs(collection(realDb, 'orders'));
        const list: any[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (!uid || data.userId === uid) {
            list.push({ id: doc.id, ...data });
          }
        });
        console.log('[Firestore] Orders loaded:', { count: list.length, userId: uid || 'all', collection: 'orders' });
        return list;
      } catch (error: any) {
        // Silently return empty on auth errors (e.g., permission-denied after logout)
        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
          return [];
        }
        console.error('[Firestore] Error fetching orders:', {
          userId: uid,
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'orders',
          operation: 'getDocs'
        });
        // Return empty array on error to prevent app freeze
        return [];
      }
    } else {
      let orders = dbSimulator.getOrders();
      console.log('Orders fetched (simulator):', orders);
      console.log('Orders count (simulator):', orders.length);
      if (uid) {
        orders = orders.filter((o: any) => o.userId === uid);
      }
      return orders.map((o: any) => ({ ...o, id: o.id || o.orderId }));
    }
  },

  getUsers: async (): Promise<any[]> => {
    if (realDb) {
      try {
        const snap = await getDocs(collection(realDb, 'users'));
        const list: any[] = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        console.log('[Firestore] Users loaded:', { count: list.length, collection: 'users' });
        return list;
      } catch (error: any) {
        console.error('[Firestore] Error fetching users:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'users',
          operation: 'getDocs'
        });
        return [];
      }
    } else {
      return dbSimulator.getUsers();
    }
  },

  createOrder: async (order: any) => {
    if (realDb) {
      try {
        const docRef = await addDoc(collection(realDb, 'orders'), order);
        console.log('[Firestore] Order created:', { orderId: docRef.id, userId: order.userId, collection: 'orders' });
        return docRef.id;
      } catch (error: any) {
        console.error('[Firestore] Error creating order:', {
          userId: order.userId,
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'orders',
          operation: 'addDoc'
        });
        throw error;
      }
    } else {
      const orders = dbSimulator.getOrders();
      const orderId = 'KAEL-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder = { ...order, id: orderId, orderId };
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

  updateOrderStatus: async (orderId: string, newStatus: string, metadata?: any) => {
    const status = newStatus.toLowerCase();
    if (realDb) {
      try {
        const orderRef = doc(realDb, 'orders', orderId);
        const snap = await getDoc(orderRef);
        if (!snap.exists()) throw new Error('Order not found');
        
        const orderData = snap.data() as any;
        const currentStatus = (orderData.status || orderData.orderStatus || '').toLowerCase();
        
        if (currentStatus === status) {
          console.log('[Firestore] Status already set to', status, 'for order', orderId);
          return;
        }

        console.log("Admin Status Update", { orderId, from: currentStatus, to: status });
        const updatePayload: any = { lastUpdated: serverTimestamp(), status: status, orderStatus: status };
        if (status === 'shipped' && metadata?.trackingNumber) {
          updatePayload.trackingNumber = metadata.trackingNumber;
        }
        if (status === 'cancelled') {
          if (metadata?.cancelledBy) updatePayload.cancelledBy = metadata.cancelledBy;
          updatePayload.cancelledAt = serverTimestamp();
        }
        
        await setDoc(orderRef, updatePayload, { merge: true });
        console.log('[Firestore] Order status set/merged:', { orderId, status: status, collection: 'orders' });
console.log("ORDER STATUS UPDATED:", status);
console.log("EMAIL RECIPIENT:", orderData.email);

        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: status,
              customerName: orderData.customerName || orderData.fullName || '',
              customerEmail: orderData.email,
              orderId,
              amountPaid: orderData.totalAmount,
              products: orderData.products || orderData.items,
              shippingAddress: orderData.shippingAddress
            })
          });
          console.log('[Email] Notification sent for status:', status);
        } catch (emailErr) {
          console.error('[Email] Failed to send status update email:', emailErr);
        }
      } catch (error: any) {
        console.error("Firestore Status Update Error:", {
          code: error?.code,
          message: error?.message,
          orderId,
          status: status
        });
        throw error;
      }
    } else {
      const orders = dbSimulator.getOrders();
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        const existing = orders[idx];
        const currentStatus = (existing.status || existing.orderStatus || '').toLowerCase();
        
        if (currentStatus === status) {
          console.log('[Simulator] Status already set to', status, 'for order', orderId);
          return;
        }

        console.log("Admin Status Update", { orderId, from: currentStatus, to: status });
        const updated = {
          ...existing,
          status: status,
          orderStatus: status,
          ...(status === 'shipped' && metadata?.trackingNumber ? { trackingNumber: metadata.trackingNumber } : {}),
          ...(status === 'cancelled' ? { cancelledBy: metadata?.cancelledBy, cancelledAt: new Date().toISOString() } : {})
        };
        orders[idx] = updated;
        dbSimulator.saveOrders(orders);
        console.log('[Simulator] Order status updated:', { orderId, status: status });
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: status,
              customerName: updated.customerName || updated.fullName || '',
              customerEmail: updated.email,
              orderId,
              amountPaid: updated.totalAmount,
              products: updated.products || updated.items,
              shippingAddress: updated.shippingAddress
            })
          });
          console.log('[Email] Notification sent for status (simulator):', status);
        } catch (emailErr) {
          console.error('[Email] Failed to send status update email (simulator):', emailErr);
        }
      } else {
        throw new Error('Order not found in simulator');
      }
    }
  },

  // Reviews CRUD
  getReviews: async (): Promise<any[]> => {
    if (realDb) {
      try {
        const snap = await getDocs(collection(realDb, 'reviews'));
        const list: any[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        console.log('[Firestore] Reviews loaded:', { count: list.length, collection: 'reviews' });
        return list;
      } catch (error: any) {
        console.error('[Firestore] Error fetching reviews:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'reviews',
          operation: 'getDocs'
        });
        // Return empty array on error
        return [];
      }
    } else {
      return dbSimulator.getReviews();
    }
  },

  addReview: async (review: any) => {
    if (realDb) {
      try {
        const docRef = await addDoc(collection(realDb, 'reviews'), review);
        console.log('[Firestore] Review added:', { id: docRef.id, productId: review.productId, collection: 'reviews' });
        await serviceDb.recalculateProductRating(review.productId);
        return docRef.id;
      } catch (error: any) {
        console.error('[Firestore] Error adding review:', {
          productId: review.productId,
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'reviews',
          operation: 'addDoc'
        });
        throw error;
      }
    } else {
      const reviews = dbSimulator.getReviews();
      const newReview = { 
        ...review, 
        id: 'rev-' + Math.random().toString(36).substr(2, 9),
        approved: review.approved ?? true, // Default is approved to display instantly
        featured: review.featured ?? false,
        createdAt: review.createdAt || new Date().toISOString()
      };
      reviews.unshift(newReview);
      dbSimulator.saveReviews(reviews);
      await serviceDb.recalculateProductRating(review.productId);
      return newReview.id;
    }
  },

  approveReview: async (reviewId: string) => {
    let productId: string | undefined;
    if (realDb) {
      try {
        const snap = await getDoc(doc(realDb, 'reviews', reviewId));
        if (snap.exists()) productId = snap.data().productId;
        await setDoc(doc(realDb, 'reviews', reviewId), { approved: true }, { merge: true });
        console.log('[Firestore] Review set/merged as approved:', { reviewId, collection: 'reviews' });
        if (productId) await serviceDb.recalculateProductRating(productId);
      } catch (error: any) {
        console.error('[Firestore] Error approving review:', error);
        throw error;
      }
    } else {
      const reviews = dbSimulator.getReviews();
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index !== -1) {
        reviews[index].approved = true;
        productId = reviews[index].productId;
        dbSimulator.saveReviews(reviews);
        if (productId) await serviceDb.recalculateProductRating(productId);
      }
    }
  },

  rejectOrDeleteReview: async (reviewId: string) => {
    let productId: string | undefined;
    if (realDb) {
      try {
        const snap = await getDoc(doc(realDb, 'reviews', reviewId));
        if (snap.exists()) productId = snap.data().productId;
        await deleteDoc(doc(realDb, 'reviews', reviewId));
        console.log('[Firestore] Review deleted:', { reviewId, collection: 'reviews' });
        if (productId) await serviceDb.recalculateProductRating(productId);
      } catch (error: any) {
        console.error('[Firestore] Error deleting review:', error);
        throw error;
      }
    } else {
      const reviews = dbSimulator.getReviews();
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index !== -1) {
        productId = reviews[index].productId;
        const filtered = reviews.filter(r => r.id !== reviewId);
        dbSimulator.saveReviews(filtered);
        if (productId) await serviceDb.recalculateProductRating(productId);
      }
    }
  },

  updateReview: async (reviewId: string, data: any) => {
    let productId = data.productId;
    if (realDb) {
      try {
        if (!productId) {
          const snap = await getDoc(doc(realDb, 'reviews', reviewId));
          if (snap.exists()) productId = snap.data().productId;
        }
        await setDoc(doc(realDb, 'reviews', reviewId), data, { merge: true });
        console.log('[Firestore] Review updated:', { reviewId, collection: 'reviews' });
        if (productId) await serviceDb.recalculateProductRating(productId);
      } catch (error: any) {
        console.error('[Firestore] Error updating review:', error);
        throw error;
      }
    } else {
      const reviews = dbSimulator.getReviews();
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index !== -1) {
        reviews[index] = { ...reviews[index], ...data };
        productId = reviews[index].productId;
        dbSimulator.saveReviews(reviews);
        if (productId) await serviceDb.recalculateProductRating(productId);
      }
    }
  },

  recalculateProductRating: async (productId: string) => {
    try {
      const allReviews = await serviceDb.getReviews();
      // Only include approved reviews for the average rating
      const productReviews = allReviews.filter(r => r.productId === productId && r.approved);
      const reviewCount = productReviews.length;
      let rating = 0;
      if (reviewCount > 0) {
        const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
        rating = Number((total / reviewCount).toFixed(1));
      }
      
      if (realDb) {
        await setDoc(doc(realDb, 'products', productId), { rating, reviewCount }, { merge: true });
      } else {
        const products = dbSimulator.getProducts();
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
          products[index].rating = rating;
          products[index].reviewCount = reviewCount;
          dbSimulator.saveProducts(products);
        }
      }
    } catch (e) {
      console.error('[Firestore] Error recalculating product rating:', e);
    }
  },

  getStoreReviewStats: async () => {
    const allReviews = await serviceDb.getReviews();
    const approvedReviews = allReviews.filter(r => r.approved);
    const totalReviews = approvedReviews.length;
    let averageRating = 0;
    if (totalReviews > 0) {
      const total = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      averageRating = Number((total / totalReviews).toFixed(1));
    }
    return { totalReviews, averageRating };
  },

  featureReview: async (reviewId: string, feature: boolean) => {
    if (realDb) {
      try {
        await setDoc(doc(realDb, 'reviews', reviewId), { featured: feature }, { merge: true });
        console.log('[Firestore] Review set/merged featured flag:', { reviewId, featured: feature, collection: 'reviews' });
      } catch (error: any) {
        console.error('[Firestore] Error featuring review:', {
          reviewId,
          featured: feature,
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'reviews',
          operation: 'updateDoc'
        });
        throw error;
      }
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
      try {
        const snap = await getDoc(doc(realDb, 'settings', 'global'));
        const settings = snap.exists() ? snap.data() : dbSimulator.getSettings();
        console.log('[Firestore] Settings loaded:', { collection: 'settings' });
        return settings;
      } catch (error: any) {
        console.error('[Firestore] Error fetching settings:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'settings',
          operation: 'getDoc'
        });
        // Fallback to simulator settings on error
        return dbSimulator.getSettings();
      }
    } else {
      return dbSimulator.getSettings();
    }
  },

  updateSettings: async (settings: any) => {
    if (realDb) {
      try {
        await setDoc(doc(realDb, 'settings', 'global'), settings);
        console.log('[Firestore] Settings updated:', { collection: 'settings' });
      } catch (error: any) {
        console.error('[Firestore] Error updating settings:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'settings',
          operation: 'setDoc'
        });
        throw error;
      }
    } else {
      dbSimulator.saveSettings(settings);
    }
  },

  getHeroBanner: async () => {
    if (realDb) {
      try {
        const snap = await getDoc(doc(realDb, 'settings', 'heroBanner'));
        const heroBanner = snap.exists() ? snap.data() : null;
        console.log('[Firestore] Hero banner loaded:', { collection: 'settings/homepage/hero' });
        return heroBanner;
      } catch (error: any) {
        console.error('[Firestore] Error fetching hero banner:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'settings/homepage/hero',
          operation: 'getDoc'
        });
        return dbSimulator.getHeroBanner();
      }
    } else {
      return dbSimulator.getHeroBanner();
    }
  },

  updateHeroBanner: async (heroBanner: any) => {
    if (realDb) {
      try {
        await setDoc(doc(realDb, 'settings', 'heroBanner'), heroBanner);
        console.log('[Firestore] Hero banner updated:', { collection: 'settings/homepage/hero' });
      } catch (error: any) {
        console.error('[Firestore] Error updating hero banner:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'settings/homepage/hero',
          operation: 'setDoc'
        });
        throw error;
      }
    } else {
      dbSimulator.saveHeroBanner(heroBanner);
    }
  },

  onHeroBannerChanged: (callback: (banner: any) => void) => {
    if (realDb) {
      try {
        const unsub = onSnapshot(doc(realDb, 'settings','heroBanner'), (snap) => {
          const heroBanner = snap.exists() ? snap.data() : null;
          callback(heroBanner);
        }, (error) => {
          console.error('[Firestore] onHeroBannerChanged error:', {
            errorCode: (error as any).code,
            errorMessage: (error as any).message,
            collection: 'settings/homepage/hero',
            operation: 'onSnapshot'
          });
          serviceDb.getHeroBanner().then(callback).catch(() => callback(null));
        });
        return unsub;
      } catch (e) {
        console.error('[Firestore] Failed to attach hero banner snapshot listener:', e);
        return () => {};
      }
    } else {
      const poll = () => callback(dbSimulator.getHeroBanner());
      const interval = setInterval(poll, 2000);
      const onStorage = (e: StorageEvent) => {
        if (e.key && e.key.includes('kaelora_settings')) poll();
      };
      if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
      poll();
      return () => {
        clearInterval(interval);
        if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
      };
    }
  },

  // Admin Email Management
  getAdminEmails: async (): Promise<string[]> => {
    if (realDb) {
      try {
        const snap = await getDoc(doc(realDb, 'settings', 'admin_emails'));
        if (snap.exists()) {
          const data = snap.data() as any;
          return (data?.emails || data?.adminEmails || []).map((e: string) => e.toLowerCase());
        }
        return [];
      } catch (error: any) {
        console.error('[Firestore] Error fetching admin emails:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'settings'
        });
        return [];
      }
    } else {
      return [];
    }
  },

  updateAdminEmails: async (emails: string[]): Promise<void> => {
    if (realDb) {
      try {
        await setDoc(doc(realDb, 'settings', 'admin_emails'), { 
          emails: emails.map(e => e.toLowerCase()),
          updatedAt: serverTimestamp()
        });
        console.log('[Firestore] Admin emails updated:', { count: emails.length });
      } catch (error: any) {
        console.error('[Firestore] Error updating admin emails:', {
          errorCode: error.code,
          errorMessage: error.message,
          collection: 'settings'
        });
        throw error;
      }
    }
  },

  logEmailDelivery: async (logData: any) => {
    if (realDb) {
      try {
        await addDoc(collection(realDb, 'emailLogs'), {
          ...logData,
          createdAt: serverTimestamp()
        });
        console.log('[Firestore] Email log added');
      } catch (error) {
        console.error('[Firestore] Error adding email log:', error);
      }
    } else {
      console.log('[Simulator] Email log added', logData);
    }
  }
};
