import React from 'react';
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { AppProvider } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Intro from '../components/Intro';
import Toast from '../components/Toast';
import AuthModal from '../components/AuthModal';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-[#F8F5F0] text-[#1A1A1A] antialiased flex flex-col min-h-screen">
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
              <path d="M17.472 14.382c-.022-.004-.378-.186-.438-.208-.06-.022-.104-.033-.148.033-.044.066-.17.208-.208.242-.038.033-.077.038-.143.004-.066-.033-1.047-.384-1.996-1.23-1.385-1.23-1.464-1.298-1.572-1.393-.108-.095-.011-.143.077-.23.078-.078.187-.218.232-.328.045-.109.022-.207-.011-.273-.033-.066-.333-.807-.456-1.107-.12-.294-.24-.254-.33-.258-.088-.004-.19-.004-.29-.004-.1-.004-.26.037-.395.186-.136.148-.52 5.09 0 10.18 5.1 4.2 8.685 5.594 12.552 6.837 3.868 1.242 4.12 1.033 4.887.962.77-.071 2.476-.713 2.825-1.4 3.49-1.933 2.825-3.565 2.766-3.837-.058-.273-.208-.438-.378-.523zm-5.467 6.136h-.008a9.49 9.49 0 0 1-4.814-1.313l-.346-.205-3.578.937.953-3.488-.225-.357A9.48 9.48 0 0 1 2.812 12c0-5.234 4.257-9.492 9.493-9.492a9.49 9.49 0 0 1 9.49 9.493c0 5.234-4.258 9.492-9.49 9.492zm8.583-11.23a11.383 11.383 0 0 0-17.186 0 11.383 11.383 0 0 0 0 16.082l-1.12 4.092 4.184-1.096a11.345 11.345 0 0 0 5.539 1.438h.005a11.382 11.382 0 0 0 11.38-11.384c0-3.04-1.18-5.9-3.32-8.046z" />
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
