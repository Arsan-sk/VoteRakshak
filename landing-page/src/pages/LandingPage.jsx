import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Innovations from '../components/Innovations';
import BlockchainVisualizer from '../components/BlockchainVisualizer';
import Features from '../components/Features';
import Team from '../components/Team';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">

            <Header />

            <Hero />

            {/* Live Blockchain Section */}
            <div className="container mx-auto px-6 mb-24 -mt-10 relative z-20">
                <BlockchainVisualizer />
            </div>

            <Innovations />

            <Features />

            <Team />

            <Footer />
        </div>
    );
};

export default LandingPage;
