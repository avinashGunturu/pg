import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks';

/**
 * ResponsiveGrid component for creating responsive grid layouts
 * Automatically adjusts columns based on screen size
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.cols] - Default number of columns
 * @param {number} [props.smCols] - Number of columns on small screens
 * @param {number} [props.mdCols] - Number of columns on medium screens
 * @param {number} [props.lgCols] - Number of columns on large screens
 * @param {number} [props.xlCols] - Number of columns on extra large screens
 * @param {string} [props.gap] - Gap between grid items
 */
const ResponsiveGrid = ({
  children,
  className,
  cols = 1,
  smCols = 2,
  mdCols = 3,
  lgCols = 4,
  xlCols = 4,
  gap = '1rem',
}) => {
  const { current } = useBreakpoint();
  
  // Determine the number of columns based on the current breakpoint
  const getColumns = () => {
    switch (current) {
      case 'xs':
        return cols;
      case 'sm':
        return smCols;
      case 'md':
        return mdCols;
      case 'lg':
        return lgCols;
      case 'xl':
      case '2xl':
        return xlCols;
      default:
        return cols;
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${getColumns()}, minmax(0, 1fr))`,
    gap,
  };

  return (
    <div className={cn('w-full', className)} style={gridStyle}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;