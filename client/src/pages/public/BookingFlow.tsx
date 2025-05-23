import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { getCars, createBooking, CreateBookingPayload, Car } from '../../services/api';
import SelectCarStep from '../../components/booking/SelectCarStep';
import DescribeIssueStep from '../../components/booking/DescribeIssueStep';
import SelectDateStep from '../../components/booking/SelectDateStep';
import PaymentStep from '../../components/booking/PaymentStep';
import ConfirmStep from '../../components/booking/ConfirmStep';
import AddCarModal from '../../components/cars/AddCarModal';

// Define the steps in the booking flow
const STEPS = [
  'SELECT_CAR',
  'DESCRIBE_ISSUE',
  'SELECT_DATE',
  'PAYMENT',
  'CONFIRM',
] as const;

type BookingStep = typeof STEPS[number];

const BookingFlow = () => {
  const { currentUser, getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the selected car from location state if available
  const preselectedCar = location.state?.selectedCar as Car | undefined;
  
  // State for the booking flow
  const [currentStep, setCurrentStep] = useState<BookingStep>('SELECT_CAR');
  const [selectedCar, setSelectedCar] = useState<Car | null>(preselectedCar || null);
  const [issueDescription, setIssueDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState<Date | null>(null);
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  
  // Ensure auth token is set before fetching data
  useEffect(() => {
    const setToken = async () => {
      const token = await getToken();
      if (token) {
        // Token will be set in the api service
      }
    };
    setToken();
  }, [getToken]);
  
  // If a car was preselected, move to the next step
  useEffect(() => {
    if (preselectedCar && currentStep === 'SELECT_CAR') {
      setCurrentStep('DESCRIBE_ISSUE');
    }
  }, [preselectedCar, currentStep]);

  // Fetch cars
  const { data: cars, isLoading: carsLoading } = useQuery('cars', getCars, {
    enabled: !!currentUser,
  });

  // Create booking mutation
  const createBookingMutation = useMutation(createBooking, {
    onSuccess: (data) => {
      toast.success('Booking submitted successfully!');
      navigate(`/booking/confirmation/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit booking');
    },
  });

  // Handle step navigation
  const goToNextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedCar || !issueDescription || !preferredDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const bookingData: CreateBookingPayload = {
      carId: selectedCar.id,
      issueDesc: issueDescription,
      preferredDate: preferredDate.toISOString(),
    };

    createBookingMutation.mutate(bookingData);
  };

  // Handle new car creation
  const handleAddCar = async () => {
    // This would normally call the API to create a car
    // For now, we'll just close the modal and refresh the cars list
    setIsAddCarModalOpen(false);
    await getCars();
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'SELECT_CAR':
        return (
          <SelectCarStep
            cars={cars || []}
            selectedCar={selectedCar}
            onSelectCar={setSelectedCar}
            onAddCar={() => setIsAddCarModalOpen(true)}
            onNext={goToNextStep}
            isLoading={carsLoading}
          />
        );
      case 'DESCRIBE_ISSUE':
        return (
          <DescribeIssueStep
            issueDescription={issueDescription}
            onIssueChange={setIssueDescription}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 'SELECT_DATE':
        return (
          <SelectDateStep
            selectedDate={preferredDate}
            onDateChange={setPreferredDate}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 'PAYMENT':
        return (
          <PaymentStep
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 'CONFIRM':
        return (
          <ConfirmStep
            car={selectedCar}
            issueDescription={issueDescription}
            preferredDate={preferredDate}
            onSubmit={handleSubmit}
            onBack={goToPreviousStep}
            isLoading={createBookingMutation.isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book a Repair</h1>
          <p className="mt-2 text-sm text-gray-500">
            Complete the form below to schedule your auto repair service.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div
                key={step}
                className={`flex flex-col items-center ${
                  index === STEPS.length - 1 ? 'flex-1' : 'flex-1 relative'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    STEPS.indexOf(currentStep) >= index
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="mt-2 text-xs text-center">
                  {step.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${
                      STEPS.indexOf(currentStep) > index ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current step */}
        <div className="bg-white shadow rounded-lg p-6">{renderStep()}</div>
      </div>

      {/* Add Car Modal */}
      <AddCarModal
        isOpen={isAddCarModalOpen}
        onClose={() => setIsAddCarModalOpen(false)}
        onSubmit={handleAddCar}
        isLoading={false}
      />
    </div>
  );
};

export default BookingFlow;
