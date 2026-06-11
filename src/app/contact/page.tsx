'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Phone, MessageSquare, Instagram, MapPin, Loader2, CheckCircle2, Facebook } from 'lucide-react';

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
      iconColor: 'text-[#25D366]'
    },
    {
      title: 'Official Facebook',
      value: 'Kaelora Jewellery',
      desc: 'Message us for orders and enquiries.',
      href: 'https://www.facebook.com/profile.php?id=61590032346143',
      icon: Facebook,
      iconColor: 'text-[#1877F2]'
    },
    {
      title: 'Customer Concierge Email',
      value: 'jashujash1107@gmail.com',
      desc: 'Receive replies within 12 business hours.',
      href: 'mailto:concierge@kaelorajewellery.com',
      icon: Mail,
      iconColor: 'text-[#C9A84C]'
    },
    {
      title: 'Official Instagram',
      value: '@kaelora.jewellery',
      desc: 'Follow for catalog trends and giveaways.',
      href: 'https://www.instagram.com/kaelora.jewellery',
      icon: Instagram,
      iconColor: 'text-[#E1306C]'
    }
  ];

  return (
    <div className="min-h-dvh max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 font-body text-[#1A1A1A]">
      
      {/* Title */}
      <div className="text-center py-16 mb-4">
        <span className="font-body font-normal text-xs tracking-[0.3em] uppercase text-[#C9A84C]">Get In Touch</span>
        <h1 className="font-display font-light text-4xl tracking-[0.15em] text-[#1A1A1A] mt-2">
          Contact Support
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
        
        {/* LEFT COLUMN: SUPPORT DETAILS CARDS */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-[#EDE6DA] rounded-2xl p-8 shadow-sm flex flex-col gap-4">
            <h3 className="font-body font-medium text-xs tracking-[0.25em] uppercase text-[#1A1A1A]/60 border-b border-[#EDE6DA] pb-3">
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
                    className="p-4 rounded-2xl border border-[#EDE6DA] bg-white text-left flex items-start gap-4 transition-colors duration-200"
                  >
                    <div className="mt-0.5">
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-body font-medium text-xs tracking-[0.2em] uppercase text-[#4B352A] block">{item.title}</span>
                      <span className="font-jakarta font-normal text-sm text-[#1A1A1A] tracking-wide block mt-1">{item.value}</span>
                      <p className="font-jakarta font-normal text-xs text-neutral-400 tracking-wide normal-case mt-1 leading-normal">{item.desc}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Address */}
            <div className="border-t border-[#EDE6DA] pt-4 mt-2 flex items-start gap-4 text-xs text-gray-500">
              <MapPin className="w-5 h-5 text-[#C9A84C] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-body font-normal text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A]/70">Headquarters Location:</span>
                <p className="mt-1 font-body font-normal text-sm text-[#1A1A1A] tracking-wide leading-relaxed">
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
          <div className="bg-white border border-[#EDE6DA] rounded-2xl p-8 shadow-sm flex flex-col gap-6">
            <h3 className="font-body font-medium text-xs tracking-[0.25em] uppercase text-[#1A1A1A]/60 border-b border-[#EDE6DA] pb-3">
              Dispatched Support Request
            </h3>

            {submitted ? (
              <div className="text-center py-10 bg-white border border-[#EDE6DA] rounded-2xl p-6 flex flex-col items-center gap-4">
                <CheckCircle2 className="w-12 h-12 text-[#C9A84C]" />
                <div>
                  <h4 className="font-body font-medium text-sm tracking-[0.2em] uppercase text-[#4B352A]">Message Submitted Successfully</h4>
                  <p className="font-body font-normal text-sm text-neutral-400 tracking-wide leading-relaxed mt-2 max-w-sm">
                    Thank you for reaching out! A ticket has been registered in our administrator dashboard. Our concierge will review details and reply to you shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1A1A] text-white text-xs font-body font-normal tracking-[0.25em] uppercase rounded-full hover:bg-[#2A2A2A] transition-colors duration-200 flex items-center justify-center gap-2 mt-2"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-[#4B352A]">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="font-body font-normal text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A]/70">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent border border-[#EDE6DA] rounded-xl px-4 py-3 font-jakarta font-normal text-sm text-[#1A1A1A] placeholder-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-body font-normal text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A]/70">Your Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border border-[#EDE6DA] rounded-xl px-4 py-3 font-jakarta font-normal text-sm text-[#1A1A1A] placeholder-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-body font-normal text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A]/70">Subject Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="What can we help you with?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-transparent border border-[#EDE6DA] rounded-xl px-4 py-3 font-jakarta font-normal text-sm text-[#1A1A1A] placeholder-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-body font-normal text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A]/70">Message Description *</label>
                  <textarea
                    required
                    placeholder="Tell us how we can assist you today"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="bg-transparent border border-[#EDE6DA] rounded-xl px-4 py-3 font-jakarta font-normal text-sm text-[#1A1A1A] placeholder-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors resize-y"
                  />
                </div>

                <button type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#1A1A1A] text-white text-xs font-body font-normal tracking-[0.25em] uppercase rounded-full hover:bg-[#2A2A2A] transition-colors duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Send Message</span>
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
