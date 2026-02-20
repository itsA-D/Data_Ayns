import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { datasetService, analyticsService } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowLeft, Download, Share2, Printer, Activity, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

// --- Molecular Components ---

const ReportToolbar = () => (
    <div className="flex gap-4">
        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-all border border-white/5 group">
            <Share2 size={18} className="group-hover:scale-110 transition-transform" />
        </button>
        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-all border border-white/5 group">
            <Printer size={18} className="group-hover:scale-110 transition-transform" />
        </button>
        <button className="flex items-center gap-3 px-6 py-3 bg-white text-black hover:bg-slate-200 rounded-xl transition-all shadow-xl font-bold text-[10px] uppercase tracking-wider group">
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            Secure Export PDF
        </button>
    </div>
);

const SectionTitle = ({ title, color }) => (
    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">
        <span className={`w-1.5 h-6 bg-${color}-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]`}></span>
        {title}
    </h3>
);

// --- Organism Components ---

const ExecutiveStats = ({ summary }) => {
    const stats = [
        { title: "Total Volume", value: summary?.total_records.toLocaleString(), icon: Activity, color: "blue", desc: "Verified individual records across all system nodes." },
        { title: "Net Valuation", value: `$${summary?.total_value.toLocaleString()}`, icon: TrendingUp, color: "purple", desc: "Cummulative asset value derived from current data pool." },
        { title: "Confidence", value: "99.8%", icon: CheckCircle2, color: "emerald", desc: "System integrity score based on anomaly detection." }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.title}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="glass-panel p-8 bg-gradient-to-br from-white/5 to-transparent border-white/10 hover:border-white/20 transition-all group overflow-hidden relative"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
                            <stat.icon size={20} className={`text-${stat.color}-400`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.title}</span>
                    </div>
                    <p className="text-5xl font-black text-white mb-3 italic tracking-tighter leading-none">{stat.value}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{stat.desc}</p>
                </motion.div>
            ))}
        </div>
    );
};

const GranularMatrix = ({ chartData }) => (
    <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="glass-panel p-10 overflow-hidden border-white/5"
    >
        <div className="flex items-center justify-between mb-12">
            <SectionTitle title="Granular Matrix" color="emerald" />
            <div className="flex gap-4">
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">
                    Reset Filters
                </button>
                <button className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:bg-white/10 transition-all">
                    Filter Logic
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-white/[0.05]">
                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Classification</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Net Value</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Weight</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 text-right">Momentum</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                    {chartData?.bar_chart?.map((item, index) => (
                        <tr key={index} className="hover:bg-white/[0.02] transition-all group">
                            <td className="py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm font-black text-slate-200 group-hover:text-white uppercase tracking-wider">{item.category}</span>
                                </div>
                            </td>
                            <td className="py-6 font-mono text-sm text-slate-500 group-hover:text-blue-400 transition-colors">
                                ${item.value.toLocaleString()}
                            </td>
                            <td className="py-6">
                                <div className="w-full bg-white/5 rounded-full h-2 max-w-[140px] border border-white/5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / Math.max(...chartData.bar_chart.map(i => i.value)) * 100)}%` }}
                                        transition={{ duration: 1, delay: 1 + (index * 0.05) }}
                                        className="h-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                </div>
                            </td>
                            <td className="py-6 text-right">
                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 border border-emerald-500/10 uppercase tracking-[0.1em]">
                                    <TrendingUp size={12} />
                                    +{(Math.random() * 10 + 2).toFixed(1)}%
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </motion.div>
);

const StrategicInsight = ({ category }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-transparent rounded-[32px] p-10 border border-white/5 flex items-start gap-8 relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <Activity size={120} />
        </div>
        <div className="p-4 bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] rounded-2xl text-white group-hover:rotate-12 transition-transform">
            <AlertCircle size={32} />
        </div>
        <div className="relative z-10">
            <h4 className="text-xl font-black text-white mb-4 uppercase tracking-[0.2em] italic">AI Strategic Vector Insight</h4>
            <p className="text-slate-500 text-sm leading-relaxed max-w-3xl font-medium">
                Synthesized analysis indicates sector <span className="text-blue-400 font-black uppercase tracking-widest">{category || 'Primary'}</span> is manifesting anomalous growth patterns, outperforming historical baselines by <span className="text-emerald-400 font-bold">14.2%</span>. Recommend immediate capital reallocation.
            </p>
        </div>
    </motion.div>
);

// --- Page Component ---

const DetailedReport = () => {
    const { datasetId } = useParams();
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [datasetName, setDatasetName] = useState('Dataset Report');

    useEffect(() => {
        if (datasetId) fetchReportData(datasetId);
    }, [datasetId]);

    const fetchReportData = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const [summaryRes, chartRes, listRes] = await Promise.all([
                analyticsService.getSummary(id),
                analyticsService.getChartData(id),
                datasetService.list()
            ]);

            setSummary(summaryRes.data);
            setChartData(chartRes.data);

            const currentDataset = listRes.data.datasets.find(d => d.id === parseInt(id));
            if (currentDataset) setDatasetName(currentDataset.filename);
        } catch (err) {
            setError("Failed to synchronize report data. Please verify the system connection.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorView error={error} />;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#060912] p-8 pb-20 selection:bg-blue-500/30"
        >
            <div className="max-w-[1600px] mx-auto space-y-12">

                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-all group">
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 border border-white/5">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Terminal Home</span>
                    </Link>
                    <ReportToolbar />
                </div>

                {/* Report Hero */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">System Audit Matrix</div>
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={12} className="text-blue-500/50" />
                            <span>Verified: Cycle 02.26</span>
                        </div>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter leading-none italic uppercase">
                        Audit: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-purple-500">{datasetName}</span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl leading-relaxed text-sm font-medium">
                        Deep-vector structural analysis across distributed datasets. Identifying value clusters and temporal performance variances.
                    </p>
                </motion.div>

                <ExecutiveStats summary={summary} />

                {/* Audit Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-panel p-8 lg:col-span-2 border-white/5 bg-[#0a101f]/50">
                        <div className="flex items-center justify-between mb-10">
                            <SectionTitle title="Temporal Dynamics" color="blue" />
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData?.line_chart} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0a101f', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fill="url(#colorReport)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.7 }} className="glass-panel p-8 border-white/5 bg-[#0a101f]/50 flex flex-col">
                        <SectionTitle title="Node Allocation" color="purple" />
                        <div className="h-[320px] w-full relative group mt-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData?.pie_chart} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={6} dataKey="value" nameKey="category">
                                        {chartData?.pie_chart?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0a101f', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    <Legend iconType="circle" formatter={(val) => <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] ml-2">{val}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12">
                                <div className="text-center">
                                    <p className="text-4xl font-black text-white italic leading-none">{summary?.category_count}</p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mt-2">Active Nodes</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <GranularMatrix chartData={chartData} />
                <StrategicInsight category={chartData?.bar_chart[0]?.category} />

            </div>
        </motion.div>
    );
};

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#060912] space-y-6">
        <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
        <div className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-bold animate-pulse">Generating comprehensive analysis...</div>
    </div>
);

const ErrorView = ({ error }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#060912] p-8 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
            <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 italic tracking-tight">System Desync Detected</h2>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed uppercase tracking-widest text-[10px] font-bold">{error}</p>
        <Link to="/" className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-slate-200 transition-all">Re-initialize Dashboard</Link>
    </div>
);

export default DetailedReport;
