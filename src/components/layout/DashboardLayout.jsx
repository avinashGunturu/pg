import { cn } from '@/lib/utils';
import ResponsiveContainer from './ResponsiveContainer';
import ResponsiveGrid from './ResponsiveGrid';
import { useBreakpoint } from '@/hooks';

/**
 * DashboardLayout component for creating responsive dashboard layouts
 * Provides a structured layout with sidebar, main content, and optional sections
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Main content
 * @param {React.ReactNode} [props.header] - Dashboard header content
 * @param {React.ReactNode} [props.sidebar] - Dashboard sidebar content
 * @param {React.ReactNode} [props.topWidgets] - Widgets to display at the top
 * @param {React.ReactNode} [props.bottomWidgets] - Widgets to display at the bottom
 * @param {string} [props.className] - Additional CSS classes
 */
const DashboardLayout = ({
  children,
  header,
  sidebar,
  topWidgets,
  bottomWidgets,
  className,
}) => {
  const { isMd, isLg } = useBreakpoint();

  return (
    <ResponsiveContainer className={cn('py-4', className)}>
      {header && (
        <div className="mb-6">
          {header}
        </div>
      )}

      <div className={cn(
        'flex flex-col gap-6',
        isMd && 'flex-row'
      )}>
        {/* Sidebar */}
        {sidebar && (
          <div className={cn(
            'w-full',
            isMd && 'w-1/3',
            isLg && 'w-1/4',
          )}>
            {sidebar}
          </div>
        )}

        {/* Main content */}
        <div className={cn(
          'flex-1 flex flex-col gap-6',
        )}>
          {/* Top widgets */}
          {topWidgets && (
            <div className="w-full">
              {Array.isArray(topWidgets) ? (
                <ResponsiveGrid 
                  cols={1} 
                  smCols={2} 
                  mdCols={2} 
                  lgCols={3} 
                  gap="1rem"
                >
                  {topWidgets}
                </ResponsiveGrid>
              ) : (
                topWidgets
              )}
            </div>
          )}

          {/* Main content */}
          <div className="w-full">
            {children}
          </div>

          {/* Bottom widgets */}
          {bottomWidgets && (
            <div className="w-full">
              {Array.isArray(bottomWidgets) ? (
                <ResponsiveGrid 
                  cols={1} 
                  smCols={1} 
                  mdCols={2} 
                  lgCols={2} 
                  gap="1rem"
                >
                  {bottomWidgets}
                </ResponsiveGrid>
              ) : (
                bottomWidgets
              )}
            </div>
          )}
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default DashboardLayout;