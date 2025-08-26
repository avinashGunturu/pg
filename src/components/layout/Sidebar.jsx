import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks';
import {
  Home,
  Building,
  Users,
  Package,
  DollarSign,
  BarChart2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ closeSidebar, onCollapsedChange }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarItems = [
    {
      title: 'Dashboard',
      href: '/app/dashboard',
      icon: <Home size={20} />,
      submenu: [
        { title: 'Overview', href: '/app/dashboard' },
        { title: 'Analytics', href: '/app/dashboard/analytics' },
        { title: 'Reports', href: '/app/dashboard/reports' },
      ],
    },
    {
      title: 'Properties',
      href: '/app/properties',
      icon: <Building size={20} />,
      submenu: [
        { title: 'All Properties', href: '/app/properties' },
        { title: 'Add / Update Property', href: '/app/properties/add' },
        // { title: 'Maintenance', href: '/app/properties/maintenance' },
      ],
    },
    {
      title: 'Tenants',
      href: '/app/tenants',
      icon: <Users size={20} />,
      submenu: [
        { title: 'All Tenants', href: '/app/tenants' },
        { title: 'Add Tenant', href: '/app/tenants/add' },
        // { title: 'Lease Agreements', href: '/app/tenants/leases' },
      ],
    },
    {
      title: 'Employees',
      href: '/app/employees',
      icon: <Users size={20} />,
      submenu: [
        { title: 'All Employees', href: '/app/employees' },
        { title: 'Add Employee', href: '/app/employees/add' },
        // { title: 'Roles', href: '/app/employees/roles' },
      ],
    },
    {
      title: 'Inventory',
      href: '/app/inventory',
      icon: <Package size={20} />,
      submenu: [
        { title: 'All Items', href: '/app/inventory' },
        { title: 'Add Item', href: '/app/inventory/add' },
        { title: 'Categories', href: '/app/inventory/categories' },
      ],
    },
    {
      title: 'Financial',
      href: '/app/financial',
      icon: <DollarSign size={20} />,
      submenu: [
        { title: 'Transactions', href: '/app/financial' },
        { title: 'Add/Edit Transactions', href: '/app/financial/transactions/add' },
        // { title: 'Invoices', href: '/app/financial/invoices' },
        // { title: 'Expenses', href: '/app/financial/expenses' },
      ],
    },
    {
      title: 'Reports',
      href: '/app/reports',
      icon: <BarChart2 size={20} />,
      submenu: [
        { title: 'Financial Reports', href: '/app/reports/financial' },
        { title: 'Occupancy Reports', href: '/app/reports/occupancy' },
        // { title: 'Maintenance Reports', href: '/app/reports/maintenance' },
      ],
    },
    // {
    //   title: 'Documents',
    //   href: '/app/documents',
    //   icon: <FileText size={20} />,
    //   submenu: [
    //     { title: 'All Documents', href: '/app/documents' },
    //     { title: 'Upload Document', href: '/app/documents/upload' },
    //     { title: 'Templates', href: '/app/documents/templates' },
    //   ],
    // },
    {
      title: 'Settings',
      href: '/app/settings',
      icon: <Settings size={20} />,
      submenu: [
        { title: 'General', href: '/app/settings' },
        { title: 'Profile', href: '/app/settings/profile' },
        // { title: 'Notifications', href: '/app/settings/notifications' },
      ],
    },
  ];

  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (submenuItems) => {
    return submenuItems.some((item) => isActive(item.href));
  };

  const { isMd } = useBreakpoint();

  // Reset collapsed state based on screen size
  useEffect(() => {
    if (isMd) {
      setCollapsed(false);
    }
  }, [isMd]);

  // Notify parent component when collapsed state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    }
  }, [collapsed, onCollapsedChange]);

  const handleToggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={cn(
        'h-screen bg-card border-r shadow-sm transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex justify-end p-2">
        <button
          onClick={handleToggleCollapsed}
          className="p-1 rounded-md hover:bg-gray-100"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="mt-5 flex flex-col space-y-1">
        {sidebarItems.map((item, index) => (
          <div key={item.title} className="px-2">
            <div
              className={cn(
                'flex items-center py-2 px-3 rounded-md cursor-pointer',
                (isActive(item.href) || isSubmenuActive(item.submenu)) && 'bg-primary-50 text-primary-600',
                !isActive(item.href) && !isSubmenuActive(item.submenu) && 'hover:bg-gray-100'
              )}
              onClick={() => toggleSubmenu(index)}
            >
              <div className="flex items-center flex-1">
                <span className="mr-3">{item.icon}</span>
                {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
              </div>
              {!collapsed && item.submenu && (
                <span
                  className={cn(
                    'transition-transform duration-200',
                    openSubmenu === index ? 'rotate-90' : ''
                  )}
                >
                  <ChevronRight size={16} />
                </span>
              )}
            </div>

            {!collapsed && openSubmenu === index && (
              <div className="ml-9 mt-1 space-y-1">
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.title}
                    to={subItem.href}
                    className={cn(
                      'block py-2 px-3 rounded-md text-sm',
                      isActive(subItem.href)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                    onClick={() => {
                      if (!isMd && closeSidebar) {
                        closeSidebar();
                      }
                    }}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;