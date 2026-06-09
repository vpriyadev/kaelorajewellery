import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProvider } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Intro from '../components/Intro';
import Toast from '../components/Toast';
import AuthModal from '../components/AuthModal';
import './globals.css';



const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KAELORA Jewellery | Elegant • Affordable • Beautiful',
  description: 'Shop luxury fashion jewellery including earrings, chains and bangles suitable for daily wear, parties, and festive celebrations. Experience premium craftsmanship at affordable prices.',
  keywords: 'fashion jewellery, earrings, gold chains, designer bangles, luxury jewellery, daily wear jewellery, party jewellery, kaelora',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'KAELORA Jewellery | Elegant • Affordable • Beautiful',
    description: 'Shop luxury fashion jewellery including earrings, chains and bangles suitable for daily wear, parties, and festive celebrations. Experience premium craftsmanship at affordable prices.',
    images: [
      {
        url: '/images/logo-burgundy.jpg',
        width: 1200,
        height: 630,
        alt: 'KAELORA Jewellery - Elegance Trust Timeless',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KAELORA Jewellery',
    description: 'Elegant premium jewellery crafted to shine.',
    images: ['/images/logo-burgundy.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // WhatsApp Floating Button Action Message
  const whatsappUrl = `https://wa.me/916305517109?text=${encodeURIComponent(
    "Hello KAELORA Jewellery, I'm interested in your jewellery collection."
  )}`;

  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#F8F5F0] text-[#1A1A1A] antialiased flex flex-col min-h-screen font-sans">
        <AppProvider>
          {/* Cinematic Intro Animation Overlay */}
          <Intro />

          {/* Sticky Luxury Navbar */}
          <Navbar />

          {/* Toast Notification Container */}
          <Toast />

          {/* Global Auth Trigger Interceptor Modal */}
          <AuthModal />

          {/* Main Showcase Page Container */}
          <main className="flex-grow pt-24">
            {children}
          </main>

          {/* Global Floating WhatsApp Support Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-6 left-6 z-[999] flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full shadow-2xl hover:shadow-emerald-200/50 hover:rotate-6 transition-all duration-300 group"
            title="Chat on WhatsApp"
          >
            {/* WhatsApp Logo Icon */}
            <svg
              className="w-8 h-8 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.077 4.928A9.913 9.913 0 0 0 12.027 2c-5.46 0-9.902 4.443-9.902 9.903 0 1.748.457 3.45 1.321 4.952L2 22l5.25-.1.379.22c1.428.847 3.05 1.293 4.7 1.293h.004c5.46 0 9.902-4.443 9.902-9.903a9.852 9.852 0 0 0-2.879-7.073zm-7.05 15.353h-.003c-1.48 0-2.93-.397-4.2-1.148l-.3-.18-3.123.818.833-3.044-.197-.314a8.084 8.084 0 0 1-1.24-4.305c0-4.468 3.637-8.105 8.112-8.105 2.167 0 4.205.844 5.736 2.379a8.04 8.04 0 0 1 2.373 5.732c0 4.47-3.637 8.106-8.11 8.106zm4.448-6.07c-.244-.122-1.442-.712-1.666-.793-.223-.081-.385-.122-.547.122-.162.244-.627.793-.769.955-.142.162-.284.183-.528.061-.244-.122-1.029-.379-1.96-1.21-.724-.646-1.213-1.444-1.355-1.687-.142-.243-.015-.375.106-.496.11-.11.244-.285.366-.427.122-.142.163-.244.244-.407.081-.162.04-.305-.02-.427-.061-.122-.547-1.32-.75-1.81-.197-.477-.397-.412-.547-.42-.14-.007-.302-.008-.463-.008-.162 0-.427.061-.65.305-.224.244-.854.834-.854 2.035 0 1.201.874 2.36 1.004 2.533.11.152 1.706 2.597 4.14 3.647.578.249 1.032.399 1.385.511.58.184 1.11.158 1.528.096.467-.07 1.442-.589 1.646-1.159.203-.57.203-1.057.142-1.159-.06-.101-.223-.162-.467-.284z" />
            </svg>
            
            {/* Custom Tooltip text on hover */}
            <span className="absolute left-16 bg-[#1A1A1A] text-[#EDE6DA] text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl border border-gray-700 whitespace-nowrap">
              WhatsApp Support
            </span>
          </a>

          {/* Premium Detailed Footer */}
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
