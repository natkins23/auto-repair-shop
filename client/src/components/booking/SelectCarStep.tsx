import { Car } from '../../services/api';
import { PlusIcon } from '@heroicons/react/24/outline';

interface SelectCarStepProps {
  cars: Car[];
  selectedCar: Car | null;
  onSelectCar: (car: Car) => void;
  onAddCar: () => void;
  onNext: () => void;
  isLoading: boolean;
}

const SelectCarStep = ({
  cars,
  selectedCar,
  onSelectCar,
  onAddCar,
  onNext,
  isLoading,
}: SelectCarStepProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Your Vehicle</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You don't have any vehicles in your garage yet.</p>
          <button
            onClick={onAddCar}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {cars.map((car) => (
              <div
                key={car.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCar?.id === car.id
                    ? 'border-primary bg-primary bg-opacity-5'
                    : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                }`}
                onClick={() => onSelectCar(car)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border ${
                      selectedCar?.id === car.id ? 'border-primary' : 'border-gray-300'
                    } flex items-center justify-center mr-3`}
                  >
                    {selectedCar?.id === car.id && (
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <p className="text-sm text-gray-500">
                      License: {car.licensePlate}
                      {car.mileage && ` • Mileage: ${car.mileage.toLocaleString()} mi`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add new car card */}
            <div
              className="border border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-gray-50 flex items-center justify-center"
              onClick={onAddCar}
            >
              <div className="text-center">
                <PlusIcon className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="mt-2 text-sm font-medium text-gray-900">Add New Vehicle</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onNext}
              disabled={!selectedCar}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                selectedCar
                  ? 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SelectCarStep;
