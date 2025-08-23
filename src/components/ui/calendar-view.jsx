import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * CalendarView component for displaying events and appointments in a calendar format
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Calendar title
 * @param {Array} props.events - Array of event objects with date, title, and optional type
 * @param {function} [props.onDateSelect] - Callback when a date is selected
 * @param {function} [props.onEventClick] - Callback when an event is clicked
 * @param {string} [props.viewMode] - Calendar view mode ('month', 'week', 'day')
 * @param {Date} [props.initialDate] - Initial date to display
 * @param {string} [props.className] - Optional additional CSS classes
 */
const CalendarView = ({
  title = 'Calendar',
  events = [],
  onDateSelect,
  onEventClick,
  viewMode: initialViewMode = 'month',
  initialDate = new Date(),
  className,
}) => {
  const [date, setDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [selectedDate, setSelectedDate] = useState(null);

  // Function to handle date change
  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedDate(newDate);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  // Function to handle event click
  const handleEventClick = (event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Function to navigate to previous period
  const navigatePrevious = () => {
    const newDate = new Date(date);
    if (viewMode === 'month') {
      newDate.setMonth(date.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(date.getDate() - 7);
    } else {
      newDate.setDate(date.getDate() - 1);
    }
    setDate(newDate);
  };

  // Function to navigate to next period
  const navigateNext = () => {
    const newDate = new Date(date);
    if (viewMode === 'month') {
      newDate.setMonth(date.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(date.getDate() + 7);
    } else {
      newDate.setDate(date.getDate() + 1);
    }
    setDate(newDate);
  };

  // Function to navigate to today
  const navigateToday = () => {
    setDate(new Date());
  };

  // Function to get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Function to render day cell content
  const renderDayContent = (day) => {
    const dayEvents = getEventsForDate(day);
    const hasEvents = dayEvents.length > 0;

    return (
      <div className="h-full w-full">
        <div className={cn(
          "h-full w-full p-1",
          hasEvents && "relative"
        )}>
          <div className="text-center">{day.getDate()}</div>
          {hasEvents && (
            <div className="absolute bottom-1 left-0 right-0 flex justify-center">
              <div className="flex space-x-1">
                {dayEvents.slice(0, 3).map((_, i) => (
                  <div 
                    key={i} 
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-50" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Function to render selected date events
  const renderSelectedDateEvents = () => {
    if (!selectedDate) return null;
    
    const dateEvents = getEventsForDate(selectedDate);
    if (dateEvents.length === 0) {
      return (
        <div className="py-2 text-center text-sm text-muted-foreground">
          No events scheduled for this date
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {dateEvents.map((event, index) => (
          <div 
            key={index} 
            className={cn(
              "cursor-pointer rounded-md border p-2 text-sm",
              event.type === 'important' && "border-red-200 bg-red-50 dark:bg-red-950/20",
              event.type === 'maintenance' && "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
              event.type === 'appointment' && "border-green-200 bg-green-50 dark:bg-green-950/20",
              !event.type && "border-gray-200 bg-gray-50 dark:bg-gray-800/50"
            )}
            onClick={() => handleEventClick(event)}
          >
            <div className="font-medium">{event.title}</div>
            {event.time && (
              <div className="text-xs text-muted-foreground">{event.time}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateToday}>
              Today
            </Button>
          </div>
          <div className="text-sm font-medium">
            {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-7 lg:grid-cols-7">
          <div className="col-span-1 md:col-span-5 lg:col-span-5">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              month={date}
              className="rounded-md border"
              components={{
                DayContent: renderDayContent
              }}
            />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="rounded-md border p-2">
              <div className="mb-2 font-medium">
                {selectedDate ? (
                  selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })
                ) : (
                  'Select a date to view events'
                )}
              </div>
              {renderSelectedDateEvents()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;