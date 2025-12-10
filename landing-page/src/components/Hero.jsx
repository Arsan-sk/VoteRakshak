import React from 'react';
import { Users, Shield, LogIn, ExternalLink } from 'lucide-react';

const Hero = () => {
  const modules = [
    {
      title: "Voter Portal",
      description: "Secure biometric authentication for citizens to cast their votes.",
      icon: <Users className="w-6 h-6" />,
      link: "https://vote-rakshak.vercel.app/",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Officer Dashboard",
      description: "Administrative control for election officers to manage booths.",
      icon: <Shield className="w-6 h-6" />,
      link: "https://vote-rakshak-4yld.vercel.app/",
      color: "bg-indigo-600 hover:bg-indigo-700"
    },
    {
      title: "Polling Booth",
      description: "The secure terminal interface for the actual voting process.",
      icon: <LogIn className="w-6 h-6" />,
      link: "https://polling-booth-six.vercel.app/",
      color: "bg-emerald-600 hover:bg-emerald-700"
    }
  ];

  return (
    <div className="relative overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-blue-900/20 z-0"></div>
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-indigo-300">Live Election System</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
          VoteRakshak
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A Decentralized Biometric Voting System ensuring
          <span className="text-indigo-400 font-semibold"> Integrity</span>,
          <span className="text-indigo-400 font-semibold"> Transparency</span>, and
          <span className="text-indigo-400 font-semibold"> Trust</span>.
        </p>

        {/* Module Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {modules.map((mod, idx) => (
            <a
              key={idx}
              href={mod.link}
              target="_blank"
              rel="noreferrer"
              className={`group p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-slate-600 hover:-translate-y-1 block`}
            >
              <div className={`${mod.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-lg`}>
                {mod.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                {mod.title}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{mod.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
