import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks';

/**
 * ResponsiveContainer component for creating responsive layouts
 * Automatically adjusts padding, width, and other properties based on screen size
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.fullWidth] - Whether the container should take full width
 * @param {boolean} [props.noPadding] - Whether to remove padding
 * @param {string} [props.maxWidth] - Maximum width of the container
 */
const ResponsiveContainer = ({
  children,
  className,
  fullWidth = false,
  noPadding = false,
  maxWidth = 'max-w-7xl',
}) => {
  const { isMd } = useBreakpoint();

  return (
    <div
      className={cn(
        'mx-auto w-full',
        !noPadding && 'px-4 sm:px-6 md:px-8',
        !fullWidth && maxWidth,
        className
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;