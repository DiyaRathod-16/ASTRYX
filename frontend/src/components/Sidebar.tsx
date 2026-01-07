import React, { useState } from 'react';
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
  Zap,
  Menu,
  X
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
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
              onClick={onItemClick}
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
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-gray-700 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <h1 className="text-lg font-bold text-cyan-400">ASTRYX</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-black border-r border-gray-700 flex flex-col z-50 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavContent onItemClick={() => setMobileMenuOpen(false)} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-gray-700 flex-col z-40">
        <NavContent />
      </aside>
    </>
  );
};

export default Sidebar;
