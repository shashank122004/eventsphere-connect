import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Home,
  PlusCircle,
  QrCode,
  Compass,
  Users,
  History,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', end: true },
    { to: '/dashboard/host', icon: PlusCircle, label: 'Host Event' },
    { to: '/dashboard/join', icon: QrCode, label: 'Join Event' },
    { to: '/dashboard/explore', icon: Compass, label: 'Explore Events' },
    { to: '/dashboard/my-events', icon: Calendar, label: 'My Events' },
    { to: '/dashboard/contacts', icon: Users, label: 'Contacts' },
    { to: '/dashboard/history', icon: History, label: 'Event History' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <div className="p-2 gradient-primary rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl gradient-text">Eventify</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 sm:p-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 sm:w-72 lg:w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col h-full',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border hidden lg:flex items-center gap-2">
          <div className="p-2 gradient-primary rounded-lg">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">Eventify</span>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border mt-16 lg:mt-0 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate sm:truncate-none">{user?.name}</p>
            <p className="text-sm text-muted-foreground truncate sm:truncate-none">{user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto overscroll-contain">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 sm:py-4 rounded-lg transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 space-y-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-3 sm:py-4"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
            ) : (
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
            )}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-3 sm:py-4 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-20 lg:pt-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 lg:max-w-6xl lg:mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
