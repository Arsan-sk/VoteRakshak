import React from "react";

const features = [
  {
    title: "Enhanced Security",
    desc: "Our decentralized system uses blockchain technology to provide unparalleled security against tampering and fraud."
  },
  {
    title: "Transparency",
    desc: "Every vote is recorded on the blockchain, allowing for complete transparency and auditability."
  },
  {
    title: "Accessibility",
    desc: "VoteChain is designed to be accessible to all, with a user-friendly interface and support for multiple languages."
  }
];

const Features = () => (
  <section className="flex flex-col gap-10 px-4 py-10">
    <h1 className="text-white text-[32px] font-bold">Key Features</h1>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
      {features.map((f) => (
        <div key={f.title} className="flex flex-col gap-3 rounded-lg border border-[#3d5245] bg-[#1c2620] p-4">
          <h2 className="text-white text-base font-bold">{f.title}</h2>
          <p className="text-[#9eb7a8] text-sm">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Features;
