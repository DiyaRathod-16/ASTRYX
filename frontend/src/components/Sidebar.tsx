import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  AlertTriangle, 
  UploadCloud, 
  Network, 
  Bell, 
  Map, 
  Shield, 
  FileText, 
  Settings, 
  Info,
  Zap
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Command Dashboard' },
    { path: '/incidents', icon: AlertTriangle, label: 'Incidents' },
    { path: '/upload', icon: UploadCloud, label: 'Upload Evidence' },
    { path: '/operations', icon: Network, label: 'Operations Console' },
    { path: '/alerts', icon: Bell, label: 'Alerts & Delivery' },
    { path: '/analytics', icon: Map, label: 'Global Analytics' },
    { path: '/verification', icon: Shield, label: 'Verification' },
    { path: '/audit-logs', icon: FileText, label: 'Audit Logs' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/about', icon: Info, label: 'About ASTRYX' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-gray-700 flex flex-col z-40">
      {/* Logo */}
      <div className="h-20 px-6 flex items-center border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-cyan-400 leading-tight">ASTRYX</h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider">VERSION 3.1</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path === '/incidents' && location.pathname.startsWith('/incident/'));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-cyan-500/20 text-white border-l-2 border-cyan-400'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
              <span className="text-sm font-medium truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-3 border-t border-gray-700">
        <div className="bg-green-900/50 border border-green-500 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-gray-300 font-medium uppercase tracking-wider">System Status</span>
          </div>
          <p className="text-sm text-green-400 font-semibold">All Systems Operational</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
