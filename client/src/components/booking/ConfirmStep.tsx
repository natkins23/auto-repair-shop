import { Car } from '../../services/api';
import { PhoneIcon, UserIcon, EnvelopeIcon, HomeIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  vehicleMileage: string;
  serviceHistoryNotes: string;
  smsOptIn: boolean;
}

interface ConfirmStepProps {
  car: Car | null;
  issueDescription: string;
  preferredDate: Date | null;
  userInfo: UserInfo;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ConfirmStep: React.FC<ConfirmStepProps> = ({
  car,
  issueDescription,
  preferredDate,
  userInfo,
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(userInfo.phoneNumber);
  const [phoneError, setPhoneError] = useState('');

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (value && !validatePhoneNumber(value)) {
      setPhoneError('Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneError) return;
    onSubmit();
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not selected';
    
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Your Booking</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Please review your information before submitting your booking request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Customer Information</h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center space-x-4">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {userInfo.firstName} {userInfo.lastName}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{userInfo.email}</span>
            </div>
            <div className="flex items-start space-x-4">
              <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    phoneError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Phone number"
                />
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{phoneError}</p>
                )}
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <HomeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  {userInfo.streetAddress}<br />
                  {userInfo.city}, {userInfo.state} {userInfo.zipCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        {car && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vehicle Information</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 dark:text-gray-300">
                {car.year} {car.make} {car.model}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                VIN: {car.vin}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mileage: {userInfo.vehicleMileage || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Service Details */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Service Details</h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-start space-x-4">
              <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  {formatDate(preferredDate)}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Issue Description</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {issueDescription}
              </p>
            </div>
            {userInfo.serviceHistoryNotes && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Service History Notes</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {userInfo.serviceHistoryNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Communication Preferences */}
        <div className="flex items-center">
          <input
            id="sms-opt-in"
            name="sms-opt-in"
            type="checkbox"
            checked={userInfo.smsOptIn}
            readOnly
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="sms-opt-in" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            I want to receive text message updates about my appointment
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !!phoneError}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                Confirm Booking
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfirmStep;
