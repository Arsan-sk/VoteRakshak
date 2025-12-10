import React from 'react';
import { Shield } from 'lucide-react';

const Header = () => (
  <header className="absolute top-0 left-0 right-0 z-50">
    <div className="container mx-auto px-6 py-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Shield className="w-8 h-8 text-indigo-400" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          VoteRakshak
        </span>
      </div>

      <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#innovations" className="hover:text-white transition-colors">Innovations</a>
        <a href="#team" className="hover:text-white transition-colors">Team</a>
      </nav>

      <a
        href="https://vote-rakshak.vercel.app/register"
        target="_blank"
        rel="noreferrer"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
      >
        Voter Login
      </a>
    </div>
  </header>
);

export default Header;
