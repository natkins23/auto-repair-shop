import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  getAdminBookingDetails, 
  updateAdminBooking, 
  sendBookingNotification,
  addBookingComment,
  Booking, 
  BookingStatus, 
  UpdateBookingPayload
} from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const BookingDetailPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [statusReason, setStatusReason] = useState('');
  
  // Form state for editable fields
  const [formState, setFormState] = useState<Partial<UpdateBookingPayload>>({
    status: BookingStatus.PENDING,
    notes: '',
    totalPrice: 0,
    estimatedCompletionDate: '',
    diagnosis: '',
    partsNeeded: '',
    laborHours: 0,
    smsOptIn: false
  });

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

  // Fetch booking details
  const { 
    data: booking,
    isLoading: bookingLoading,
    isError: bookingError
  } = useQuery<Booking>(
    ['adminBooking', bookingId],
    () => getAdminBookingDetails(bookingId || ''),
    {
      enabled: !isLoading && !!bookingId,
      onSuccess: (data) => {
        // Initialize form state with current booking data
        setFormState({
          status: data.status,
          notes: data.notes || '',
          totalPrice: data.totalPrice || 0,
          estimatedCompletionDate: data.estimatedCompletionDate || '',
          diagnosis: data.diagnosis || '',
          partsNeeded: data.partsNeeded || '',
          laborHours: data.laborHours || 0,
          smsOptIn: data.smsOptIn || false
        });
      }
    }
  );

  // Update booking mutation
  const updateBookingMutation = useMutation(
    (data: { id: string; booking: UpdateBookingPayload }) => 
      updateAdminBooking(data.id, data.booking),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminBooking', bookingId]);
        toast.success('Booking updated successfully');
        setIsEditing(false);
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormState(prev => ({ ...prev, [name]: target.checked }));
    } else if (type === 'number') {
      setFormState(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle save changes with tracking updates
  const handleSaveChanges = () => {
    if (!bookingId || !booking) return;
    
    // Track what fields have changed for the activity feed
    interface ChangeItem {
      type: 'PRICE_UPDATE' | 'DIAGNOSIS' | 'COMMENT';
      content: string;
      isPublic: boolean;
    }
    
    const changes: ChangeItem[] = [];
    
    if (formState.totalPrice !== booking.totalPrice) {
      changes.push({
        type: 'PRICE_UPDATE',
        content: `Price quote updated to $${formState.totalPrice?.toFixed(2)}`,
        isPublic: true
      });
    }
    
    if (formState.diagnosis !== booking.diagnosis && formState.diagnosis?.trim()) {
      changes.push({
        type: 'DIAGNOSIS',
        content: `Diagnosis updated: ${formState.diagnosis}`,
        isPublic: true
      });
    }
    
    if (formState.partsNeeded !== booking.partsNeeded && formState.partsNeeded?.trim()) {
      changes.push({
        type: 'COMMENT',
        content: `Parts needed: ${formState.partsNeeded}`,
        isPublic: true
      });
    }
    
    if (formState.estimatedCompletionDate !== booking.estimatedCompletionDate && formState.estimatedCompletionDate) {
      const formattedDate = formatDate(formState.estimatedCompletionDate);
      changes.push({
        type: 'COMMENT',
        content: `Estimated completion date set to ${formattedDate}`,
        isPublic: true
      });
    }
    
    // Add each change as a comment
    const addComments = async () => {
      for (const change of changes) {
        try {
          await addBookingComment({
            bookingId,
            content: change.content,
            isPublic: change.isPublic,
            type: change.type as 'COMMENT' | 'DIAGNOSIS' | 'PRICE_UPDATE'
          });
        } catch (error) {
          console.error('Error adding comment:', error);
        }
      }
    };
    
    // Update the booking
    updateBookingMutation.mutate({
      id: bookingId,
      booking: formState
    }, {
      onSuccess: () => {
        // After successful update, add the comments
        if (changes.length > 0) {
          addComments();
        }
      }
    });
  };

  // Handle status update
  const handleStatusUpdate = (newStatusValue: BookingStatus) => {
    if (!bookingId || !booking) return;
    
    // Add status change reason to notes if provided
    const updatedNotes = statusReason 
      ? `${formState.notes || ''}\n[Status changed to ${newStatusValue}] ${statusReason}` 
      : formState.notes;
    
    const updatedFormState = {
      ...formState,
      status: newStatusValue,
      notes: updatedNotes
    };
    
    setFormState(updatedFormState);
    
    updateBookingMutation.mutate({
      id: bookingId,
      booking: { 
        status: newStatusValue,
        notes: updatedNotes
      }
    });
    
    // Send notification if opted in
    if (booking?.smsOptIn && booking.phoneNumber) {
      const statusMessages: Record<BookingStatus, string> = {
        [BookingStatus.PENDING]: 'Your booking is pending.',
        [BookingStatus.CONFIRMED]: 'Your booking has been confirmed.',
        [BookingStatus.IN_PROGRESS]: 'Your vehicle repair is now in progress.',
        [BookingStatus.COMPLETED]: 'Your vehicle repair has been completed and is ready for pickup.',
        [BookingStatus.CANCELLED]: 'Your booking has been cancelled.'
      };
      
      const message = `${statusMessages[newStatusValue]}${statusReason ? ` Note: ${statusReason}` : ''}`;
      
      sendNotificationMutation.mutate({
        id: bookingId,
        message
      });
    }
    
    // Reset status reason
    setStatusReason('');
  };

  // Handle send notification
  const handleSendNotification = () => {
    if (!bookingId || !notificationMessage.trim()) return;
    
    sendNotificationMutation.mutate({
      id: bookingId,
      message: notificationMessage
    });
  };

  // Format date for display
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

  if (bookingLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="mr-4 p-2 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Loading Booking Details...</h1>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bookingError || !booking) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="mr-4 p-2 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Booking Not Found</h1>
          </div>
          <div className="mt-8 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading booking details
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    The booking you're looking for could not be found or there was an error loading it.
                    Please try again or go back to the bookings list.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header with back button and title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="mr-4 p-2 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Booking {booking.referenceNumber || booking.id.substring(0, 8)}
              </h1>
              <p className="text-sm text-gray-500">
                Created on {formatDate(booking.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            {booking.phoneNumber && (
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <PaperAirplaneIcon className="-ml-0.5 mr-2 h-4 w-4" />
                Send Notification
              </button>
            )}
          </div>
        </div>

        {/* Main content area with booking details */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column - Vehicle and Customer Info */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Vehicle Information</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  booking.status === BookingStatus.PENDING
                    ? 'bg-yellow-100 text-yellow-800'
                    : booking.status === BookingStatus.CONFIRMED
                    ? 'bg-blue-100 text-blue-800'
                    : booking.status === BookingStatus.IN_PROGRESS
                    ? 'bg-indigo-100 text-indigo-800'
                    : booking.status === BookingStatus.COMPLETED
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {booking.status}
                </span>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Make & Model</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {booking.car ? `${booking.car.year} ${booking.car.make} ${booking.car.model}` : 'N/A'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">License Plate</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {booking.car?.licensePlate || 'N/A'}
                    </dd>
                  </div>
                  {booking.car?.vin && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">VIN</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.car.vin}</dd>
                    </div>
                  )}
                  {booking.car?.mileage && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Mileage</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.car.mileage} miles</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Information</h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Reference #</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {booking.referenceNumber || booking.id.substring(0, 8)}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {booking.phoneNumber ? (
                        <a href={`tel:${booking.phoneNumber}`} className="text-primary hover:text-primary-dark">
                          {booking.phoneNumber}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Appointment</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(booking.preferredDate)}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">SMS Notifications</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {isEditing ? (
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="smsOptIn"
                            checked={formState.smsOptIn}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-2">Opt-in for SMS updates</span>
                        </label>
                      ) : (
                        <span className={booking.smsOptIn ? 'text-green-600' : 'text-red-600'}>
                          {booking.smsOptIn ? 'Opted in' : 'Not opted in'}
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Right column - Repair Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Repair Details</h3>
                <button
                  onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isEditing ? (
                    <>
                      <CheckIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <PencilIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      Edit Details
                    </>
                  )}
                </button>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <select
                              name="status"
                              value={formState.status || booking.status}
                              onChange={(e) => handleStatusUpdate(e.target.value as BookingStatus)}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            >
                              <option value={BookingStatus.PENDING}>Pending</option>
                              <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                              <option value={BookingStatus.IN_PROGRESS}>In Progress</option>
                              <option value={BookingStatus.COMPLETED}>Completed</option>
                              <option value={BookingStatus.CANCELLED}>Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="statusReason" className="block text-sm font-medium text-gray-700">
                              Reason for Status Change
                            </label>
                            <textarea
                              id="statusReason"
                              name="statusReason"
                              rows={2}
                              value={statusReason}
                              onChange={(e) => setStatusReason(e.target.value)}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder="Explain why you're changing the status (optional)"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === BookingStatus.PENDING
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === BookingStatus.CONFIRMED
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === BookingStatus.IN_PROGRESS
                            ? 'bg-indigo-100 text-indigo-800'
                            : booking.status === BookingStatus.COMPLETED
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Issue Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {booking.issueDesc}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Diagnosis</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {isEditing ? (
                        <textarea
                          name="diagnosis"
                          rows={3}
                          value={formState.diagnosis}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter diagnosis details"
                        />
                      ) : (
                        formState.diagnosis || 'No diagnosis provided yet'
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Parts Needed</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {isEditing ? (
                        <textarea
                          name="partsNeeded"
                          rows={3}
                          value={formState.partsNeeded}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="List parts needed for repair"
                        />
                      ) : (
                        formState.partsNeeded || 'No parts listed yet'
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Price Quote</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {isEditing ? (
                        <div className="relative rounded-md shadow-sm mt-1 max-w-xs">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="totalPrice"
                            value={formState.totalPrice}
                            onChange={handleInputChange}
                            className="focus:ring-primary focus:border-primary block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      ) : (
                        <span className="font-medium">
                          {formState.totalPrice ? `$${formState.totalPrice.toFixed(2)}` : 'Not quoted yet'}
                        </span>
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Labor Hours</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {isEditing ? (
                        <input
                          type="number"
                          name="laborHours"
                          value={formState.laborHours}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full max-w-xs sm:text-sm border-gray-300 rounded-md"
                          placeholder="0"
                          step="0.5"
                          min="0"
                        />
                      ) : (
                        <span>{formState.laborHours ? `${formState.laborHours} hours` : 'Not estimated yet'}</span>
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Estimated Completion</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          name="estimatedCompletionDate"
                          value={formState.estimatedCompletionDate}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full max-w-xs sm:text-sm border-gray-300 rounded-md"
                        />
                      ) : (
                        <span>
                          {formState.estimatedCompletionDate 
                            ? formatDate(formState.estimatedCompletionDate) 
                            : 'Not estimated yet'}
                        </span>
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {isEditing ? (
                        <textarea
                          name="notes"
                          rows={4}
                          value={formState.notes}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Add internal notes here"
                        />
                      ) : (
                        <div className="whitespace-pre-line">{formState.notes || 'No notes added'}</div>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Activity Timeline placeholder */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Timeline</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">History of updates and communications</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <p className="text-gray-500 text-center py-8">Activity timeline will be implemented in the next step.</p>
          </div>
        </div>
        
        {/* Notification Modal */}
        {isNotificationModalOpen && booking && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Send Notification
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Send an SMS notification to {booking.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter your message here"
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-2 sm:text-sm"
                      onClick={handleSendNotification}
                      disabled={!notificationMessage.trim() || sendNotificationMutation.isLoading}
                    >
                      {sendNotificationMutation.isLoading ? 'Sending...' : 'Send'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1 sm:text-sm"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetailPage;
