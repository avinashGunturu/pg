import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks';
import { Button } from './button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from './breadcrumb';

/**
 * PageHeader component for creating responsive page headers
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} [props.description] - Page description
 * @param {React.ReactNode} [props.actions] - Action buttons or links
 * @param {Array} [props.breadcrumbs] - Breadcrumb items
 * @param {string} [props.className] - Additional CSS classes
 */
const PageHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}) => {
  const { isMd } = useBreakpoint();

  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-2">
          <Breadcrumb>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={index}>
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        </div>
      )}

      <div className={cn(
        'flex flex-col gap-4',
        isMd && 'flex-row items-center justify-between'
      )}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {actions && (
          <div className={cn(
            'flex flex-col sm:flex-row gap-2',
            isMd ? 'justify-end' : 'justify-start'
          )}>
            {Array.isArray(actions) ? actions.map((action, index) => (
              <div key={index}>{action}</div>
            )) : actions}
          </div>
        )}
      </div>
    </div>
  );
};

export { PageHeader };