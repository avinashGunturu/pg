import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBreakpoint } from '@/hooks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, User, LogOut, Settings, Home, Building, Users, Package, DollarSign, Building2 } from 'lucide-react';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: 'Dashboard', href: '/app/dashboard', icon: <Home className="h-4 w-4 mr-2" /> },
    { name: 'Properties', href: '/app/properties', icon: <Building className="h-4 w-4 mr-2" /> },
    { name: 'Tenants', href: '/app/tenants', icon: <Users className="h-4 w-4 mr-2" /> },
    { name: 'Employees', href: '/app/employees', icon: <Users className="h-4 w-4 mr-2" /> },
    { name: 'Inventory', href: '/app/inventory', icon: <Package className="h-4 w-4 mr-2" /> },
    { name: 'Financial', href: '/app/financial', icon: <DollarSign className="h-4 w-4 mr-2" /> },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const { isMd } = useBreakpoint();

  return (
    <nav className="bg-card shadow-sm border-b sticky top-0 z-30">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            {!isMd && (
              <button
                onClick={toggleSidebar}
                className="mr-2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/app/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                <div className="relative">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  PGMate
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.profilePicture} alt={user?.name} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name || 'User'}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-sm font-normal text-gray-500">
                  {user?.email || 'user@example.com'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/profile" className="cursor-pointer w-full flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/settings" className="cursor-pointer w-full flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300 text-base font-medium text-gray-600 hover:text-gray-800 py-2 pl-3 pr-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name || 'User'}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email || 'user@example.com'}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/app/profile"
                className="flex items-center border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300 text-base font-medium text-gray-600 hover:text-gray-800 py-2 pl-3 pr-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
              <Link
                to="/app/settings"
                className="flex items-center border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300 text-base font-medium text-gray-600 hover:text-gray-800 py-2 pl-3 pr-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300 text-base font-medium text-gray-600 hover:text-gray-800 py-2 pl-3 pr-4"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;