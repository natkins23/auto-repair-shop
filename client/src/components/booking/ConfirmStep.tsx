import { Car } from '../../services/api';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface ConfirmStepProps {
  car: Car | null;
  issueDescription: string;
  preferredDate: Date | null;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const ConfirmStep = ({
  car,
  issueDescription,
  preferredDate,
  onSubmit,
  onBack,
  isLoading,
}: ConfirmStepProps) => {
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not selected';
    
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

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm Your Booking</h2>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
          
          <div className="space-y-4">
            {/* Vehicle details */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Vehicle</h4>
              {car ? (
                <p className="mt-1 text-sm text-gray-900">
                  {car.year} {car.make} {car.model} ({car.licensePlate})
                </p>
              ) : (
                <p className="mt-1 text-sm text-red-600">No vehicle selected</p>
              )}
            </div>
            
            {/* Issue description */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Issue Description</h4>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {issueDescription || 'No description provided'}
              </p>
            </div>
            
            {/* Appointment date */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Appointment Date</h4>
              <p className="mt-1 text-sm text-gray-900">{formatDate(preferredDate)}</p>
            </div>
            
            {/* Payment method */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
              <p className="mt-1 text-sm text-gray-900">Pay at Shop</p>
            </div>
          </div>
        </div>
        
        {/* Terms and conditions */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Terms and Conditions</h3>
          <div className="text-xs text-gray-500 space-y-2">
            <p>
              By confirming this booking, you agree to the following terms:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>If you need to cancel or reschedule, please do so at least 24 hours in advance.</li>
              <li>A diagnostic fee may apply, which will be credited toward any repair work performed.</li>
              <li>Additional repairs may be necessary after initial inspection, which will require your approval.</li>
              <li>We will contact you via SMS with updates about your repair status.</li>
            </ul>
          </div>
        </div>
        
        {/* Confirmation message */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Ready to Submit</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your booking details are ready to be submitted. Click the "Confirm Booking" button below to finalize your appointment.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !car || !issueDescription || !preferredDate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmStep;
