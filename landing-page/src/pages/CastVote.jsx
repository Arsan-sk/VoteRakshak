import { useState } from "react";

const CastVote = () => {
  const [selectedParty, setSelectedParty] = useState("");
  const parties = [
    "Liberty Party",
    "Green Earth Alliance",
    "Progressive Coalition",
    "United Future Front",
  ];

  const handleVote = () => {
    if (!selectedParty) {
      alert("Please select a party before casting your vote!");
      return;
    }
    // Simulate vote submission
    alert(`You have successfully voted for ${selectedParty}`);
    setSelectedParty(""); // Reset selection
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#111714] dark group/design-root overflow-x-hidden"
      style={{
        "--radio-dot-svg":
          "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3ccircle cx=%278%27 cy=%278%27 r=%273%27/%3e%3c/svg%3e')",
        fontFamily: `"Spline Sans", "Noto Sans", sans-serif`,
      }}
    >
      <div className="layout-container flex h-full grow flex-col">

        {/* Voting Dashboard */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">
                Your Voting Dashboard
              </p>
            </div>

            {/* Voter Info */}
            <div className="flex p-4 @container">
              <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
                <div className="flex gap-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDLxQclvdCnFe-1SSqawEEVb00pRqqFYj1Hm7j4YzSIWwms_fUAhBGKa-e9x01iYS1uJ55WcztgEwEukmjV9XBzBu7IjyEJTaz_yg69jbGIc9r1__jmBKtsBZHznSBsrcvvmjq0AqnIh8BDA-dAPB1utz80FPn5tuKDc1HOdQFlOJu3Eu34RG52E3O6ZFGcuBTEWe5CpfxfTbF664PeKtOK_6-TIJaMVG3AaKXbdKEoiz9weFjdXAz0ivH5JZ3S4guUobVpKVEORYul")',
                    }}
                  ></div>
                  <div className="flex flex-col justify-center">
                    <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                      Alice Johnson
                    </p>
                    <p className="text-[#9eb7a8] text-base font-normal leading-normal">
                      Voter ID: 123456789
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Party Selection */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Select Your Party
            </h2>
            <div className="flex flex-col gap-3 p-4">
              {parties.map((party) => (
                <label
                  key={party}
                  className="flex items-center gap-4 rounded-xl border border-solid border-[#3d5245] p-[15px] cursor-pointer"
                >
                  <input
                    type="radio"
                    className="h-5 w-5 border-2 border-[#3d5245] bg-transparent text-transparent checked:border-white checked:bg-[image:--radio-dot-svg] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-white"
                    name="party"
                    value={party}
                    checked={selectedParty === party}
                    onChange={() => setSelectedParty(party)}
                  />
                  <div className="flex grow flex-col">
                    <p className="text-white text-sm font-medium leading-normal">{party}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Cast Vote Button */}
            <div className="flex px-4 py-3 justify-center">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#38e07b] text-[#111714] text-sm font-bold leading-normal tracking-[0.015em]"
                onClick={handleVote}
              >
                <span className="truncate">Scan Fingerprint to Cast Vote</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CastVote;
