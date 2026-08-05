import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="flex flex-col min-h-screen p-6 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Propel AI Operations
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="text-slate-300">Operator:</span> System Admin
          </div>
          <div className="p-2 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors">
            👤
          </div>
        </div>
      </header>
      
      <Dashboard />
    </div>
  );
}

export default App;
