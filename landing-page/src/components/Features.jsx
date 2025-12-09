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
  <section className="flex flex-col gap-10 px-6 py-20 max-w-7xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white">Key Features</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((f) => (
        <div key={f.title} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-indigo-500/50 transition-colors">
          <h3 className="text-xl font-bold text-white">{f.title}</h3>
          <p className="text-slate-400 leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Features;
