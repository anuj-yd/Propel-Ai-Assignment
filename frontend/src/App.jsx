import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-500 font-mono">
          <h1 className="text-2xl font-bold mb-4">React App Crashed</h1>
          <pre className="bg-red-950 p-4 rounded-lg">{this.state.error?.toString()}</pre>
          <pre className="bg-red-950 p-4 rounded-lg mt-4 text-sm">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
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
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
