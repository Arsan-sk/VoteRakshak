import React from 'react';
import { Shield, Users, LogIn, ExternalLink } from 'lucide-react';
import BlockchainVisualizer from '../components/BlockchainVisualizer';

const LandingPage = () => {
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
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-blue-900/20 z-0"></div>
                <div className="container mx-auto px-6 py-20 relative z-10 text-center">
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

            {/* Live Blockchain Visualizer */}
            <div className="container mx-auto px-6 mb-24">
                <BlockchainVisualizer />
            </div>

            {/* Team Section */}
            <div className="container mx-auto px-6 py-20 border-t border-slate-800">
                <h2 className="text-3xl font-bold text-center mb-12">Built by the Team</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="text-center group">
                            <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full mb-4 overflow-hidden border-2 border-slate-700 group-hover:border-indigo-500 transition-colors">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Developer${i}`}
                                    alt="Team Member"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h4 className="font-bold text-white">Developer {i}</h4>
                            <p className="text-sm text-slate-500">Core Contributor</p>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-900">
                © 2024 VoteRakshak. Secured by Ethereum Blockchain.
            </footer>
        </div>
    );
};

export default LandingPage;
