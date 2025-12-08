import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Innovations from "../components/Innovations";
import Team from "../components/Team";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const Home = () => (
    <>
      <div
        className="flex flex-col min-h-screen bg-[#111714] overflow-x-hidden"
        style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}
      >

        {/* <Header /> */}
        <Hero />
        <Features />
        <Innovations />
        <Team />
        <CTA />
        <Footer />
    </div>
    </>
);

export default Home;
