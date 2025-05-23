import { useState } from 'react';
import { 
  MoonIcon, 
  SunIcon, 
  BellIcon, 
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const SettingsPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to change the password
    console.log('Password change requested');
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    // Show success message
    alert('Password changed successfully!');
  };
  
  const handleNotificationSave = () => {
    // In a real app, this would call an API to update notification preferences
    console.log('Notification preferences saved:', { emailNotifications, smsNotifications });
    // Show success message
    alert('Notification preferences saved!');
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        
        {/* Theme Settings */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Appearance
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Customize how the admin panel looks
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {darkMode ? (
                  <MoonIcon className="h-6 w-6 text-indigo-500 mr-3" />
                ) : (
                  <SunIcon className="h-6 w-6 text-yellow-500 mr-3" />
                )}
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`${darkMode ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                <span className="sr-only">Toggle dark mode</span>
                <span
                  className={`${darkMode ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
        </div>
        
        {/* Password Settings */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <KeyIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Password
              </h3>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Change your admin account password
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  name="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  name="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <BellIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Notifications
              </h3>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Manage your notification preferences
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`${emailNotifications ? 'bg-primary' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                >
                  <span className="sr-only">Toggle email notifications</span>
                  <span
                    className={`${emailNotifications ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">SMS Notifications</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsNotifications(!smsNotifications)}
                  className={`${smsNotifications ? 'bg-primary' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                >
                  <span className="sr-only">Toggle SMS notifications</span>
                  <span
                    className={`${smsNotifications ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleNotificationSave}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
