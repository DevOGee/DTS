import { ReactNode, useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, Users, Settings, LogOut, Menu, X,
  Calendar, User, UserCheck, DollarSign, Video, CheckSquare, FileText, Layers,
  ChevronLeft, Send, Trash2, MessageSquare, Bell, MessageCircle, ChevronDown,
  UserCircle, Key, HelpCircle, Palette, Shield
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
  { path: '/workshops/active',    label: 'Workshops',    icon: Calendar },
  { path: '/requests',     label: 'Requests',     icon: Send },
  { path: '/recycle-bin',  label: 'Recycle Bin',  icon: Trash2 },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);     // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false);   // mobile drawer
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = user?.role === 'System Admin'
    ? [...NAV, { path: '/feedback', label: 'Feedback', icon: MessageSquare }, { path: '/settings', label: 'Settings', icon: Settings }]
    : [...NAV, { path: '/feedback', label: 'Feedback', icon: MessageSquare }];

  const handleLogout = () => { logout(); navigate('/'); };

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    notifications: true,
    emailUpdates: true
  });

  // Form handlers
  const handleProfileUpdate = () => {
    // In a real implementation, this would update the user profile
    console.log('Profile updated:', profileForm);
    setShowProfileModal(false);
    setProfileDropdownOpen(false);
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    // In a real implementation, this would change the password
    console.log('Password changed');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(false);
    setProfileDropdownOpen(false);
  };

  const handlePreferencesSave = () => {
    // In a real implementation, this would save preferences
    console.log('Preferences saved:', preferences);
    setShowPreferencesModal(false);
    setProfileDropdownOpen(false);
  };

  const handleHelp = () => {
    // In a real implementation, this would open help documentation
    window.open('/help', '_blank');
    setShowHelpModal(false);
    setProfileDropdownOpen(false);
  };

  const handlePrivacy = () => {
    // In a real implementation, this would open privacy policy
    window.open('/privacy', '_blank');
    setShowPrivacyModal(false);
    setProfileDropdownOpen(false);
  };

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
          <button onClick={() => setMobileOpen(false)} className="btn-icon p-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-lg transition-all duration-300 hover:shadow-md hover:transform hover:scale-110">
            <X className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors duration-300" />
          </button>
        ) : (
          <button onClick={() => setCollapsed(c => !c)} className="btn-icon p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg flex-shrink-0 transition-all duration-300 hover:shadow-md hover:transform hover:scale-110">
            {collapsed ? <Menu className="w-5 h-5 text-blue-500 hover:text-blue-600 transition-colors duration-300" /> : <ChevronLeft className="w-5 h-5 text-purple-500 hover:text-purple-600 transition-colors duration-300" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path}
            className={({ isActive }) => {
              const isWorkshopRoute = path.includes('/workshops') && location.pathname.startsWith('/workshops');
              return `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                isActive || isWorkshopRoute
                  ? 'bg-gradient-to-r from-[#037b90] to-[#ff7f50] text-white shadow-xl shadow-[#037b90]/30 transform scale-105'
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-[#037b90]/10 hover:to-[#ff7f50]/10 hover:text-[#037b90] hover:shadow-lg hover:transform hover:scale-102'
              }`;
            }}
            title={collapsed && !mobile ? label : undefined}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 transform hover:scale-110 hover:rotate-6 drop-shadow-2xl hover:drop-shadow-3xl ${
              path === '/dashboard' ? 'text-purple-600 hover:text-purple-700' :
              path === '/courses' ? 'text-[#ff7f50] hover:text-[#ff8f60]' :
              path === '/groups' ? 'text-[#ff9966] hover:text-[#ffa373]' :
              path === '/participants' ? 'text-purple-600 hover:text-purple-700' :
              path === '/multimedia' ? 'text-[#ff7f50] hover:text-[#ff8f60]' :
              path === '/attendance' ? 'text-[#ff9966] hover:text-[#ffa373]' :
              path === '/payments' ? 'text-purple-600 hover:text-purple-700' :
              path === '/checklist' ? 'text-[#ff7f50] hover:text-[#ff8f60]' :
              path === '/reports' ? 'text-[#ff9966] hover:text-[#ffa373]' :
              path.includes('/workshops') ? 'text-purple-600 hover:text-purple-700' :
              path === '/requests' ? 'text-[#ff7f50] hover:text-[#ff8f60]' :
              path === '/recycle-bin' ? 'text-purple-600 hover:text-purple-700' :
              path === '/feedback' ? 'text-[#ff9966] hover:text-[#ffa373]' :
              path === '/settings' ? 'text-purple-600 hover:text-purple-700' :
              'text-gray-500'
            }`} />
            {(!collapsed || mobile) && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
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

        {/* Desktop top header */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          {/* Left side - Mobile menu button for responsive */}
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="btn-icon p-2 hover:bg-gradient-to-r hover:from-[#037b90]/10 hover:to-[#ff7f50]/10 rounded-lg transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-110 hover:rotate-6">
              <Menu className="w-5 h-5 text-[#037b90] transition-all duration-300 hover:text-[#028a9f] drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:rotate-12" />
            </button>
          </div>

          {/* Right side - Moodle LMS style user area */}
          <div className="flex items-center gap-4">
            {/* Bell icon */}
            <button className="btn-icon p-2 hover:bg-gradient-to-r hover:from-[#037b90]/10 hover:to-[#ff7f50]/10 rounded-lg relative transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-110 hover:rotate-6">
              <Bell className="w-5 h-5 text-[#037b90] transition-all duration-300 hover:text-[#028a9f] drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:rotate-12" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff7f50] rounded-full animate-pulse shadow-xl shadow-[#ff7f50]/60"></span>
            </button>

            {/* Chat bubble with notification */}
            <button className="btn-icon p-2 hover:bg-gradient-to-r hover:from-[#ff7f50]/10 hover:to-[#ff9966]/10 rounded-lg relative transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-110 hover:-rotate-6">
              <MessageCircle className="w-5 h-5 text-[#ff7f50] transition-all duration-300 hover:text-[#ff8f60] drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:-rotate-12" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff9966] rounded-full animate-pulse shadow-xl shadow-[#ff9966]/60"></span>
            </button>

            {/* User profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {/* OUK Gold geometric avatar with enhanced 3D effect */}
                <div className="w-8 h-8 bg-gradient-to-br from-[#ff7f50] to-[#ff9966] rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-2xl shadow-[#ff7f50]/50 transform transition-all duration-300 hover:scale-110 hover:shadow-3xl hover:shadow-[#ff7f50]/60 hover:rotate-12">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <ChevronDown className={`w-4 h-4 text-[#037b90] transition-all duration-300 drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:rotate-6 ${profileDropdownOpen ? 'rotate-180 text-[#028a9f]' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#ff7f50] to-[#ff9966] rounded-lg flex items-center justify-center text-white font-semibold shadow-2xl shadow-[#ff7f50]/50 transform transition-all duration-300 hover:scale-110 hover:shadow-3xl hover:shadow-[#ff7f50]/60 hover:rotate-6">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user?.name}</div>
                        <div className="text-sm text-gray-500">{user?.role}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button 
                      onClick={() => { setShowProfileModal(true); setProfileDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#037b90]/10 hover:to-[#ff7f50]/10 flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105 hover:translate-x-1"
                    >
                      <UserCircle className="w-4 h-4 text-[#037b90] hover:text-[#028a9f] transition-all duration-300 drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:rotate-6" />
                      Profile
                    </button>
                    <button 
                      onClick={() => { setShowPasswordModal(true); setProfileDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#ff7f50]/10 hover:to-[#ff9966]/10 flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105 hover:translate-x-1"
                    >
                      <Key className="w-4 h-4 text-[#ff7f50] hover:text-[#ff8f60] transition-all duration-300 drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:rotate-6" />
                      Change Password
                    </button>
                    <button 
                      onClick={() => { setShowPreferencesModal(true); setProfileDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#ff9966]/10 hover:to-[#037b90]/10 flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105 hover:translate-x-1"
                    >
                      <Palette className="w-4 h-4 text-[#ff9966] hover:text-[#ffa373] transition-all duration-300 drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:rotate-6" />
                      Preferences
                    </button>
                    <button 
                      onClick={handleHelp}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#037b90]/10 hover:to-[#ff7f50]/10 flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105 hover:translate-x-1"
                    >
                      <HelpCircle className="w-4 h-4 text-[#037b90] hover:text-[#028a9f] transition-all duration-300 drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:rotate-6" />
                      Help
                    </button>
                    <button 
                      onClick={handlePrivacy}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#ff7f50]/10 hover:to-[#ff9966]/10 flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105 hover:translate-x-1"
                    >
                      <Shield className="w-4 h-4 text-[#ff7f50] hover:text-[#ff8f60] transition-all duration-300 drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:rotate-6" />
                      Privacy
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Logout */}
                  <div className="py-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-[#ff7f50]/10 flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105 hover:translate-x-1"
                    >
                      <LogOut className="w-4 h-4 text-red-500 hover:text-red-600 transition-all duration-300 drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:rotate-6" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="btn-icon p-2 hover:bg-gradient-to-r hover:from-[#037b90]/10 hover:to-[#ff7f50]/10 rounded-lg transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-110 hover:rotate-6">
            <Menu className="w-5 h-5 text-[#037b90] transition-all duration-300 hover:text-[#028a9f] drop-shadow-2xl hover:drop-shadow-3xl transform hover:scale-110 hover:rotate-12" />
          </button>
          <div className="flex items-center gap-2">
            <ImageWithFallback src="https://ouk.ac.ke/sites/default/files/gallery/logo_footer.png" alt="OUK" className="h-7 w-auto" />
            <span className="font-semibold text-sm text-primary">DTS</span>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-[#ff7f50] to-[#ff9966] rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-2xl shadow-[#ff7f50]/50 transform transition-all duration-300 hover:scale-110 hover:shadow-3xl hover:shadow-[#ff7f50]/60 hover:rotate-12">
            {user?.name?.charAt(0)}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto page-enter">
            {children}
          </div>
        </main>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Update Profile</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:transform hover:scale-110 hover:rotate-90">
                  <X className="w-5 h-5 drop-shadow-lg hover:drop-shadow-xl transform hover:scale-110 hover:rotate-90" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={profileForm.role}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t">
                <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-[#037b90]/10 hover:to-[#ff7f50]/10 hover:shadow-lg hover:transform hover:scale-105 transition-all duration-300">
                  Cancel
                </button>
                <button onClick={handleProfileUpdate} className="px-4 py-2 bg-gradient-to-r from-[#037b90] to-[#ff7f50] text-white rounded-lg hover:from-[#028a9f] hover:to-[#ff8f60] hover:shadow-xl hover:transform hover:scale-105 transition-all duration-300">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:transform hover:scale-110 hover:rotate-90">
                  <X className="w-5 h-5 drop-shadow-lg hover:drop-shadow-xl transform hover:scale-110 hover:rotate-90" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t">
                <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-[#ff7f50]/10 hover:to-[#ff9966]/10 hover:shadow-lg hover:transform hover:scale-105 transition-all duration-300">
                  Cancel
                </button>
                <button onClick={handlePasswordChange} className="px-4 py-2 bg-gradient-to-r from-[#ff7f50] to-[#ff9966] text-white rounded-lg hover:from-[#ff8f60] hover:to-[#ffa373] hover:shadow-xl hover:transform hover:scale-105 transition-all duration-300">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Modal */}
        {showPreferencesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Preferences</h3>
                <button onClick={() => setShowPreferencesModal(false)} className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:transform hover:scale-110 hover:rotate-90">
                  <X className="w-5 h-5 drop-shadow-lg hover:drop-shadow-xl transform hover:scale-110 hover:rotate-90" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                  <button
                    onClick={() => setPreferences({...preferences, emailUpdates: !preferences.emailUpdates})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 hover:shadow-lg ${
                      preferences.emailUpdates ? 'bg-gradient-to-r from-[#037b90] to-[#ff7f50] shadow-xl shadow-[#037b90]/40' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
                      preferences.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                  <button
                    onClick={() => setPreferences({...preferences, notifications: !preferences.notifications})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 hover:shadow-lg ${
                      preferences.notifications ? 'bg-gradient-to-r from-[#ff7f50] to-[#ff9966] shadow-xl shadow-[#ff7f50]/40' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
                      preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t">
                <button onClick={() => setShowPreferencesModal(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-[#ff9966]/10 hover:to-[#037b90]/10 hover:shadow-lg hover:transform hover:scale-105 transition-all duration-300">
                  Cancel
                </button>
                <button onClick={handlePreferencesSave} className="px-4 py-2 bg-gradient-to-r from-[#ff9966] to-[#037b90] text-white rounded-lg hover:from-[#ffa373] hover:to-[#028a9f] hover:shadow-xl hover:transform hover:scale-105 transition-all duration-300">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
