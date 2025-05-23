import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  getAllCars, 
  createAdminCar, 
  updateAdminCar, 
  deleteAdminCar,
  Car, 
  CreateCarPayload, 
  UpdateCarPayload 
} from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const VehiclesPage = () => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<CreateCarPayload>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: ''
  });
  const queryClient = useQueryClient();

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

  // Fetch all cars
  const { data: cars = [], isLoading: carsLoading } = useQuery<Car[]>(
    'adminCars',
    getAllCars,
    {
      enabled: !isLoading,
    }
  );

  // Create car mutation
  const createCarMutation = useMutation(
    (data: CreateCarPayload) => createAdminCar(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCars');
        toast.success('Vehicle added successfully');
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to add vehicle');
      },
    }
  );

  // Update car mutation
  const updateCarMutation = useMutation(
    (data: { id: string; car: UpdateCarPayload }) => 
      updateAdminCar(data.id, data.car),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCars');
        toast.success('Vehicle updated successfully');
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update vehicle');
      },
    }
  );

  // Delete car mutation
  const deleteCarMutation = useMutation(
    (id: string) => deleteAdminCar(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCars');
        toast.success('Vehicle deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to delete vehicle');
      },
    }
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCar) {
      updateCarMutation.mutate({
        id: editingCar.id,
        car: formData
      });
    } else {
      createCarMutation.mutate(formData);
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: ''
    });
    setEditingCar(null);
    setIsModalOpen(false);
  };

  // Open edit modal
  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      licensePlate: car.licensePlate
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteCarMutation.mutate(id);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Vehicles</h1>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Vehicle
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Filters Section - Full width */}
        <div className="mt-8 w-full">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="w-full sm:w-1/3">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="Search vehicles..."
                />
              </div>
              <div className="w-full sm:w-1/3">
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Make
                </label>
                <select
                  id="make"
                  name="make"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option>All Makes</option>
                  <option>Honda</option>
                  <option>Toyota</option>
                  <option>Ford</option>
                </select>
              </div>
              <div className="w-full sm:w-1/3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehicles Table */}
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Vehicle
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          License Plate
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Owner
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {carsLoading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            Loading vehicles...
                          </td>
                        </tr>
                      ) : cars.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            No vehicles found
                          </td>
                        </tr>
                      ) : (
                        cars.map((car) => (
                          <tr key={car.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {car.year} {car.make} {car.model}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {car.licensePlate}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {car.userId || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2 justify-end">
                                <button
                                  onClick={() => handleEdit(car)}
                                  className="text-primary hover:text-primary-dark"
                                  title="Edit vehicle"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(car.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete vehicle"
                                >
                                  <TrashIcon className="h-5 w-5" />
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
      </div>

      {/* Add/Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingCar ? 'Edit Vehicle' : 'Add New Vehicle'}
                  </h3>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="mt-5">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                      Make
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="make"
                        id="make"
                        required
                        value={formData.make}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="model"
                        id="model"
                        required
                        value={formData.model}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="year"
                        id="year"
                        required
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
                      License Plate
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="licensePlate"
                        id="licensePlate"
                        required
                        value={formData.licensePlate}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>


                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-2 sm:text-sm"
                    disabled={createCarMutation.isLoading || updateCarMutation.isLoading}
                  >
                    {createCarMutation.isLoading || updateCarMutation.isLoading
                      ? 'Saving...'
                      : editingCar
                      ? 'Update'
                      : 'Add'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
