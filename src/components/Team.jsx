import React from "react";

const team = [
  { name: "Ethan Carter", role: "CEO" },
  { name: "Olivia Bennett", role: "CTO" },
  { name: "Noah Thompson", role: "Head of Security" }
];

const Team = () => (
  <section className="px-4 py-10">
    <h2 className="text-white text-[22px] font-bold pb-3">Meet the Team</h2>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
      {team.map((m) => (
        <div key={m.name} className="flex flex-col gap-3 text-center pb-3">
          <div className="w-full aspect-square bg-gray-500 rounded-full" />
          <div>
            <p className="text-white text-base font-medium">{m.name}</p>
            <p className="text-[#9eb7a8] text-sm">{m.role}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Team;
