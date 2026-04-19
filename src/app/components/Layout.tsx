import { ReactNode, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, Users, Settings, LogOut, Menu, X,
  Calendar, User, UserCheck, DollarSign, Video, CheckSquare, FileText, Layers,
  ChevronLeft, Send,
} from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

const NAV = [
  { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/courses',      label: 'Courses',      icon: BookOpen },
  { path: '/groups',       label: 'Groups',       icon: Layers },
  { path: '/participants', label: 'Participants',  icon: Users },
  { path: '/multimedia',   label: 'Multimedia',   icon: Video },
  { path: '/attendance',   label: 'Attendance',   icon: UserCheck },
  { path: '/payments',     label: 'Payments',     icon: DollarSign },
  { path: '/checklist',    label: 'Checklist',    icon: CheckSquare },
  { path: '/reports',      label: 'Reports',      icon: FileText },
  { path: '/workshops',    label: 'Workshops',    icon: Calendar },
  { path: '/requests',     label: 'Requests',     icon: Send },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);     // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false);   // mobile drawer

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navItems = user?.role === 'System Admin'
    ? [...NAV, { path: '/settings', label: 'Settings', icon: Settings }]
    : NAV;

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center border-b border-border flex-shrink-0 ${collapsed && !mobile ? 'justify-center p-4' : 'justify-between p-5'}`}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 min-w-0">
            <ImageWithFallback src="https://ouk.ac.ke/sites/default/files/gallery/logo_footer.png" alt="OUK" className="h-9 w-auto flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-primary truncate">OUK · DTS</div>
              <div className="text-xs text-muted-foreground truncate">Digitisation Tracker</div>
            </div>
          </div>
        )}
        {mobile ? (
          <button onClick={() => setMobileOpen(false)} className="btn-icon p-2"><X className="w-5 h-5" /></button>
        ) : (
          <button onClick={() => setCollapsed(c => !c)} className="btn-icon p-2 flex-shrink-0">
            {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-foreground hover:bg-muted'
              }`
            }
            title={collapsed && !mobile ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || mobile) && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className={`flex items-center gap-3 mb-2 px-2 py-2 rounded-xl ${!collapsed || mobile ? '' : 'justify-center'}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
            {user?.name?.charAt(0) ?? <User className="w-4 h-4" />}
          </div>
          {(!collapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.role}</div>
            </div>
          )}
        </div>
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive text-sm font-medium transition-all ${collapsed && !mobile ? 'justify-center' : ''}`}
          title={collapsed && !mobile ? 'Logout' : undefined}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-[72px]' : 'w-60'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <>
          <div className="sidebar-overlay md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 flex flex-col animate-slide-in md:hidden">
            <SidebarContent mobile />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="btn-icon p-2"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <ImageWithFallback src="https://ouk.ac.ke/sites/default/files/gallery/logo_footer.png" alt="OUK" className="h-7 w-auto" />
            <span className="font-semibold text-sm text-primary">DTS</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0)}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
