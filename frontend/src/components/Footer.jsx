import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';

const Footer = () => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const categories = ['Fashion', 'Mobiles', 'Electronics', 'Beauty', 'Home', 'Books', 'Furniture'];

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400">
      
      {/* Top Banner: Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 border-b border-slate-800">
        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-3xl p-6 sm:p-10 border border-slate-700/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Stay in the Loop</h3>
            <p className="text-xs sm:text-sm text-slate-300">Subscribe to our newsletter for exclusive offers and product releases.</p>
          </div>
          
          <form onSubmit={handleSubscribeSubmit} className="w-full max-w-md">
            {subscribed ? (
              <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-800 text-emerald-400 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold animate-in zoom-in-95 duration-200">
                <CheckCircle2 size={18} />
                Awesome! You have successfully subscribed to R Prime!
              </div>
            ) : (
              <div className="relative flex items-center">
                <input 
                  type="email" 
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-slate-950/60 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-2xl py-3 pl-4 pr-24 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                />
                <button 
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] sm:text-xs rounded-xl px-4 flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Subscribe
                  <Send size={12} />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Middle Grid: Site Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        
        {/* Brand Information */}
        <div className="space-y-4 col-span-1 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-white font-black text-sm shadow-md shadow-blue-500/10 group-hover:scale-105 group-hover:shadow-indigo-500/20 transition-all duration-300">
              R
            </span>
            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              Prime
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Discover a premium shopping experience. We offer high-quality catalog selections, secure transactions, and dedicated support for every customer.
          </p>
          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            {/* Facebook */}
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors text-slate-400">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            {/* Twitter */}
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors text-slate-400">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-700 hover:text-white flex items-center justify-center transition-colors text-slate-400">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/* Categories Shop */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Shop Collections</h4>
          <ul className="space-y-2 text-xs">
            {categories.map((c) => (
              <li key={c}>
                <Link to={`/category/${c}`} className="hover:text-white hover:underline transition-colors block py-0.5">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Assistance */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Customer Help</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/dashboard" className="hover:text-white hover:underline transition-colors block py-0.5">Track Order Status</Link></li>
            <li><Link to="/cart" className="hover:text-white hover:underline transition-colors block py-0.5">View Shopping Cart</Link></li>
            <li><a href="#" className="hover:text-white hover:underline transition-colors block py-0.5">Easy Return Policies</a></li>
            <li><a href="#" className="hover:text-white hover:underline transition-colors block py-0.5">Frequently Asked Questions</a></li>
            <li><a href="#" className="hover:text-white hover:underline transition-colors block py-0.5">Privacy Policies & T&C</a></li>
          </ul>
        </div>

        {/* Location & Support Details */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Contact & Address</h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-2.5">
              <MapPin size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <span>100 Connaught Place, Block C, New Delhi, 110001, India</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={14} className="text-blue-500 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={14} className="text-blue-500 flex-shrink-0" />
              <span>support@rprime-platform.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar: Copyright & Payment Security */}
      <div className="bg-slate-950/80 py-6 border-t border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} R Prime Platform. All rights reserved. Created with absolute visual excellence.
          </p>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              PCI-DSS 256-bit Secure
            </span>
            <div className="flex items-center gap-1.5 text-slate-700 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-lg">
              <CreditCard size={12} />
              <span className="text-[9px] uppercase tracking-wider font-extrabold">Stripe Verified</span>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
