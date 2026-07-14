import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-900/60 bg-slate-950/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <span className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            FriendHub &copy; {new Date().getFullYear()}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Built with React, Express, MongoDB, and WebSockets. For invited circle only.
          </p>
        </div>
        <div className="flex gap-6 text-xs text-slate-400 font-medium">
          <Link to="/about" className="hover:text-indigo-400 transition-colors">
            About
          </Link>
          <Link to="/faq" className="hover:text-indigo-400 transition-colors">
            FAQ
          </Link>
          <Link to="/contact-admin" className="hover:text-indigo-400 transition-colors">
            Contact Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
