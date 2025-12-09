import React from "react";
import { Link } from "react-router-dom";

const Hero = () => (
  <section className="px-40 flex justify-center py-5">
    <div className="flex flex-col max-w-[960px] flex-1">
      <div
        className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-4"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdsJgXxtYhX_deVjI9lBo7XQyxYHAe86y1CdaHe-K0urGw_pk32OO2IhPboHffAoduQarGK-36_7D2cEwc2nRxiubMXL9s3IiJS6Wp_Mxs26BpQRrtTj2C9M_k-zeo7IgtGW-WNVixBIrRuIhIoO1cB1F_MFUYBZ8E8QSJHHcIe4poqHWM2wNCGd35Pa2WLQak7kEUfT26gZdxuhiUbCmQS8lIVS4KvatLzY8I76_Ia4kJZqqV_xwZDHVRJESuYxAPMXuxcGk7voo9")',
        }}
      >
        <h1 className="text-white text-4xl font-black text-center">
          Secure and Transparent Voting with VoteChain
        </h1>
        <h2 className="text-white text-sm text-center max-w-[720px]">
          Experience the future of decentralized voting with VoteChain. Our
          platform ensures security, transparency, and accessibility for all.
        </h2>
        <Link to="/register" className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-4 bg-[#38e07b] text-[#111714] text-sm font-bold mt-4">
          Get Started
        </Link >
      </div>
    </div>
  </section>
);

export default Hero;
