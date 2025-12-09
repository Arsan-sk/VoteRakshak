import React from "react";

const CTA = () => (
  <section className="px-6 py-20 text-center bg-gradient-to-b from-slate-900 to-slate-950">
    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
      Ready to Vote with Confidence?
    </h2>
    <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
      Join VoteRakshak today and be a part of the future of secure and transparent voting.
    </p>
    <div className="flex justify-center">
      <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-full h-12 px-8 bg-indigo-600 text-white text-base font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25">
        Get Started
      </a>
    </div>
  </section>
);

export default CTA;
