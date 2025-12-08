import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
  <header className="flex items-center justify-between border-b border-[#29382f] px-10 py-3 bg-[#111714] text-white">
    <div className="flex items-center gap-4">
      <div className="size-4">
        {/* SVG logo */}
        <svg viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"></path>
          <path d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263Z"></path>
        </svg>
      </div>
      <Link to="/" className="text-lg font-bold">VoteChain</Link>
    </div>
    <nav className="flex gap-8">
      <Link to="/FindBooth" className="text-sm font-medium">Find Polling Booth</Link>
      <Link to="/register" className="text-sm font-medium">Register</Link>
      <Link to="/login" className="text-sm font-medium">Login</Link>
      <Link to="/profile" className="text-sm font-medium">Profile</Link>
      <Link to="/CastVote" className="text-sm font-medium">Cast Vote</Link>
    </nav>
    <Link className="bg-[#38e07b] text-[#111714] px-4 py-2 rounded-full font-bold" to="/register">
      Get Started
    </Link>
  </header>
);

export default Header;
