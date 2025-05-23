import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SelectDateStepProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  onNext: () => void;
  onBack: () => void;
}

// Helper function to get day name
const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Helper function to format date as "Jan 1"
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const SelectDateStep = ({
  selectedDate,
  onDateChange,
  onNext,
  onBack,
}: SelectDateStepProps) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [error, setError] = useState('');

  // Generate available dates (next 14 days, excluding Sundays)
  useEffect(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (0 is Sunday in JavaScript's getDay())
      if (date.getDay() !== 0) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
  }, []);

  // Generate time slots for the selected date
  useEffect(() => {
    if (selectedDate) {
      // In a real app, these would come from the backend based on availability
      const slots = [
        '9:00 AM', '10:00 AM', '11:00 AM', 
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
      ];
      setAvailableTimeSlots(slots);
      setSelectedTimeSlot(null);
    } else {
      setAvailableTimeSlots([]);
      setSelectedTimeSlot(null);
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setError('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTimeSlot(time);
    
    // Update the full date with the selected time
    if (selectedDate) {
      const [hours, minutes] = time.match(/(\d+):(\d+)/)?.slice(1, 3) || [];
      const isPM = time.includes('PM');
      
      const newDate = new Date(selectedDate);
      newDate.setHours(
        isPM && hours !== '12' ? parseInt(hours) + 12 : parseInt(hours),
        parseInt(minutes),
        0,
        0
      );
      
      onDateChange(newDate);
      setError('');
    }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select both a date and time');
      return;
    }
    
    onNext();
  };

  // Generate calendar days for current month view
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      const isSunday = date.getDay() === 0;
      const isSelected = selectedDate && date.getTime() === new Date(selectedDate.getTime()).setHours(0, 0, 0, 0);
      
      const isAvailable = !isPast && !isSunday;
      
      days.push(
        <div
          key={day}
          className={`h-10 flex items-center justify-center rounded-full cursor-pointer ${
            isToday ? 'font-bold' : ''
          } ${
            isSelected
              ? 'bg-primary text-white'
              : isAvailable
              ? 'hover:bg-gray-100'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          onClick={() => isAvailable && handleDateSelect(date)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const isPreviousMonthDisabled = () => {
    const today = new Date();
    return (
      currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() <= today.getMonth()
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date & Time</h2>
      
      <div className="space-y-6">
        {/* Calendar view */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              disabled={isPreviousMonthDisabled()}
              className={`p-1 rounded-full ${
                isPreviousMonthDisabled()
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h3 className="text-base font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-xs font-medium text-gray-500 text-center">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Date selection (quick view) */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Available Dates</h3>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {availableDates.slice(0, 7).map((date) => (
              <div
                key={date.toISOString()}
                className={`flex-shrink-0 w-20 h-20 rounded-lg border ${
                  selectedDate && date.toDateString() === selectedDate.toDateString()
                    ? 'border-primary bg-primary bg-opacity-5'
                    : 'border-gray-200 hover:border-primary'
                } flex flex-col items-center justify-center cursor-pointer`}
                onClick={() => handleDateSelect(date)}
              >
                <span className="text-xs font-medium text-gray-500">{getDayName(date)}</span>
                <span className="text-lg font-semibold text-gray-900">{date.getDate()}</span>
                <span className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Time slot selection */}
        {selectedDate && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Available Times for {formatDate(selectedDate)}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableTimeSlots.map((time) => (
                <div
                  key={time}
                  className={`py-2 px-3 rounded-md border text-center cursor-pointer ${
                    selectedTimeSlot === time
                      ? 'border-primary bg-primary bg-opacity-5 text-primary'
                      : 'border-gray-200 hover:border-primary text-gray-700'
                  }`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectDateStep;
