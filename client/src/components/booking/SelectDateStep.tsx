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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [error, setError] = useState('');
  
  // Use local state for the selected time slot
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  // Initialize selectedTimeSlot from localStorage if available
  useEffect(() => {
    const savedTimeSlot = localStorage.getItem('selectedTimeSlot');
    if (savedTimeSlot) {
      setSelectedTimeSlot(savedTimeSlot);
    }
  }, []);

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
      // Reset the time slot when date changes
      localStorage.removeItem('selectedTimeSlot');
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setError('');
  };

  const handleTimeSelect = (time: string) => {
    // Store the selected time in localStorage for persistence
    localStorage.setItem('selectedTimeSlot', time);
    // Update our local state
    setSelectedTimeSlot(time);
    
    // Update the full date with the selected time
    if (selectedDate) {
      try {
        // Extract hours and minutes from the time string
        const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
        const match = time.match(timeRegex);
        
        if (match) {
          // Destructure the match array, ignoring the first element (full match)
          const [, hoursStr, minutesStr, period] = match;
          let hours = parseInt(hoursStr, 10);
          const minutes = parseInt(minutesStr, 10);
          
          // Convert to 24-hour format if PM
          if (period.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
          } else if (period.toUpperCase() === 'AM' && hours === 12) {
            // 12 AM should be 0 hours in 24-hour format
            hours = 0;
          }
          
          const newDate = new Date(selectedDate);
          newDate.setHours(hours, minutes, 0, 0);
          
          // Update the parent component with the new date that includes time
          onDateChange(newDate);
          setError('');
          console.log(`Selected time: ${time}, Date set to: ${newDate.toLocaleString()}`);
        } else {
          console.error(`Failed to parse time: ${time}`);
        }
      } catch (error) {
        console.error('Error parsing time:', error);
      }
    }
  };

  // Debug function to log the current state
  const logSelectionState = () => {
    console.log('Current selection state:');
    console.log('- selectedDate:', selectedDate ? selectedDate.toLocaleString() : 'null');
    console.log('- selectedTimeSlot:', selectedTimeSlot);
    console.log('- Has hours/minutes:', selectedDate ? 
      `${selectedDate.getHours()}:${selectedDate.getMinutes()}` : 'N/A');
  };

  const handleContinue = () => {
    // Log the current state for debugging
    logSelectionState();
    
    // Validate that both date and time are selected
    if (!selectedDate) {
      console.error('No date selected');
      setError('Please select a date');
      return;
    }
    
    if (!selectedTimeSlot) {
      console.error('No time slot selected');
      setError('Please select a time');
      return;
    }
    
    // Make sure we have the correct date with time before continuing
    try {
      // Extract hours and minutes from the time string again to ensure consistency
      const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
      const match = selectedTimeSlot.match(timeRegex);
      
      if (match) {
        const [, hoursStr, minutesStr, period] = match;
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        
        // Convert to 24-hour format if PM
        if (period.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period.toUpperCase() === 'AM' && hours === 12) {
          // 12 AM should be 0 hours in 24-hour format
          hours = 0;
        }
        
        const finalDate = new Date(selectedDate);
        finalDate.setHours(hours, minutes, 0, 0);
        
        // Make sure we update the parent component with the final date and time
        onDateChange(finalDate);
        console.log(`Final date and time set: ${finalDate.toLocaleString()}`);
        
        // Continue to next step
        onNext();
      } else {
        console.error('Failed to parse time format:', selectedTimeSlot);
        setError(`Invalid time format: ${selectedTimeSlot}`);
      }
    } catch (error) {
      console.error('Error finalizing date/time:', error);
      setError('Error processing your selection. Please try again.');
    }
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
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Available Times for {formatDate(selectedDate)}
            </h3>
            
            {/* Time slots as clickable divs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableTimeSlots.map((time) => (
                <div 
                  key={time}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Clicked time: ${time}`);
                    // Directly call handleTimeSelect which will update the parent component
                    if (selectedDate) {
                      handleTimeSelect(time);
                    }
                  }}
                  className={`p-4 rounded-md border text-center cursor-pointer
                    ${selectedTimeSlot === time 
                      ? 'border-primary bg-primary bg-opacity-10 shadow-sm' 
                      : 'border-gray-200 hover:border-primary hover:bg-gray-50'} 
                    transition-all duration-200`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className={`font-medium ${selectedTimeSlot === time ? 'text-primary' : 'text-gray-700'}`}>
                      {time}
                    </span>
                    
                    {selectedTimeSlot === time && (
                      <span className="mt-2 bg-primary text-white text-xs font-bold py-1 px-2 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedTimeSlot && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-2 text-sm font-medium text-green-800">
                    You've selected: <span className="font-bold">{selectedTimeSlot}</span> on <span className="font-bold">{formatDate(selectedDate)}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => onBack()}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (selectedDate && selectedTimeSlot) {
                console.log('Continue clicked with valid selections');
                handleContinue();
              } else {
                console.error('Missing date or time selection');
                setError('Please select both a date and time');
                
                // Scroll to error message if needed
                setTimeout(() => {
                  const errorElement = document.querySelector('.text-red-600');
                  if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 100);
              }
            }}
            disabled={!selectedDate || !selectedTimeSlot}
            className={`px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              selectedDate && selectedTimeSlot
                ? 'border-transparent text-white bg-primary hover:bg-primary-dark'
                : 'border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed'
            }`}
          >
            {selectedDate && selectedTimeSlot ? 'Continue' : 'Select Date & Time'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectDateStep;
