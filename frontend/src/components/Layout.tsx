import { Outlet, NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import clsx from 'clsx';
import {
  HomeIcon,
  MapIcon,
  CogIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  CircleStackIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useAnomalyStore, useNotificationStore } from '../stores';
import NotificationPanel from './NotificationPanel';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Global Map', href: '/map', icon: MapIcon },
  { name: 'Workflows', href: '/workflows', icon: ArrowPathIcon },
  { name: 'Data Sources', href: '/data-sources', icon: CircleStackIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { autonomousMode, setAutonomousMode } = useAnomalyStore();
  const { unreadCount } = useNotificationStore();

  const toggleAutonomousMode = () => {
    setAutonomousMode(!autonomousMode);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xl font-bold text-white">ASTRYX</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-800 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">ASTRYX</span>
                <p className="text-xs text-gray-500">Anomaly Detection</p>
              </div>
            </Link>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Autonomous Mode Toggle */}
          <div className="px-4 py-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Autonomous Mode</p>
                <p className="text-xs text-gray-500">AI-driven decisions</p>
              </div>
              <button
                onClick={toggleAutonomousMode}
                className={clsx(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                  autonomousMode ? 'bg-primary-500' : 'bg-gray-600'
                )}
              >
                <span
                  className={clsx(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    autonomousMode ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-700 bg-gray-800/95 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              {autonomousMode && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/20 rounded-full">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-primary-400">Autonomous Mode Active</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {notificationsOpen && (
                  <NotificationPanel onClose={() => setNotificationsOpen(false)} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
