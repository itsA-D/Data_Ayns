import React from 'react';
import { Layers, Search, Bell, User, ChevronDown, Trash2 } from 'lucide-react';

const Header = ({ datasets, selectedDatasetId, onDatasetChange, onDelete, loading }) => {
    const selectedDataset = datasets.find(d => d.id === selectedDatasetId);

    return (
        <header className="flex items-center justify-between px-8 py-6 sticky top-0 bg-[#060912]/80 backdrop-blur-xl z-[90] border-b border-white/[0.03]">
            <div className="flex items-center gap-12">
                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] mb-1">Insights Engine</h4>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-white">Select Dataset</h1>
                        {loading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
                    </div>
                </div>

                {/* Dataset Selection Icons (Style matching Network selection) */}
                <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 pr-2 border-r border-white/5 mr-2">
                        {datasets.slice(0, 5).map(ds => (
                            <button
                                key={ds.id}
                                onClick={() => onDatasetChange(ds.id)}
                                title={ds.name}
                                className={[
                                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                                    selectedDatasetId === ds.id
                                        ? 'bg-blue-600 text-white scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                ].join(' ')}
                            >
                                <Layers size={20} />
                            </button>
                        ))}

                        {datasets.length > 5 && (
                            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                                <ChevronDown size={18} />
                            </button>
                        )}
                    </div>

                    {/* Delete Toggle */}
                    {selectedDatasetId && (
                        <button
                            onClick={onDelete}
                            title="Delete current dataset"
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 group"
                        >
                            <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl w-64 focus-within:border-blue-500/50 transition-all">
                    <Search size={18} className="text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search metrics..."
                        className="bg-transparent border-none outline-none text-sm text-slate-300 placeholder:text-slate-600 w-full"
                    />
                </div>

                {/* Notifications */}
                <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#060912]" />
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-white">Administrator</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Power User</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-[1px]">
                        <div className="w-full h-full rounded-[11px] bg-[#0a0e1a] flex items-center justify-center">
                            <User size={20} className="text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
