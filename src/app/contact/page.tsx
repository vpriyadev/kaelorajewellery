'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Phone, MessageSquare, Instagram, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { triggerToast } = useApp();

  // Contact Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      triggerToast("Please complete required contact details.", "error");
      return;
    }

    setSubmitting(true);
    // Simulate contact dispatch
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      triggerToast("✨ Message received! Our concierge will email you within 24 hours.", "success");
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  const supportDetails = [
    {
      title: 'Concierge WhatsApp',
      value: '+91 6305517109',
      desc: 'Online 24/7 for order tracking and styles.',
      href: 'https://wa.me/916305517109?text=Hello%20KAELORA%20Jewellery%2C%20I%27m%20interested%20in%20your%20jewellery%20collection.',
      icon: MessageSquare,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300'
    },
    {
      title: 'Hotline Assistance',
      value: '+91 6305517109',
      desc: 'Mon - Sat: 9:00 AM to 6:00 PM IST.',
      href: 'tel:+916305517109',
      icon: Phone,
      color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300'
    },
    {
      title: 'Customer Concierge Email',
      value: 'jashujash1107@gmail.com',
      desc: 'Receive replies within 12 business hours.',
      href: 'mailto:jashujash1107@gmail.com',
      icon: Mail,
      color: 'bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-300'
    },
    {
      title: 'Official Instagram',
      value: '@kaelora.jewellery',
      desc: 'Follow for catalog trends and giveaways.',
      href: 'https://www.instagram.com/kaelora.jewellery',
      icon: Instagram,
      color: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body text-[#1A1A1A]">
      
      {/* Title */}
      <div className="text-center mb-16">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Get In Touch</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1A1A1A] uppercase mt-1 tracking-wider">
          Contact Support
        </h1>
        <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start mb-16">
        
        {/* LEFT COLUMN: SUPPORT DETAILS CARDS */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-serif font-semibold uppercase tracking-widest text-[#1A1A1A] border-b border-[#EDE6DA] pb-3">
              Concierge Channels
            </h3>
            
            <div className="flex flex-col gap-4">
              {supportDetails.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-all duration-300 shadow-sm ${item.color}`}
                  >
                    <div className="p-2.5 bg-white rounded-xl shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">{item.title}</span>
                      <span className="font-bold text-xs mt-0.5 block truncate text-[#1A1A1A]">{item.value}</span>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">{item.desc}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Address */}
            <div className="border-t border-[#EDE6DA]/40 pt-4 mt-2 flex items-start gap-3.5 text-xs text-gray-500">
              <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <div>
                <span className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[10px]">Headquarters Location:</span>
                <p className="mt-1 leading-relaxed">
                  KAELORA Jewellery Store, <br />
                  Chittoor District, <br />
                  Andhra Pradesh, <br />
                  India - 517131
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTACT FORM SIMULATION */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#EDE6DA] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <h3 className="text-sm font-serif font-semibold uppercase tracking-widest text-[#1A1A1A] border-b border-gray-100 pb-3">
              Dispatched Support Request
            </h3>

            {submitted ? (
              <div className="text-center py-10 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col items-center gap-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                <div>
                  <h4 className="text-base font-bold text-emerald-800 uppercase tracking-wide">Message Submitted Successfully</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed mt-2 max-w-sm">
                    Thank you for reaching out! A ticket has been registered in our administrator dashboard. Our concierge will review details and reply to you shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-[#4B352A]">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-wider">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-wider">Your Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider">Subject Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Order Tracking Enquiry / Plating Warranty"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider">Message Description *</label>
                  <textarea
                    required
                    placeholder="Describe your inquiry details. E.g. order tracking parameters, bulk orders, size configurations..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="bg-gray-50 border border-[#EDE6DA] rounded-xl px-4 py-3 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] font-body resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-56 py-3.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
