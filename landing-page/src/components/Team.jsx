import React from "react";

const team = [
  { name: "Ethan Carter", role: "CEO" },
  { name: "Olivia Bennett", role: "CTO" },
  { name: "Noah Thompson", role: "Head of Security" }
];

const Team = () => (
  <section className="px-6 py-20 max-w-7xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-12">Meet the Team</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {team.map((m, idx) => (
        <div key={m.name} className="flex flex-col items-center gap-4 text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="w-24 h-24 bg-slate-800 rounded-full overflow-hidden border-2 border-slate-700">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
              alt={m.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-white text-lg font-bold">{m.name}</p>
            <p className="text-indigo-400 text-sm font-medium">{m.role}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Team;
