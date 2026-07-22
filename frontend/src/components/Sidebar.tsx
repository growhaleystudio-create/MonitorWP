import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Plug,
  Terminal,
  Settings,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function Sidebar({ onLogout, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Sites', to: '/sites', icon: Globe },
    { name: 'Plugins', to: '/plugins', icon: Plug },
    { name: 'Logs', to: '/logs', icon: Terminal },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed top-0 left-0 right-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" className="h-6 w-6 shrink-0" alt="Growhaley Logo" />
          <span className="font-bold text-[13px] tracking-tight text-slate-800 dark:text-slate-100 uppercase">Growhaley WP</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#f8fafc] dark:bg-[#0f172a] border-r border-slate-200/80 dark:border-slate-800/80 py-4 px-3 flex flex-col justify-between transform transition-all duration-300 md:translate-x-0 ${
          isOpen ? 'w-56 translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-16 md:px-2' : 'md:w-56 md:px-3'}`}
      >
        <div className="flex flex-col gap-5">
          {/* Logo / Brand Header */}
          <div className={`flex items-center py-1 ${isCollapsed ? 'md:justify-center' : 'gap-2.5 px-2'}`}>
            <img src="/logo.svg" className="h-7 w-7 shrink-0" alt="Growhaley Logo" />
            <div className={isCollapsed ? 'md:hidden' : ''}>
              <h1 className="font-bold text-[14px] tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                Growhaley WP
              </h1>
              <span className="text-[9px] font-bold text-primary-teal uppercase tracking-wider mt-0.5 block">
                Monitor v1.0.0
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center transition-all duration-150 relative group ${
                    isCollapsed 
                      ? 'md:w-10 md:h-10 md:justify-center md:mx-auto w-full gap-2.5 px-3 py-2' 
                      : 'w-full gap-2.5 px-3 py-2'
                  } rounded-lg text-[13px] ${
                    isActive
                      ? 'bg-primary-teal text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={isCollapsed ? 'md:hidden' : ''}>{item.name}</span>

                {/* Collapsed Tooltip (Desktop only) */}
                {isCollapsed && (
                  <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User / Collapse / Logout */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-3 flex flex-col gap-2">
          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className={`hidden md:flex items-center justify-center gap-2 rounded-lg text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition ${
              isCollapsed ? 'w-10 h-10 mx-auto py-2' : 'w-full px-3 py-1.5'
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* User Profile Info */}
          <div className={`flex items-center ${isCollapsed ? 'md:justify-center' : 'gap-2.5 px-2 py-1'}`}>
            <div className="h-7 w-7 rounded-full bg-primary-teal/10 flex items-center justify-center font-bold text-primary-teal text-[11px] border border-primary-teal/20 shrink-0">
              AD
            </div>
            <div className={isCollapsed ? 'md:hidden' : 'overflow-hidden'}>
              <p className="font-semibold text-[12px] text-slate-800 dark:text-slate-200 leading-tight truncate">Administrator</p>
              <p className="text-[10px] text-slate-400 truncate">IT Team</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`flex items-center justify-center rounded-lg text-[12px] font-medium text-coral hover:bg-coral/10 transition-all duration-150 ${
              isCollapsed ? 'md:w-10 md:h-10 md:mx-auto gap-2 px-3 py-2 w-full' : 'gap-2 px-3 py-1.5 w-full'
            }`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
