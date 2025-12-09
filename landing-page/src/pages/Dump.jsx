import React from "react";

const FindBooth = () => {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#111714] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* ---------------- Header ---------------- */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#29382f] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
            <div className="size-4">
              {/* Logo */}
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold">VoteChain</h2>
          </div>

          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a
                className="text-white text-sm font-medium"
                href="/find_booth.html"
              >
                Find Polling Booth
              </a>
              <a className="text-white text-sm font-medium" href="/profile.html">
                Profile
              </a>
              <a className="text-white text-sm font-medium" href="#">
                Team
              </a>
            </div>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-4 bg-[#38e07b] text-[#111714] text-sm font-bold">
              <span className="truncate">Get Started</span>
            </button>
          </div>
        </header>

        {/* ---------------- Hero Section ---------------- */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdsJgXxtYhX_deVjI9lBo7XQyxYHAe86y1CdaHe-K0urGw_pk32OO2IhPboHffAoduQarGK-36_7D2cEwc2nRxiubMXL9s3IiJS6Wp_Mxs26BpQRrtTj2C9M_k-zeo7IgtGW-WNVixBIrRuIhIoO1cB1F_MFUYBZ8E8QSJHHcIe4poqHWM2wNCGd35Pa2WLQak7kEUfT26gZdxuhiUbCmQS8lIVS4KvatLzY8I76_Ia4kJZqqV_xwZDHVRJESuYxAPMXuxcGk7voo9")',
                  }}
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-white text-4xl font-black @[480px]:text-5xl">
                      Secure and Transparent Voting with VoteChain
                    </h1>
                    <h2 className="text-white text-sm @[480px]:text-base">
                      Experience the future of decentralized voting with
                      VoteChain. Our platform ensures security, transparency,
                      and accessibility for all.
                    </h2>
                  </div>
                  <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#38e07b] text-[#111714] text-sm font-bold @[480px]:text-base">
                    <span className="truncate">Get Started</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ---------------- Features Section ---------------- */}
            <section className="flex flex-col gap-10 px-4 py-10">
              <div className="flex flex-col gap-4">
                <h1 className="text-white text-[32px] font-bold">
                  Key Features
                </h1>
                <p className="text-white text-base max-w-[720px]">
                  VoteChain offers a range of features designed to enhance the
                  voting experience and ensure the integrity of the process.
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
                {/* Feature 1 */}
                <div className="flex flex-col gap-3 rounded-lg border border-[#3d5245] bg-[#1c2620] p-4">
                  <h2 className="text-white text-base font-bold">
                    Enhanced Security
                  </h2>
                  <p className="text-[#9eb7a8] text-sm">
                    Our decentralized system uses blockchain technology to
                    provide unparalleled security against tampering and fraud.
                  </p>
                </div>
                {/* Feature 2 */}
                <div className="flex flex-col gap-3 rounded-lg border border-[#3d5245] bg-[#1c2620] p-4">
                  <h2 className="text-white text-base font-bold">
                    Transparency
                  </h2>
                  <p className="text-[#9eb7a8] text-sm">
                    Every vote is recorded on the blockchain, allowing for
                    complete transparency and auditability.
                  </p>
                </div>
                {/* Feature 3 */}
                <div className="flex flex-col gap-3 rounded-lg border border-[#3d5245] bg-[#1c2620] p-4">
                  <h2 className="text-white text-base font-bold">
                    Accessibility
                  </h2>
                  <p className="text-[#9eb7a8] text-sm">
                    VoteChain is designed to be accessible to all, with a
                    user-friendly interface and support for multiple languages.
                  </p>
                </div>
              </div>
            </section>

            {/* ---------------- Innovations Section ---------------- */}
            <section className="flex flex-col gap-10 px-4 py-10">
              <div className="flex flex-col gap-4">
                <h1 className="text-white text-[32px] font-bold">
                  Innovations
                </h1>
                <p className="text-white text-base max-w-[720px]">
                  VoteChain is at the forefront of innovation in the voting
                  industry, leveraging cutting-edge technologies to create a
                  more secure and efficient system.
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
                <div>
                  <p className="text-white text-base font-medium">
                    Decentralized Ledger
                  </p>
                  <p className="text-[#9eb7a8] text-sm">
                    Ensures no single entity controls voting data, reducing risk
                    of manipulation.
                  </p>
                </div>
                <div>
                  <p className="text-white text-base font-medium">
                    Advanced Encryption
                  </p>
                  <p className="text-[#9eb7a8] text-sm">
                    We employ advanced encryption to protect voter privacy and
                    ensure confidentiality of ballots.
                  </p>
                </div>
                <div>
                  <p className="text-white text-base font-medium">
                    User-Centric Design
                  </p>
                  <p className="text-[#9eb7a8] text-sm">
                    Seamless and intuitive voting experience for everyone.
                  </p>
                </div>
              </div>
            </section>

            {/* ---------------- Team Section ---------------- */}
            <section className="px-4 py-10">
              <h2 className="text-white text-[22px] font-bold pb-3">
                Meet the Team
              </h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
                {[
                  { name: "Ethan Carter", role: "CEO" },
                  { name: "Olivia Bennett", role: "CTO" },
                  { name: "Noah Thompson", role: "Head of Security" },
                ].map((member) => (
                  <div
                    key={member.name}
                    className="flex flex-col gap-3 text-center pb-3"
                  >
                    <div className="w-full aspect-square bg-gray-500 rounded-full" />
                    <div>
                      <p className="text-white text-base font-medium">
                        {member.name}
                      </p>
                      <p className="text-[#9eb7a8] text-sm">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ---------------- CTA Section ---------------- */}
            <section className="px-4 py-10 text-center">
              <h1 className="text-white text-[32px] font-bold">
                Ready to Vote with Confidence?
              </h1>
              <p className="text-white text-base">
                Join VoteChain today and be a part of the future of secure and
                transparent voting.
              </p>
              <div className="flex justify-center mt-6">
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-4 bg-[#38e07b] text-[#111714] text-sm font-bold">
                  <span className="truncate">Get Started</span>
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* ---------------- Footer ---------------- */}
        <footer className="flex justify-center">
          <div className="flex max-w-[960px] flex-1 flex-col">
            <footer className="flex flex-col gap-6 px-5 py-10 text-center">
              <div className="flex flex-wrap justify-center gap-6">
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
              <p className="text-[#9eb7a8]">
                © 2024 VoteChain. All rights reserved.
              </p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FindBooth;
