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
  <section className="flex flex-col gap-10 px-4 py-10">
    <h1 className="text-white text-[32px] font-bold">Innovations</h1>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
      {innovations.map((i) => (
        <div key={i.title}>
          <p className="text-white text-base font-medium">{i.title}</p>
          <p className="text-[#9eb7a8] text-sm">{i.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Innovations;
