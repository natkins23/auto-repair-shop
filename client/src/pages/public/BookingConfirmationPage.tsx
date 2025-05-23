import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { CheckCircleIcon, CalendarIcon, PhoneIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { getBookingById, Booking } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const BookingConfirmationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch booking details
  const { data: booking } = useQuery<Booking>(
    ['booking', id],
    () => getBookingById(id as string),
    {
      enabled: !!id,
      onError: (err: any) => {
        setError(err.response?.data?.error || 'Failed to load booking details');
        setIsLoading(false);
      },
      onSuccess: () => {
        setIsLoading(false);
      },
    }
  );

  // Ensure auth token is set before fetching data
  useEffect(() => {
    const setToken = async () => {
      const token = await getToken();
      if (token) {
        // Token will be set in the api service
        setIsLoading(false);
      }
    };
    setToken();
  }, [getToken]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'Unable to load booking details. Please try again later.'}</p>
              </div>
              <div className="mt-4">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Booking Confirmed!</h1>
          <p className="mt-2 text-lg text-gray-500">
            Your auto repair appointment has been successfully scheduled.
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Booking Details</h2>
            <p className="mt-1 text-sm text-gray-500">
              Reference Number: <span className="font-mono font-medium">{booking.referenceNumber || booking.id}</span>
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Appointment Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(booking.preferredDate)}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Vehicle
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {booking.car?.year} {booking.car?.make} {booking.car?.model} ({booking.car?.licensePlate})
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Issue Description</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {booking.issueDesc}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {booking.status}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900">Pay at Shop</dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Contact Phone Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {booking.phoneNumber || 'Not provided'}
                </dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <ClipboardIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Booking Reference
                </dt>
                <dd className="mt-1">
                  <div className="flex items-center">
                    <span className="font-mono text-lg font-medium bg-gray-100 px-3 py-1 rounded">
                      {booking.referenceNumber || booking.id}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(booking.referenceNumber || booking.id);
                        alert('Reference number copied to clipboard!');
                      }}
                      className="ml-2 text-sm text-primary hover:text-primary-dark focus:outline-none"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Save this reference number to check your repair status later.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>You'll receive a confirmation SMS at {booking.phoneNumber || 'your provided number'} with your booking details.</li>
                  <li>Our team will review your issue before your appointment.</li>
                  <li>We'll send you status updates via SMS as your repair progresses.</li>
                  <li>You can check your repair status anytime using your booking reference number.</li>
                  <li>Please arrive 10 minutes before your scheduled time.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <Link
            to="/garage"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Return to Garage
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
