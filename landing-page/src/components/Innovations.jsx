import React from "react";

const innovations = [
  {
    title: "Decentralized Ledger",
    desc: "No single entity controls voting data, reducing the risk of manipulation."
  },
  {
    title: "Advanced Encryption",
    desc: "We employ advanced encryption to protect voter privacy and ensure confidentiality."
  },
  {
    title: "User-Centric Design",
    desc: "Seamless and intuitive voting experience for everyone."
  }
];

const Innovations = () => (
  <section className="flex flex-col gap-10 px-6 py-20 bg-slate-900 border-y border-slate-800">
    <div className="max-w-7xl mx-auto w-full">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-10">Our Innovations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {innovations.map((i) => (
          <div key={i.title} className="p-6">
            <h3 className="text-xl font-bold text-indigo-400 mb-2">{i.title}</h3>
            <p className="text-slate-400">{i.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Innovations;
