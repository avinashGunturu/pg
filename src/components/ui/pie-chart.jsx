import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// This is a placeholder component that would use a chart library like Chart.js or Recharts
// In a real implementation, you would need to install and import the actual chart library
// For example: import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PieChart = ({
  title,
  data = [],
  category,
  index,
  colors = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'],
  valueFormatter,
  showLegend = true,
  showLabels = true,
  height = 300,
  className,
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // This is where you would initialize your chart library
    // For example with Chart.js:
    // if (chartRef.current) {
    //   const chart = new Chart(chartRef.current, {
    //     type: 'pie',
    //     data: {
    //       labels: data.map(item => item[index]),
    //       datasets: [{
    //         data: data.map(item => item[category]),
    //         backgroundColor: colors.slice(0, data.length),
    //       }],
    //     },
    //     options: { ... }
    //   });
    //   return () => chart.destroy();
    // }

    // For now, we'll just log the data to show what would be rendered
    console.log('Pie Chart data:', { data, category, index });
  }, [data, category, index, colors, showLabels]);

  // Placeholder for chart rendering
  const renderPlaceholderChart = () => {
    if (!data || data.length === 0) {
      return <div className="flex h-[200px] items-center justify-center">No data available</div>;
    }

    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + (Number(item[category]) || 0), 0);

    return (
      <div className="relative h-full w-full">
        {/* This is a placeholder visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[150px] w-[150px]">
            {/* Create a simple pie chart visualization using CSS */}
            <div className="absolute inset-0 rounded-full border-4 border-background bg-muted"></div>
            {data.slice(0, colors.length).map((item, idx) => {
              const value = Number(item[category]) || 0;
              const percentage = total > 0 ? (value / total) * 100 : 0;
              const offset = idx > 0 
                ? data.slice(0, idx).reduce((sum, i) => sum + (Number(i[category]) || 0), 0) / total * 100 
                : 0;
              
              return (
                <div 
                  key={idx}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${colors[idx % colors.length]} ${offset}% ${offset + percentage}%, transparent ${offset + percentage}% 100%)`,
                  }}
                ></div>
              );
            })}
            <div className="absolute inset-[15%] rounded-full bg-card flex items-center justify-center">
              <span className="text-sm font-medium">{total}</span>
            </div>
          </div>
        </div>
        {showLegend && (
          <div className="absolute bottom-2 left-0 right-0 flex flex-wrap justify-center gap-x-4 gap-y-2 px-4">
            {data.slice(0, colors.length).map((item, idx) => {
              const value = Number(item[category]) || 0;
              const percentage = total > 0 ? (value / total) * 100 : 0;
              
              return (
                <div key={idx} className="flex items-center">
                  <div
                    className="mr-1.5 h-3 w-3 rounded-full"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <span className="text-xs">
                    {item[index]} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div style={{ height: `${height}px` }} className="w-full">
          {/* In a real implementation, you would render your chart library here */}
          {/* <canvas ref={chartRef} /> */}
          {renderPlaceholderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;