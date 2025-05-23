import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookingByReference, getBookings, Booking, BookingStatus } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const RepairStatusPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lookupMode, setLookupMode] = useState(false);
  const navigate = useNavigate();
  
  // Fetch user's bookings if they're logged in
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!currentUser || authLoading) return;
      
      try {
        setIsLoading(true);
        const userBookings = await getBookings();
        setBookings(userBookings);
        setLookupMode(false);
      } catch (err) {
        console.error('Error fetching user bookings:', err);
        setLookupMode(true); // Fall back to lookup mode if fetching fails
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserBookings();
  }, [currentUser, authLoading]);
  
  // Determine if we should show lookup form or user's bookings
  useEffect(() => {
    // If user is not logged in or is in guest mode, show lookup form
    if (!currentUser || currentUser.isGuest) {
      setLookupMode(true);
    }
  }, [currentUser]);

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referenceNumber.trim() || !phoneNumber.trim()) {
      setError('Please enter both reference number and phone number');
      toast.error('Please enter both reference number and phone number');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getBookingByReference(referenceNumber, phoneNumber);
      setSelectedBooking(result);
      toast.success('Repair status found!');
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      const errorMessage = err.response?.data?.error || 'Booking not found. Please check your reference number and phone number.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
    setError(null);
  };
  
  const handleToggleLookupMode = () => {
    setLookupMode(!lookupMode);
    setSelectedBooking(null);
    setError(null);
  };
  
  // formatDate function is defined below

  const getStatusStepNumber = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 1;
      case BookingStatus.CONFIRMED:
        return 2;
      case BookingStatus.IN_PROGRESS:
        return 3;
      case BookingStatus.COMPLETED:
        return 4;
      case BookingStatus.CANCELLED:
        return 0;
      default:
        return 0;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.IN_PROGRESS:
        return 'bg-indigo-100 text-indigo-800';
      case BookingStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Track Your Repair
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          {lookupMode 
            ? 'Enter your booking reference number and phone number to check the status of your repair'
            : 'View the status of your current repairs'
          }
        </p>
      </div>

      {/* Toggle between user bookings and reference lookup */}
      {currentUser && !currentUser.isGuest && (
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={handleToggleLookupMode}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {lookupMode ? 'View My Repairs' : 'Look Up By Reference'}
          </button>
        </div>
      )}

      {/* Lookup Form */}
      {lookupMode && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleLookupSubmit} className="space-y-6">
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                  Booking Reference Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="reference"
                    id="reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. BK-1234"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. 555-123-4567"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isLoading ? 'Checking...' : 'Check Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User's Bookings List */}
      {!lookupMode && bookings.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Current Repairs
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Select a booking to view detailed status information
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li 
                  key={booking.id} 
                  className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${selectedBooking?.id === booking.id ? 'bg-gray-50' : ''}`}
                  onClick={() => handleBookingSelect(booking)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary truncate">
                        {booking.car?.make} {booking.car?.model} ({booking.car?.licensePlate})
                      </p>
                      <p className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="truncate">{booking.issueDesc}</span>
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(booking.preferredDate)}
                      </p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!lookupMode && bookings.length === 0 && !isLoading && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">You don't have any active repairs</p>
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Book a Repair
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-4 mb-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Back to Home
        </button>
      </div>

      {selectedBooking && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Repair Status
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details and current status of your repair
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Reference Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {selectedBooking.referenceNumber}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Vehicle
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {selectedBooking.car ? `${selectedBooking.car.year} ${selectedBooking.car.make} ${selectedBooking.car.model} (${selectedBooking.car.licensePlate})` : 'Vehicle information not available'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Issue Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {selectedBooking.issueDesc}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Appointment Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(selectedBooking.preferredDate)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Current Status
                </dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </dd>
              </div>
              {selectedBooking.notes && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Notes
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {selectedBooking.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Status Timeline */}
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-md leading-6 font-medium text-gray-900 mb-4">
              Repair Progress
            </h4>
            <div className="relative">
              {/* Progress Bar */}
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary ${
                    selectedBooking.status === BookingStatus.CANCELLED ? 'w-0' : 
                    selectedBooking.status === BookingStatus.PENDING ? 'w-1/4' : 
                    selectedBooking.status === BookingStatus.CONFIRMED ? 'w-2/4' : 
                    selectedBooking.status === BookingStatus.IN_PROGRESS ? 'w-3/4' : 'w-full'
                  }`}
                ></div>
              </div>
              
              {/* Status Steps */}
              <div className="flex justify-between">
                <div className={`text-center ${selectedBooking.status === BookingStatus.CANCELLED ? 'text-red-500' : getStatusStepNumber(selectedBooking.status) >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-2 ${
                    selectedBooking.status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-500' : 
                    getStatusStepNumber(selectedBooking.status) >= 1 ? 'bg-primary text-white' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                  <div className="text-xs">Pending</div>
                </div>
                
                <div className={`text-center ${getStatusStepNumber(selectedBooking.status) >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-2 ${
                    getStatusStepNumber(selectedBooking.status) >= 2 ? 'bg-primary text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <div className="text-xs">Confirmed</div>
                </div>
                
                <div className={`text-center ${getStatusStepNumber(selectedBooking.status) >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-2 ${
                    getStatusStepNumber(selectedBooking.status) >= 3 ? 'bg-primary text-white' : 'bg-gray-200'
                  }`}>
                    3
                  </div>
                  <div className="text-xs">In Progress</div>
                </div>
                
                <div className={`text-center ${getStatusStepNumber(selectedBooking.status) >= 4 ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-2 ${
                    getStatusStepNumber(selectedBooking.status) >= 4 ? 'bg-primary text-white' : 'bg-gray-200'
                  }`}>
                    4
                  </div>
                  <div className="text-xs">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairStatusPage;
