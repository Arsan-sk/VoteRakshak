import React from "react";

const Footer = () => (
  <footer className="flex justify-center bg-slate-900 border-t border-slate-800 text-slate-400">
    <div className="flex max-w-5xl flex-1 flex-col text-center py-10">
      <div className="flex flex-wrap justify-center gap-6 mb-4 font-medium">
        <a className="hover:text-indigo-400 transition-colors" href="#">
          Privacy Policy
        </a>
        <a className="hover:text-indigo-400 transition-colors" href="#">
          Terms of Service
        </a>
        <a className="hover:text-indigo-400 transition-colors" href="#">
          Contact Us
        </a>
      </div>
      <p className="text-slate-500 text-sm">© 2024 VoteRakshak. Secured by Ethereum Blockchain.</p>
    </div>
  </footer>
);

export default Footer;
