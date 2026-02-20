import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DetailedReport from './components/DetailedReport';

function App() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <BrowserRouter>
            <div className="flex w-full min-h-screen bg-[#060912] selection:bg-blue-500/30">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Wrapper */}
                <div className="flex-1 flex flex-col min-w-0">
                    <Routes>
                        <Route path="/" element={<Dashboard key={refreshKey} onRefresh={() => setRefreshKey(prev => prev + 1)} />} />
                        <Route path="/report/:datasetId" element={<DetailedReport />} />
                    </Routes>

                    {/* Global Footer (Subtle) */}
                    <footer className="px-8 py-6 border-t border-white/[0.02] mt-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 opacity-30 hover:opacity-100 transition-opacity duration-500">
                            <p className="text-[10px] uppercase tracking-widest font-medium text-slate-400">
                                &copy; 2026 Data Anys • Premium Analytics Dashboard
                            </p>
                            <div className="flex items-center gap-6">
                                <a href="#" className="text-[10px] uppercase tracking-widest font-medium text-slate-400 hover:text-blue-400 transition-colors">Privacy</a>
                                <a href="#" className="text-[10px] uppercase tracking-widest font-medium text-slate-400 hover:text-blue-400 transition-colors">Terms</a>
                                <a href="#" className="text-[10px] uppercase tracking-widest font-medium text-slate-400 hover:text-blue-400 transition-colors">Support</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
