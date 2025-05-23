import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

type UserInfo = {
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
};

interface UserInfoStepProps {
  initialData?: Partial<UserInfo>;
  onSubmit: (data: UserInfo) => void;
  onBack: () => void;
}

export default function UserInfoStep({ initialData, onSubmit, onBack }: UserInfoStepProps) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    vehicleMileage: '',
    serviceHistoryNotes: '',
    smsOptIn: true,
    ...initialData
  });

  // Auto-fill from Google account if available
  useEffect(() => {
    if (currentUser) {
      // Split the name into first and last name if available
      const nameParts = currentUser.name ? currentUser.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || currentUser.email || ''
        // Keep the existing phone number if any
      }));
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      vehicleMileage: formData.vehicleMileage,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Contact Information</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Please provide your contact details so we can keep you updated about your booking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              First name *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last name *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address *
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone number *
            </label>
            <div className="mt-1">
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                placeholder="+1 (555) 555-5555"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Street address
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              State / Province
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ZIP / Postal code
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="vehicleMileage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Vehicle Mileage
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="vehicleMileage"
                name="vehicleMileage"
                value={formData.vehicleMileage}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                placeholder="e.g. 45000"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="serviceHistoryNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Service History / Additional Notes
            </label>
            <div className="mt-1">
              <textarea
                id="serviceHistoryNotes"
                name="serviceHistoryNotes"
                rows={3}
                value={formData.serviceHistoryNotes}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                placeholder="Any previous service history or additional information we should know?"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="smsOptIn"
                  name="smsOptIn"
                  type="checkbox"
                  checked={formData.smsOptIn}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="smsOptIn" className="font-medium text-gray-700 dark:text-gray-300">
                  I want to receive text message updates about my appointment
                </label>
                <p className="text-gray-500 dark:text-gray-400">
                  We'll send you reminders and updates about your service appointment.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Back
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
