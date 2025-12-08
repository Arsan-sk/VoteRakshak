import React from "react";

const Footer = () => (
  <footer className="flex justify-center bg-[#111714]">
    <div className="flex max-w-[960px] flex-1 flex-col text-center py-10">
      <div className="flex flex-wrap justify-center gap-6 mb-4">
        <a className="text-[#9eb7a8]" href="#">
          Privacy Policy
        </a>
        <a className="text-[#9eb7a8]" href="#">
          Terms of Service
        </a>
        <a className="text-[#9eb7a8]" href="#">
          Contact Us
        </a>
      </div>
      <p className="text-[#9eb7a8]">© 2024 VoteChain. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
