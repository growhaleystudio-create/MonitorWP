import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Sparkles,
  ShieldAlert,
  Plug,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  MapPin,
  Code2,
  ShieldCheck,
  ListChecks,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: any;
  soon?: boolean;
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
  /** Route prefix used to auto-expand accordion when child route is active */
  activePrefix?: string;
}

function Sidebar({ onLogout, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Accordion state — persisted in localStorage
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sidebar_accordions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { 'SEO ENGINE': true, 'SECURITY': true };
  });

  useEffect(() => {
    localStorage.setItem('sidebar_accordions', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navGroups: NavGroup[] = [
    {
      label: 'MAIN',
      items: [
        { name: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
        { name: 'Sites', to: '/sites', icon: Globe, end: true },
      ],
    },
    {
      label: 'SEO ENGINE',
      collapsible: true,
      activePrefix: '/seo',
      items: [
        { name: 'SEO & Vitals', to: '/seo', icon: Sparkles, end: true },
        { name: 'Sitemap Audit', to: '/seo/sitemap', icon: MapPin },
        { name: 'Schema Validator', to: '/seo/schema', icon: Code2 },
      ],
    },
    {
      label: 'SECURITY',
      collapsible: true,
      activePrefix: '/security',
      items: [
        { name: 'Security & WAF', to: '/security', icon: ShieldAlert, end: true },
        { name: 'Security Headers', to: '/security/headers', icon: ShieldCheck },
        { name: 'WP Hardening', to: '/security/hardening', icon: ListChecks },
      ],
    },
    {
      label: 'TOOLS',
      items: [
        { name: 'Plugins & CVEs', to: '/plugins', icon: Plug },
        { name: 'Audit Logs', to: '/logs', icon: FileText },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Settings', to: '/settings', icon: Settings },
      ],
    },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleTheme = () => setIsDark(!isDark);
  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Auto-expand accordion if a child route is active
  useEffect(() => {
    navGroups.forEach(group => {
      if (group.collapsible && group.activePrefix && location.pathname.startsWith(group.activePrefix)) {
        setExpandedGroups(prev => {
          if (prev[group.label]) return prev;
          return { ...prev, [group.label]: true };
        });
      }
    });
  }, [location.pathname]);

  /** Check if any item in a group is currently active */
  const isGroupActive = (group: NavGroup) => {
    return group.activePrefix ? location.pathname.startsWith(group.activePrefix) : false;
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 fixed top-0 left-0 right-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" className="h-6 w-6 shrink-0" alt="Growhaley Logo" />
          <span className="font-bold text-[12px] tracking-tight text-slate-800 dark:text-slate-100 uppercase">WhalePod</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
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
          isOpen ? 'w-52 translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-14 md:px-1.5' : 'md:w-52 md:px-2.5'}`}
      >
        <div className="flex flex-col gap-0.5 min-h-0">
          {/* Logo / Brand Header */}
          <div className={`flex items-center py-1 mb-1.5 ${isCollapsed ? 'md:justify-center' : 'gap-2 px-2'}`}>
            <img src="/logo.svg" className="h-6 w-6 shrink-0" alt="WhalePod Logo" />
            <div className={isCollapsed ? 'md:hidden' : ''}>
              <h1 className="font-bold text-[13px] tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                WhalePod
              </h1>
              <span className="text-[8px] font-bold text-primary-teal uppercase tracking-wider mt-0.5 block">
                Command v1.2.0
              </span>
            </div>
          </div>

          {/* Grouped Navigation */}
          <nav className="flex flex-col gap-px overflow-y-auto flex-1 sidebar-nav pr-1.5">
            {navGroups.map((group, groupIndex) => {
              const isExpanded = expandedGroups[group.label] !== false;
              const groupActive = isGroupActive(group);

              return (
                <div key={group.label}>
                  {/* Section Separator & Header */}
                  {groupIndex > 0 && (
                    <>
                      {/* Collapsed mode: just a divider */}
                      <div className={`${isCollapsed ? 'md:block' : ''} ${isCollapsed ? '' : 'hidden'}`}>
                        <div className="border-t border-slate-200/50 dark:border-slate-800/50 my-1.5 mx-1" />
                      </div>

                      {/* Expanded mode: clickable accordion header or static label */}
                      <div className={`${isCollapsed ? 'md:hidden' : ''}`}>
                        {group.collapsible ? (
                          <button
                            onClick={() => toggleGroup(group.label)}
                            className="flex items-center gap-1.5 w-full px-2.5 pt-3 pb-1 group/hdr cursor-pointer select-none"
                          >
                            <span className={`text-[8px] font-bold uppercase tracking-[0.12em] whitespace-nowrap transition-colors ${
                              groupActive 
                                ? 'text-primary-teal dark:text-primary-light' 
                                : 'text-slate-400 dark:text-slate-500 group-hover/hdr:text-slate-500 dark:group-hover/hdr:text-slate-400'
                            }`}>
                              {group.label}
                            </span>
                            <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-800/50" />
                            <ChevronDown className={`h-3 w-3 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 pt-3 pb-1">
                            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 select-none whitespace-nowrap">
                              {group.label}
                            </span>
                            <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-800/50" />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Nav Items — with accordion slide animation for collapsible groups */}
                  <div
                    className={`flex flex-col gap-px overflow-hidden transition-all duration-200 ease-in-out ${
                      group.collapsible && !isExpanded && !isCollapsed
                        ? 'max-h-0 opacity-0'
                        : 'max-h-96 opacity-100'
                    }`}
                  >
                    {group.items.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        end={item.end}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center transition-all duration-150 relative group ${
                            isCollapsed
                              ? 'md:w-9 md:h-9 md:justify-center md:mx-auto w-full gap-2 px-2.5 py-1.5'
                              : 'w-full gap-2 px-2.5 py-1.5'
                          } rounded-md text-[11.5px] ${
                            isActive
                              ? 'bg-primary-teal text-white shadow-sm font-semibold'
                              : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                          }`
                        }
                      >
                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                        <span className={`flex-1 truncate ${isCollapsed ? 'md:hidden' : ''}`}>{item.name}</span>

                        {/* "Soon" Badge (visible when expanded) */}
                        {item.soon && (
                          <span className={`inline-flex items-center px-1 py-0 rounded text-[7px] font-bold uppercase tracking-wider bg-accent-gold/15 text-accent-dark dark:text-accent-gold border border-accent-gold/20 leading-tight ${isCollapsed ? 'md:hidden' : ''}`}>
                            Soon
                          </span>
                        )}

                        {/* Collapsed Tooltip (Desktop only) */}
                        {isCollapsed && (
                          <div className="hidden md:flex items-center gap-1.5 absolute left-full ml-2.5 px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                            {item.name}
                            {item.soon && (
                              <span className="px-1 py-0 rounded text-[7px] font-bold bg-accent-gold/25 text-accent-gold uppercase">
                                Soon
                              </span>
                            )}
                          </div>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User / Theme / Collapse / Logout */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-2.5 flex flex-col gap-1">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition ${
              isCollapsed ? 'md:w-9 md:h-9 md:justify-center md:mx-auto py-1.5' : 'w-full px-2.5 py-1.5'
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 shrink-0 text-slate-600 dark:text-slate-400" />
            )}
            <span className={isCollapsed ? 'md:hidden' : ''}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className={`hidden md:flex items-center gap-2 rounded-md text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition ${
              isCollapsed ? 'md:w-9 md:h-9 md:justify-center md:mx-auto py-1.5' : 'w-full px-2.5 py-1.5'
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-3.5 w-3.5 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* User Profile Info */}
          <div className={`flex items-center ${isCollapsed ? 'md:justify-center' : 'gap-2 px-2 py-0.5'}`}>
            <div className="h-6 w-6 rounded-full bg-primary-teal/10 flex items-center justify-center font-bold text-primary-teal text-[10px] border border-primary-teal/20 shrink-0">
              AD
            </div>
            <div className={isCollapsed ? 'md:hidden' : 'overflow-hidden'}>
              <p className="font-semibold text-[11px] text-slate-800 dark:text-slate-200 leading-tight truncate">Administrator</p>
              <p className="text-[9px] text-slate-400 truncate">IT Team</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`flex items-center justify-center rounded-md text-[11px] font-medium text-coral hover:bg-coral/10 transition-all duration-150 ${
              isCollapsed ? 'md:w-9 md:h-9 md:mx-auto gap-2 px-2.5 py-1.5 w-full' : 'gap-2 px-2.5 py-1.5 w-full'
            }`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
