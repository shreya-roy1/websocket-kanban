import React from "react";
import KanbanBoard from "./components/KanbanBoard";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden select-none">
      {/* Background glow ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Main Workspace Body */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <header className="flex items-center gap-3 py-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30">
              KB
            </div>
            <h1 className="text-sm font-bold tracking-wider text-slate-350 uppercase">
              CollabSpace Workspace
            </h1>
          </header>
        </div>
        <KanbanBoard />
      </main>
    </div>
  );
}

export default App;
