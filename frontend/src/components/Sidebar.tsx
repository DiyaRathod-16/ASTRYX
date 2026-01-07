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
  X,
  MoreHorizontal
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', shortLabel: 'Home' },
    { path: '/incidents', icon: AlertTriangle, label: 'Incidents', shortLabel: 'Incidents' },
    { path: '/upload', icon: UploadCloud, label: 'Upload Evidence', shortLabel: 'Upload' },
    { path: '/operations', icon: Network, label: 'Operations Console', shortLabel: 'Operations' },
    { path: '/alerts', icon: Bell, label: 'Alerts & Delivery', shortLabel: 'Alerts' },
    { path: '/analytics', icon: Map, label: 'Global Analytics', shortLabel: 'Analytics' },
    { path: '/verification', icon: Shield, label: 'Verification', shortLabel: 'Verify' },
    { path: '/audit-logs', icon: FileText, label: 'Audit Logs', shortLabel: 'Logs' },
    { path: '/settings', icon: Settings, label: 'Settings', shortLabel: 'Settings' },
    { path: '/about', icon: Info, label: 'About ASTRYX', shortLabel: 'About' },
  ];

  // Bottom nav shows first 4 items + More
  const bottomNavItems = navItems.slice(0, 4);
  const moreNavItems = navItems.slice(4);

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/incidents' && location.pathname.startsWith('/incident/'));
  };

  return (
    <>
      {/* Mobile Header - Solid fixed position */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-black border-b border-gray-800 z-[100] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="text-lg font-bold text-cyan-400">ASTRYX</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-green-400 bg-green-500/20 px-2 py-1 rounded-full">● ONLINE</span>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Solid fixed, high z-index */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-gray-700 z-[100] flex items-center justify-around px-1">
        {bottomNavItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-all min-w-[56px] ${
                active
                  ? 'text-cyan-400 bg-cyan-500/15'
                  : 'text-gray-500'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-0.5 ${active ? 'text-cyan-400' : ''}`} />
              <span className="text-[9px] font-medium">{item.shortLabel}</span>
            </NavLink>
          );
        })}
        
        {/* More button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-all min-w-[56px] ${
            mobileMenuOpen || moreNavItems.some(item => isActive(item.path))
              ? 'text-cyan-400 bg-cyan-500/15'
              : 'text-gray-500'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-medium">More</span>
        </button>
      </nav>

      {/* Mobile More Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/90 z-[110]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile More Menu - Bottom Sheet */}
      <div className={`lg:hidden fixed left-0 right-0 bottom-0 bg-gray-900 border-t border-gray-600 rounded-t-2xl z-[120] transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="px-4 pb-6 grid grid-cols-4 gap-3">
          {moreNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6 mb-2" />
                <span className="text-[11px] font-medium text-center">{item.shortLabel}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-8">
          <div className="bg-gray-800/50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <div>
                <p className="text-sm text-white font-medium">System Status</p>
                <p className="text-xs text-green-400">All Systems Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-gray-700 flex-col z-40">
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
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-cyan-500/20 text-white border-l-2 border-cyan-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
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
    </>
  );
};

export default Sidebar;
