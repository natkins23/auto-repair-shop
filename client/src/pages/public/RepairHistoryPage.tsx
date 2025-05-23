import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { getRepairHistory } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

const RepairHistoryPage = () => {
  const { currentUser, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'inProgress'>('all');

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

  // Fetch repair history
  const { data: repairs, isLoading, error } = useQuery('repairHistory', getRepairHistory, {
    enabled: !!currentUser,
  });

  // Filter repairs based on active tab
  const filteredRepairs = repairs?.filter(repair => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return repair.status === 'COMPLETED';
    if (activeTab === 'inProgress') return ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(repair.status);
    return true;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Repair History</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All Repairs
            </button>
            <button
              onClick={() => setActiveTab('inProgress')}
              className={`${
                activeTab === 'inProgress'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`${
                activeTab === 'completed'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Completed
            </button>
          </nav>
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
                <h3 className="text-sm font-medium text-red-800">Error loading repair history</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Please try again later or contact support if the problem persists.</p>
                </div>
              </div>
            </div>
          </div>
        ) : filteredRepairs && filteredRepairs.length > 0 ? (
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredRepairs.map((repair) => (
                <li key={repair.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-gray-900">
                            {repair.car?.year} {repair.car?.make} {repair.car?.model}
                          </h2>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500">Reference: {repair.referenceNumber}</span>
                            <span className="ml-4 text-sm text-gray-500">Date: {formatDate(repair.preferredDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(repair.status)}`}>
                          {repair.status.replace('_', ' ')}
                        </span>
                        {repair.totalPrice && (
                          <span className="mt-2 text-sm font-medium text-gray-900">
                            ${repair.totalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">{repair.issueDesc}</p>
                      {repair.diagnosis && (
                        <div className="mt-2">
                          <h3 className="text-sm font-medium text-gray-900">Diagnosis:</h3>
                          <p className="text-sm text-gray-600">{repair.diagnosis}</p>
                        </div>
                      )}
                      {repair.partsNeeded && (
                        <div className="mt-2">
                          <h3 className="text-sm font-medium text-gray-900">Parts Needed:</h3>
                          <p className="text-sm text-gray-600">{repair.partsNeeded}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">No repair history</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>You don't have any repair records yet.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairHistoryPage;
