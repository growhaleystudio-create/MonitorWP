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
  ChevronLeft,
  ChevronRight
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
    { name: 'Home', to: '/', icon: LayoutDashboard },
    { name: 'Sites', to: '/sites', icon: Globe },
    { name: 'Plugins', to: '/plugins', icon: Plug },
    { name: 'Logs', to: '/logs', icon: Terminal },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/80 fixed top-0 left-0 right-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" className="h-6 w-6 shrink-0" alt="Growhaley Logo" />
          <span className="font-bold text-[13px] tracking-tight text-slate-800 uppercase">Growhaley WP</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition active:scale-95"
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#f4f8f7] border-r border-slate-200/80 py-8 px-5 flex flex-col justify-between transform transition-all duration-300 md:translate-x-0 ${
          isOpen ? 'w-64 translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20 md:px-3' : 'md:w-64 md:px-5'}`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo / Brand Header */}
          <div className={`flex items-center ${isCollapsed ? 'md:justify-center' : 'gap-2.5 px-2'}`}>
            <img src="/logo.svg" className="h-9 w-9 shrink-0" alt="Growhaley Logo" />
            <div className={isCollapsed ? 'md:hidden' : ''}>
              <h1 className="font-bold text-[16px] tracking-tight text-slate-900 leading-none">
                Growhaley
              </h1>
              <span className="text-[9px] font-bold text-primary-teal uppercase tracking-wider mt-1 block">
                Monitor v1.0.0
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-2 mt-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center transition-all duration-150 relative group ${
                    isCollapsed 
                      ? 'md:w-10 md:h-10 md:justify-center md:mx-auto w-full gap-3 px-4 py-2.5' 
                      : 'w-full gap-3 px-4 py-2.5'
                  } rounded font-bold text-[13px] ${
                    isActive
                      ? 'bg-primary-teal text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className={isCollapsed ? 'md:hidden' : ''}>{item.name}</span>

                {/* Collapsed Tooltip (Desktop only) */}
                {isCollapsed && (
                  <div className="hidden md:block absolute left-full ml-3 px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wide uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User / Logout */}
        <div className="border-t border-slate-200/60 pt-6 flex flex-col gap-4">
          <div className={`flex items-center ${isCollapsed ? 'md:justify-center' : 'gap-3 px-2'}`}>
            <div className="h-9 w-9 rounded bg-primary-teal/10 flex items-center justify-center font-black text-primary-teal text-xs border border-primary-teal/20 shrink-0">
              AD
            </div>
            <div className={isCollapsed ? 'md:hidden' : ''}>
              <p className="font-extrabold text-[12px] text-slate-800 leading-none">Administrator</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">IT Internal</p>
            </div>
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className={`hidden md:flex items-center justify-center p-2 rounded bg-slate-200/40 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition ${
              isCollapsed ? 'w-10 h-10 mx-auto' : 'w-full'
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>

          <button
            onClick={onLogout}
            className={`flex items-center justify-center rounded font-extrabold text-[12px] text-coral border border-coral/20 bg-coral/5 hover:bg-coral hover:text-white transition-all duration-150 shadow-sm ${
              isCollapsed ? 'md:w-10 md:h-10 md:mx-auto gap-2 px-4 py-2.5 w-full' : 'gap-2 px-4 py-2.5 w-full'
            }`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

