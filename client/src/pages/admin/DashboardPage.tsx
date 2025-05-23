import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  PencilIcon, 
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

import { 
  getAdminBookings, 
  updateAdminBooking, 
  sendBookingNotification,
  Booking, 
  BookingStatus, 
  UpdateBookingPayload 
} from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

type StatusTabType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const DashboardPage = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTabType>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(BookingStatus.PENDING);

  // Ensure auth token is set before fetching data
  useEffect(() => {
    const setToken = async () => {
      const token = await getToken();
      if (token) {
        setIsLoading(false);
      }
    };
    setToken();
  }, [getToken]);

  // Fetch all bookings for admin
  const { data: bookings = [] } = useQuery<Booking[]>(
    'adminBookings',
    getAdminBookings,
    {
      enabled: !isLoading,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Update booking mutation
  const updateBookingMutation = useMutation(
    (data: { id: string; booking: UpdateBookingPayload }) => 
      updateAdminBooking(data.id, data.booking),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminBookings');
        toast.success('Booking updated successfully');
        setSelectedBooking(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update booking');
      },
    }
  );

  // Send notification mutation
  const sendNotificationMutation = useMutation(
    (data: { id: string; message: string }) => 
      sendBookingNotification(data.id, data.message),
    {
      onSuccess: () => {
        toast.success('Notification sent successfully');
        setIsNotificationModalOpen(false);
        setNotificationMessage('');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to send notification');
      },
    }
  );

  // Handle send notification
  const handleSendNotification = () => {
    if (!selectedBooking || !notificationMessage.trim()) return;
    
    sendNotificationMutation.mutate({
      id: selectedBooking.id,
      message: notificationMessage
    });
  };

  // Status counts are now calculated in the statusCounts object

  // Format booking ID to be like BK-001
  const formatBookingId = (id: string) => {
    const num = id.split('-').pop() || '000';
    return `BK-${num.padStart(3, '0')}`;
  };

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    if (activeTab === 'ALL') return bookings;
    return bookings.filter((booking: Booking) => booking.status === activeTab);
  }, [bookings, activeTab]);

  // Status counts for the tabs
  const statusCounts = useMemo(() => ({
    ALL: bookings.length,
    PENDING: bookings.filter((b: Booking) => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter((b: Booking) => b.status === 'CONFIRMED').length,
    IN_PROGRESS: bookings.filter((b: Booking) => b.status === 'IN_PROGRESS').length,
    COMPLETED: bookings.filter((b: Booking) => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((b: Booking) => b.status === 'CANCELLED').length,
  }), [bookings]);

  // Notification Modal
  const NotificationModal = () => {
    if (!isNotificationModalOpen) return null;
    
    return (
      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                  <PaperAirplaneIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Send Notification
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Send a notification to {selectedBooking?.phoneNumber ? `${selectedBooking.phoneNumber}` : 'the customer'} about their booking.
                    </p>
                    <div className="mt-4">
                      <label htmlFor="notification-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Message
                      </label>
                      <textarea
                        id="notification-message"
                        name="notification-message"
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Enter your message here..."
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleSendNotification}
              >
                Send
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  setIsNotificationModalOpen(false);
                  setNotificationMessage('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6">
      <NotificationModal />
      
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Management</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          View and manage all customer bookings
        </p>
        
        {/* Status Tabs */}
        <div className="mt-6 w-full">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 w-full" aria-label="Tabs">
              {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((tab) => {
                const tabLabel = tab.split('_').join(' ');
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as StatusTabType)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {tabLabel} ({statusCounts[tab as keyof typeof statusCounts]})
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="mt-6 w-full">
          <div className="w-full overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                        Booking ID
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">
                        Service
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                          Loading bookings...
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatBookingId(booking.id)}
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 text-center">
                            <div className="flex flex-col items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {booking.user?.name || 'Guest User'}
                              </div>
                              {booking.user?.email && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                  {booking.user.email}
                                </div>
                              )}
                              {booking.phoneNumber && (
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                  {booking.phoneNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 text-center">
                            <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                              {booking.issueDesc}
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {booking.car?.year} {booking.car?.make} {booking.car?.model}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {booking.car?.licensePlate}
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(booking.preferredDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(booking.preferredDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-center">
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === 'PENDING' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                                  : booking.status === 'CONFIRMED' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                  : booking.status === 'IN_PROGRESS' 
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                                  : booking.status === 'COMPLETED' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {booking.status.split('_').join(' ')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                              <button
                                onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                className="flex items-center px-2 py-1 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                                title="View details"
                              >
                                <EyeIcon className="h-3 w-3 mr-1" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setSelectedStatus(booking.status);
                                  setIsEditModalOpen(true);
                                }}
                                className="flex items-center px-2 py-1 text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-800/50 rounded-md transition-colors"
                                title="Edit status"
                              >
                                <PencilIcon className="h-3 w-3 mr-1" />
                                <span>Status</span>
                              </button>
                              {booking.phoneNumber && (
                                <a 
                                  href={`tel:${booking.phoneNumber}`}
                                  className="flex items-center px-2 py-1 text-xs text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-800/50 rounded-md transition-colors"
                                  title="Call customer"
                                >
                                  <PhoneIcon className="h-3 w-3 mr-1" />
                                  <span>Call</span>
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setNotificationMessage(`Hi ${booking.user?.name || 'there'}, `);
                                  setIsNotificationModalOpen(true);
                                }}
                                className="flex items-center px-2 py-1 text-xs text-purple-700 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:hover:bg-purple-800/50 rounded-md transition-colors"
                                title="Send message"
                              >
                                <EnvelopeIcon className="h-3 w-3 mr-1" />
                                <span>Message</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Booking Status Modal */}
      {isEditModalOpen && selectedBooking && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Update Booking Status
                </h3>
                <div className="mt-4 space-y-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto p-2">
                    {Object.values(BookingStatus).map((status) => {
                      const statusText = status.split('_').join(' ');
                      let bgColor = 'bg-gray-100';
                      let textColor = 'text-gray-800';
                      let darkBgColor = 'dark:bg-gray-700';
                      
                      switch(status) {
                        case 'PENDING':
                          bgColor = 'bg-yellow-100';
                          textColor = 'text-yellow-800';
                          darkBgColor = 'dark:bg-yellow-900';
                          break;
                        case 'CONFIRMED':
                          bgColor = 'bg-blue-100';
                          textColor = 'text-blue-800';
                          darkBgColor = 'dark:bg-blue-900';
                          break;
                        case 'IN_PROGRESS':
                          bgColor = 'bg-indigo-100';
                          textColor = 'text-indigo-800';
                          darkBgColor = 'dark:bg-indigo-900';
                          break;
                        case 'COMPLETED':
                          bgColor = 'bg-green-100';
                          textColor = 'text-green-800';
                          darkBgColor = 'dark:bg-green-900';
                          break;
                        case 'CANCELLED':
                          bgColor = 'bg-red-100';
                          textColor = 'text-red-800';
                          darkBgColor = 'dark:bg-red-900';
                          break;
                      }
                      
                      return (
                        <div 
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={`${bgColor} ${textColor} ${darkBgColor} px-4 py-3 rounded-md cursor-pointer flex items-center ${selectedStatus === status ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}
                        >
                          <span className="flex-1">{statusText}</span>
                          {selectedStatus === status && (
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateBookingMutation.mutateAsync({
                        id: selectedBooking.id,
                        booking: { status: selectedStatus },
                      });
                      setIsEditModalOpen(false);
                      toast.success('Booking status updated successfully');
                    } catch (error) {
                      toast.error('Failed to update booking status');
                    }
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
