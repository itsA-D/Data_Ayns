import React from 'react';
import {
    Home,
    Users,
    BarChart2,
    Wallet,
    Shield,
    Settings,
    LogOut,
    LayoutGrid
} from 'lucide-react';

import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, active = false, label }) => (
    <div className={`
    p-4 cursor-pointer transition-all duration-500 rounded-2xl group relative mb-4
    ${active ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] border border-blue-500/20' : 'text-slate-600 hover:text-slate-300 hover:bg-white/5 border border-transparent'}
  `}>
        <Icon size={22} className={active ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'group-hover:scale-110 transition-transform'} />

        {/* Tooltip */}
        <span className="absolute left-full ml-6 px-3 py-2 bg-[#0a101f] text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-[200] pointer-events-none border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
            {label}
        </span>

        {active && (
            <motion.div
                layoutId="activeIndicator"
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,1)]"
            />
        )}
    </div>
);

const Sidebar = () => {
    return (
        <motion.aside
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="w-20 lg:w-24 bg-[#060912] border-r border-white/[0.03] flex flex-col items-center py-10 sticky top-0 h-screen z-[100] shadow-[10px_0_50px_rgba(0,0,0,0.5)]"
        >
            {/* Logo */}
            <div className="mb-14 relative group cursor-pointer">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(59,130,246,0.4)] relative z-10 hover:rotate-12 transition-transform duration-500">
                    <Shield className="text-white" size={24} strokeWidth={2.5} />
                </div>
            </div>

            {/* Nav Items */}
            <div className="flex flex-col flex-1">
                <SidebarItem icon={Home} active label="Terminal Home" />
                <SidebarItem icon={LayoutGrid} label="Node Clusters" />
                <SidebarItem icon={Users} label="Auth Matrix" />
                <SidebarItem icon={BarChart2} label="Vector Analytics" />
                <SidebarItem icon={Wallet} label="Net Valuation" />
                <SidebarItem icon={Settings} label="Core Config" />
            </div>

            {/* Logout */}
            <div className="mt-auto pt-6 border-t border-white/[0.03] w-full flex flex-col items-center">
                <SidebarItem icon={LogOut} label="Terminate Session" />
            </div>
        </motion.aside>
    );
};

export default Sidebar;
