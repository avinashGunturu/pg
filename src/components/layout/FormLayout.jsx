import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks';
import ResponsiveContainer from './ResponsiveContainer';

/**
 * FormLayout component for creating responsive form layouts
 * Provides a structured layout for forms with optional sidebar
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Form content
 * @param {React.ReactNode} [props.header] - Form header content
 * @param {React.ReactNode} [props.sidebar] - Form sidebar content (e.g., help text, preview)
 * @param {React.ReactNode} [props.footer] - Form footer content (e.g., submit buttons)
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.centered] - Whether to center the form
 * @param {string} [props.maxWidth] - Maximum width of the form
 */
const FormLayout = ({
  children,
  header,
  sidebar,
  footer,
  className,
  centered = false,
  maxWidth = 'max-w-3xl',
}) => {
  const { isMd, isLg } = useBreakpoint();

  return (
    <ResponsiveContainer 
      className={cn('py-4', className)}
      maxWidth={centered ? maxWidth : 'max-w-7xl'}
    >
      <div className={cn(
        'w-full',
        centered && 'mx-auto'
      )}>
        {header && (
          <div className="mb-6">
            {header}
          </div>
        )}

        <div className={cn(
          'flex flex-col gap-6',
          isMd && sidebar && 'flex-row'
        )}>
          {/* Main form content */}
          <div className={cn(
            'w-full',
            isMd && sidebar && 'w-2/3',
            isLg && sidebar && 'w-3/4',
          )}>
            <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6">
              {children}
            </div>
          </div>

          {/* Sidebar */}
          {sidebar && (
            <div className={cn(
              'w-full',
              isMd && 'w-1/3',
              isLg && 'w-1/4',
            )}>
              <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6 sticky top-24">
                {sidebar}
              </div>
            </div>
          )}
        </div>

        {footer && (
          <div className="mt-6">
            {footer}
          </div>
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default FormLayout;