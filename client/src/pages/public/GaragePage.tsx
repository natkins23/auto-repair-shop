import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getCars, createCar, updateCar, deleteCar, Car, CreateCarPayload } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AddCarModal from '../../components/cars/AddCarModal';
import EditCarModal from '../../components/cars/EditCarModal';

const GaragePage = () => {
  const { currentUser, getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

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

  // Fetch cars
  const { data: cars, isLoading, error } = useQuery('cars', getCars, {
    enabled: !!currentUser,
  });

  // Create car mutation
  const createCarMutation = useMutation(createCar, {
    onSuccess: () => {
      queryClient.invalidateQueries('cars');
      toast.success('Vehicle added successfully!');
      setIsAddModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add vehicle');
    },
  });

  // Update car mutation
  const updateCarMutation = useMutation(
    (data: { id: string; car: CreateCarPayload }) => updateCar(data.id, data.car),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cars');
        toast.success('Vehicle updated successfully!');
        setIsEditModalOpen(false);
        setSelectedCar(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update vehicle');
      },
    }
  );

  // Delete car mutation
  const deleteCarMutation = useMutation(deleteCar, {
    onSuccess: () => {
      queryClient.invalidateQueries('cars');
      toast.success('Vehicle removed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to remove vehicle');
    },
  });

  // Handle add car
  const handleAddCar = (car: CreateCarPayload) => {
    createCarMutation.mutate(car);
  };

  // Handle edit car
  const handleEditCar = (car: CreateCarPayload) => {
    if (selectedCar) {
      updateCarMutation.mutate({ id: selectedCar.id, car });
    }
  };

  // Handle delete car
  const handleDeleteCar = (id: string) => {
    if (window.confirm('Are you sure you want to remove this vehicle?')) {
      deleteCarMutation.mutate(id);
    }
  };

  // Open edit modal
  const openEditModal = (car: Car) => {
    setSelectedCar(car);
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Garage</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Vehicle
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading vehicles</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Please try again later or contact support if the problem persists.</p>
                </div>
              </div>
            </div>
          </div>
        ) : cars && cars.length > 0 ? (
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {cars.map((car) => (
                <li key={car.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-gray-900">
                            {car.year} {car.make} {car.model}
                          </h2>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500">License: {car.licensePlate}</span>
                            {car.mileage && (
                              <span className="ml-4 text-sm text-gray-500">Mileage: {car.mileage.toLocaleString()} mi</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(car)}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        <Link
                          to="/booking"
                          state={{ selectedCar: car }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Book Service
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">No vehicles yet</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Add your first vehicle to get started with booking repairs.</p>
              </div>
              <div className="mt-5">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Your First Vehicle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Car Modal */}
      <AddCarModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCar}
        isLoading={createCarMutation.isLoading}
      />

      {/* Edit Car Modal */}
      {selectedCar && (
        <EditCarModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCar(null);
          }}
          onSubmit={handleEditCar}
          car={selectedCar}
          isLoading={updateCarMutation.isLoading}
        />
      )}
    </div>
  );
};

export default GaragePage;
