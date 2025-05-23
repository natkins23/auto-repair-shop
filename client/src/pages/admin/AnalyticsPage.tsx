import { useState } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

// Mock sales data
const monthlySalesData = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 14200 },
  { month: 'Mar', revenue: 16800 },
  { month: 'Apr', revenue: 15300 },
  { month: 'May', revenue: 17500 },
  { month: 'Jun', revenue: 19200 },
  { month: 'Jul', revenue: 18400 },
  { month: 'Aug', revenue: 20100 },
  { month: 'Sep', revenue: 22300 },
  { month: 'Oct', revenue: 21500 },
  { month: 'Nov', revenue: 23800 },
  { month: 'Dec', revenue: 25600 }
];

// Mock service data
const serviceData = [
  { name: 'Oil Change', count: 156, revenue: 7800 },
  { name: 'Brake Service', count: 89, revenue: 13350 },
  { name: 'Tire Replacement', count: 112, revenue: 22400 },
  { name: 'Engine Repair', count: 45, revenue: 27000 },
  { name: 'Transmission Service', count: 38, revenue: 19000 },
  { name: 'A/C Service', count: 67, revenue: 10050 },
  { name: 'Battery Replacement', count: 93, revenue: 9300 },
  { name: 'Wheel Alignment', count: 78, revenue: 7800 }
];

const AnalyticsPage = () => {
  const { darkMode } = useTheme();
  const [timeFrame, setTimeFrame] = useState<'monthly' | 'yearly'>('monthly');
  const [chartView, setChartView] = useState<'revenue' | 'services'>('revenue');
  
  // Calculate total revenue
  const totalRevenue = monthlySalesData.reduce((sum, month) => sum + month.revenue, 0);
  
  // Calculate average service time (mock data)
  const averageServiceTime = '2.3 hours';
  
  // Calculate customer satisfaction (mock data)
  const customerSatisfaction = '4.8/5';
  
  // Calculate total services
  const totalServices = serviceData.reduce((sum, service) => sum + service.count, 0);

  // Get the maximum revenue for scaling the chart
  const maxRevenue = Math.max(...monthlySalesData.map(month => month.revenue));
  
  return (
    <div className={`py-6 ${darkMode ? 'dark:bg-gray-900 dark:text-white' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Revenue Analytics</h1>
        
        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-md p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Revenue</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-md p-3">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Services</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">{totalServices}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-md p-3">
                  <ClockIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Avg. Service Time</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">{averageServiceTime}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-md p-3">
                  <ChartBarIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Customer Satisfaction</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">{customerSatisfaction}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Controls */}
        <div className="mt-8 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setChartView('revenue')}
              className={`px-4 py-2 rounded-md ${
                chartView === 'revenue' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setChartView('services')}
              className={`px-4 py-2 rounded-md ${
                chartView === 'services' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Services
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setTimeFrame('monthly')}
              className={`px-4 py-2 rounded-md ${
                timeFrame === 'monthly' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeFrame('yearly')}
              className={`px-4 py-2 rounded-md ${
                timeFrame === 'yearly' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
        
        {/* Revenue Chart */}
        {chartView === 'revenue' && (
          <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {timeFrame === 'monthly' ? 'Monthly Revenue' : 'Yearly Revenue'}
            </h3>
            <div className="h-80 relative">
              <div className="absolute inset-0 flex items-end">
                {monthlySalesData.map((month, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full mx-1 bg-primary hover:bg-primary-dark transition-all duration-300"
                      style={{ 
                        height: `${(month.revenue / maxRevenue) * 100}%`,
                        maxWidth: '30px',
                        margin: '0 auto'
                      }}
                    >
                      <div className="w-full h-full relative group">
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                          ${month.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{month.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Services Chart */}
        {chartView === 'services' && (
          <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Service Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Count
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Avg. Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {serviceData.map((service, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {service.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ${service.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ${Math.round(service.revenue / service.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
