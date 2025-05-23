import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Car, CreateCarPayload } from '../../services/api';

interface EditCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (car: CreateCarPayload) => void;
  car: Car;
  isLoading: boolean;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

const EditCarModal = ({ isOpen, onClose, onSubmit, car, isLoading }: EditCarModalProps) => {
  const [formData, setFormData] = useState<CreateCarPayload>({
    make: car.make,
    model: car.model,
    year: car.year,
    licensePlate: car.licensePlate,
    mileage: car.mileage,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when car prop changes
  useEffect(() => {
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      licensePlate: car.licensePlate,
      mileage: car.mileage,
    });
  }, [car]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    }
    
    if (formData.mileage !== undefined && (isNaN(formData.mileage) || formData.mileage < 0)) {
      newErrors.mileage = 'Mileage must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? 
        (value ? parseInt(value, 10) : undefined) : 
        value,
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    Edit Vehicle
                  </Dialog.Title>
                  <div className="mt-4">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                            Make
                          </label>
                          <input
                            type="text"
                            name="make"
                            id="make"
                            value={formData.make}
                            onChange={handleChange}
                            className={`mt-1 block w-full border ${
                              errors.make ? 'border-red-300' : 'border-gray-300'
                            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                          />
                          {errors.make && (
                            <p className="mt-1 text-sm text-red-600">{errors.make}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                            Model
                          </label>
                          <input
                            type="text"
                            name="model"
                            id="model"
                            value={formData.model}
                            onChange={handleChange}
                            className={`mt-1 block w-full border ${
                              errors.model ? 'border-red-300' : 'border-gray-300'
                            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                          />
                          {errors.model && (
                            <p className="mt-1 text-sm text-red-600">{errors.model}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                            Year
                          </label>
                          <select
                            name="year"
                            id="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          >
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
                            License Plate
                          </label>
                          <input
                            type="text"
                            name="licensePlate"
                            id="licensePlate"
                            value={formData.licensePlate}
                            onChange={handleChange}
                            className={`mt-1 block w-full border ${
                              errors.licensePlate ? 'border-red-300' : 'border-gray-300'
                            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                          />
                          {errors.licensePlate && (
                            <p className="mt-1 text-sm text-red-600">{errors.licensePlate}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
                            Mileage (optional)
                          </label>
                          <input
                            type="number"
                            name="mileage"
                            id="mileage"
                            value={formData.mileage === undefined ? '' : formData.mileage}
                            onChange={handleChange}
                            className={`mt-1 block w-full border ${
                              errors.mileage ? 'border-red-300' : 'border-gray-300'
                            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                          />
                          {errors.mileage && (
                            <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default EditCarModal;
