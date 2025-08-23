import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useBreakpoint } from '@/hooks';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const { isMd } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(isMd);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(isMd);
  }, [isMd]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarCollapsedChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Mobile overlay when open on small screens */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed z-50 h-full transform transition-transform duration-300 ease-in-out md:relative md:z-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <Sidebar 
          closeSidebar={() => setSidebarOpen(false)} 
          onCollapsedChange={handleSidebarCollapsedChange}
        />
      </div>

      {/* Main Content */}
      <div 
        className={cn(
          "flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out",
          // Adjust margin based on sidebar state
          sidebarOpen && !sidebarCollapsed ? "md:ml-0" : "md:ml-0",
          // When sidebar is collapsed on desktop, content takes full width
          sidebarCollapsed && isMd ? "md:ml-0" : ""
        )}
      >
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;