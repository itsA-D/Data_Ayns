import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { datasetService, analyticsService } from '../services/api';
import BarChart from './BarChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import Header from './Header';
import FileUpload from './FileUpload';
import { Database, TrendingUp, Layers, DollarSign, Activity, ArrowUpRight, Plus, ExternalLink, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Atomic Components ---

const StatCard = ({ title, value, icon: Icon, color, trend, delay = 0 }) => {
    const colorClasses = {
        blue: 'text-blue-400',
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
        emerald: 'text-emerald-400',
        orange: 'text-orange-400',
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay }}
            className="glass-panel p-6 flex flex-col justify-between h-40 group overflow-hidden relative border-white/5 hover:border-white/10 transition-all shadow-xl shadow-black/20"
        >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full" />
            <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${colorClasses[color] || 'text-slate-400'} group-hover:scale-110 transition-transform shadow-inner`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1.5 rounded-lg border border-emerald-400/10 uppercase tracking-tighter">
                        <ArrowUpRight size={12} strokeWidth={3} />
                        {trend}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-[9px] uppercase tracking-[0.3em] font-black mb-1">{title}</p>
                <h3 className="text-3xl font-black text-white italic group-hover:translate-x-1 transition-transform tracking-tighter">{value}</h3>
            </div>
        </motion.div>
    );
};

const SemiCircleGauge = ({ percentage, color = "blue" }) => {
    const radius = 58;
    const circumference = Math.PI * radius;
    const [offset, setOffset] = useState(circumference);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOffset(circumference - (percentage / 100) * circumference);
        }, 100);
        return () => clearTimeout(timer);
    }, [percentage, circumference]);

    return (
        <div className="relative w-44 h-28 flex items-center justify-center">
            <svg className="w-44 h-44 absolute -bottom-8 overflow-visible left-0">
                <defs>
                    <linearGradient id={`${color}-gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color === 'blue' ? '#3b82f6' : '#8b5cf6'} />
                        <stop offset="100%" stopColor={color === 'blue' ? '#06b6d4' : '#d946ef'} />
                    </linearGradient>
                </defs>
                <circle
                    cx="88" cy="88" r={radius}
                    stroke="currentColor" strokeWidth="12"
                    fill="transparent"
                    className="text-white/5"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(180 88 88)"
                />
                <motion.circle
                    cx="88" cy="88" r={radius}
                    stroke={`url(#${color}-gradient)`}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${circumference} ${circumference}`}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    className={`glow-${color} drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]`}
                    transform="rotate(180 88 88)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 z-10 transition-transform hover:scale-105 duration-500">
                <p className="text-4xl font-black text-white tracking-tighter leading-none italic">{percentage}%</p>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mt-2">Efficiency</p>
            </div>
        </div>
    );
};

const LoadingPlaceholder = ({ text }) => (
    <div className="h-[300px] flex items-center justify-center text-slate-700 uppercase tracking-widest text-[10px] font-black animate-pulse">
        {text}
    </div>
);

const CloseIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);

// --- Composite Layout Components ---

const MetricsGrid = ({ summary, datasets, onUploadClick }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
            title="Total Records"
            value={summary?.total_records.toLocaleString() || '---'}
            icon={Database}
            color="blue"
            trend={12}
            delay={0.1}
        />
        <StatCard
            title="Aggregated Value"
            value={summary ? `$${summary.total_value.toLocaleString()}` : '---'}
            icon={DollarSign}
            color="cyan"
            trend={8.4}
            delay={0.2}
        />
        <StatCard
            title="Resource Pool"
            value={datasets.length}
            icon={Layers}
            color="purple"
            delay={0.3}
        />

        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/10 border-blue-500/20 flex flex-col justify-between group cursor-pointer hover:border-blue-500/40 transition-all shadow-xl shadow-blue-500/5"
            onClick={onUploadClick}
        >
            <div className="flex justify-between">
                <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                </div>
                <ExternalLink size={16} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div>
                <p className="text-white font-bold text-lg">Import Data</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-black">Expand Intelligence</p>
            </div>
        </motion.div>
    </div>
);

const VelocityPanel = ({ chartData }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="col-span-12 lg:col-span-8 glass-panel p-8 bg-[#0a101f]/40 border-white/5"
    >
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight uppercase italic">Growth Velocity</h3>
                <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mt-1 font-bold">Real-time performance metrics</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Baseline</span>
                </div>
            </div>
        </div>
        {chartData ? <LineChart data={chartData.line_chart} /> : <LoadingPlaceholder text="Awaiting Data Synchronization..." />}
    </motion.div>
);

const DistributionPanel = ({ chartData, chartType, setChartType, onReportClick }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="col-span-12 lg:col-span-4 glass-panel p-8 flex flex-col justify-between relative overflow-hidden group border-white/5 bg-[#0a101f]/40"
    >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-700 pointer-events-none">
            <TrendingUp size={160} />
        </div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight uppercase italic">Distribution</h3>
                <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mt-1 font-bold">Categorical weight mapping</p>
            </div>
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 relative z-10">
                {['bar', 'pie'].map(type => (
                    <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${chartType === type ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 py-10 min-h-[300px] relative z-10">
            {chartData ? (
                chartType === 'bar' ? <BarChart data={chartData.bar_chart} /> : <PieChart data={chartData.pie_chart} />
            ) : (
                <LoadingPlaceholder text="Parsing Dataset..." />
            )}
        </div>

        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                    <Activity size={18} />
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active Variance</p>
                    <p className="text-sm font-black text-white italic">+12.4%</p>
                </div>
            </div>
            <button
                onClick={onReportClick}
                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-[10px] font-black text-blue-400 rounded-lg uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/btn"
            >
                Full Report
                <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </div>
    </motion.div>
);

const SystemStatusPanel = ({ summary }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="col-span-12 lg:col-span-4 glass-panel p-8 flex flex-col justify-between border-white/5 bg-[#0a101f]/40 transition-all hover:bg-[#0a101f]/60"
    >
        <div>
            <h3 className="text-xl font-extrabold text-white mb-1 tracking-tight uppercase italic">JSON Participation</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-8 font-bold">Active system node status</p>
        </div>

        <div className="flex items-center justify-between mt-4">
            <div className="transform scale-110 origin-left">
                <SemiCircleGauge percentage={summary ? Math.min(100, (summary.total_records / 100) * 100).toFixed(0) : 0} color="blue" />
            </div>
            <div className="text-right pb-4">
                <p className="text-5xl font-black text-white italic tracking-tighter leading-none mb-2">
                    {summary ? `${summary.category_count}/${summary.total_records}` : '0/0'}
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em]">Density Index</p>
            </div>
        </div>
    </motion.div>
);

const MatrixStat = ({ value, label, color }) => {
    const colorClasses = {
        blue: 'group-hover:text-blue-400 bg-blue-500 shadow-blue-500/50',
        purple: 'group-hover:text-purple-400 bg-purple-500 shadow-purple-500/50',
        emerald: 'group-hover:text-emerald-400 bg-emerald-500 shadow-emerald-500/50',
    };

    return (
        <div className="group/stat">
            <p className={`text-3xl font-black text-white mb-2 italic transition-colors ${colorClasses[color].split(' ')[0]}`}>{value}</p>
            <div className={`h-1 w-8 mx-auto rounded-full mb-3 shadow-[0_0_8px] ${colorClasses[color].split(' ').slice(1).join(' ')}`} />
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{label}</p>
        </div>
    );
};

const AnalyticsMatrixPanel = ({ summary }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="col-span-12 lg:col-span-4 glass-panel p-8 flex flex-col justify-between border-white/5 bg-[#0a101f]/40 transition-all hover:bg-[#0a101f]/60"
    >
        <div>
            <h3 className="text-xl font-extrabold text-white mb-1 tracking-tight uppercase italic">Analytics Matrix</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-10 font-bold">Resource allocation metrics</p>
        </div>

        <div className="flex justify-between items-center text-center">
            <MatrixStat value={summary?.category_count || 0} label="Classes" color="blue" />
            <div className="h-12 w-[1px] bg-white/[0.05]" />
            <MatrixStat value={(summary?.avg_value || 0).toFixed(0)} label="Avg Val" color="purple" />
            <div className="h-12 w-[1px] bg-white/[0.05]" />
            <MatrixStat value={summary?.total_records || 0} label="Rows" color="emerald" />
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.03] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Optimization Active</span>
        </div>
    </motion.div>
);

const TierUpgradePanel = () => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="col-span-12 lg:col-span-4 glass-panel p-10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#1a2333] to-[#0a101f] border-blue-500/20 shadow-2xl shadow-blue-500/5 group"
    >
        <div className="absolute -bottom-10 -right-10 w-48 h-48 border-[24px] border-blue-500/[0.03] rounded-full group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative z-10">
            <h3 className="text-6xl font-black text-white italic tracking-tighter mb-6 uppercase">Tier</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Upgrade to <span className="text-white font-bold">VANGUARD TIER</span> for advanced neural analysis and exclusive cross-node metric synchronization.
            </p>
        </div>

        <div className="mt-10 relative z-10">
            <button className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-200 transition-all shadow-xl hover:scale-[1.02] active:scale-100">
                Upgrade Protocol
            </button>
        </div>
    </motion.div>
);

// --- Main Dashboard ---

const Dashboard = ({ onRefresh }) => {
    const navigate = useNavigate();
    const [datasets, setDatasets] = useState([]);
    const [selectedDatasetId, setSelectedDatasetId] = useState(null);
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [chartType, setChartType] = useState('bar');

    useEffect(() => {
        fetchDatasets();
    }, []);

    const fetchDatasets = async () => {
        try {
            const response = await datasetService.list();
            setDatasets(response.data.datasets);
            if (response.data.datasets.length > 0 && !selectedDatasetId) {
                setSelectedDatasetId(response.data.datasets[0].id);
            }
        } catch (err) {
            console.error('Error fetching datasets:', err);
        }
    };

    useEffect(() => {
        if (selectedDatasetId) {
            fetchAnalytics(selectedDatasetId);
        }
    }, [selectedDatasetId]);

    const fetchAnalytics = async (id) => {
        setLoading(true);
        try {
            analyticsService.getSummary(id).then(res => setSummary(res.data)).catch(err => console.error('Summary fetch failed:', err));
            analyticsService.getChartData(id).then(res => setChartData(res.data)).catch(err => console.error('Chart data fetch failed:', err));
        } catch (err) {
            console.error('Error starting analytics fetch:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedDatasetId && window.confirm('Permanently delete this dataset?')) {
            try {
                await datasetService.delete(selectedDatasetId);
                fetchDatasets();
                setSelectedDatasetId(null);
                setSummary(null);
                setChartData(null);
            } catch (err) {
                console.error('Error deleting dataset:', err);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col min-h-screen selection:bg-blue-500/30"
        >
            <Header
                datasets={datasets}
                selectedDatasetId={selectedDatasetId}
                onDatasetChange={setSelectedDatasetId}
                onDelete={handleDelete}
                loading={loading}
            />

            <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
                <MetricsGrid
                    summary={summary}
                    datasets={datasets}
                    onUploadClick={() => setShowUpload(true)}
                />

                <div className="dashboard-grid gap-6">
                    <VelocityPanel chartData={chartData} />

                    <DistributionPanel
                        chartData={chartData}
                        chartType={chartType}
                        setChartType={setChartType}
                        onReportClick={() => selectedDatasetId && navigate(`/report/${selectedDatasetId}`)}
                    />

                    <SystemStatusPanel summary={summary} />
                    <AnalyticsMatrixPanel summary={summary} />
                    <TierUpgradePanel />
                </div>
            </main>

            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-[#060912]/95 backdrop-blur-xl" onClick={() => setShowUpload(false)} />
                        <motion.div
                            initial={{ scale: 0.9, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 30, opacity: 0 }}
                            className="bg-[#0a101f] border border-white/10 p-10 rounded-[40px] w-full max-w-lg relative z-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-t-white/20"
                        >
                            <FileUpload onUploadSuccess={(data) => {
                                fetchDatasets();
                                setSelectedDatasetId(data.id);
                                setShowUpload(false);
                                onRefresh?.();
                            }} />
                            <button
                                onClick={() => setShowUpload(false)}
                                className="absolute top-8 right-8 p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all hover:bg-white/10"
                            >
                                <CloseIcon size={20} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Dashboard;
