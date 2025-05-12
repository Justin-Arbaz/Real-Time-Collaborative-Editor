import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-primary-700 mb-2">Account</h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Change password</span>
              <button className="px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm">Change</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Email notifications</span>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-primary-600" />
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-primary-700 mb-2">Appearance</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Theme</span>
            <select className="border border-gray-300 rounded px-2 py-1 focus:ring-primary-500 focus:border-primary-500">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-primary-700 mb-2">Danger Zone</h2>
          <button className="px-4 py-2 bg-error-600 text-white rounded hover:bg-error-700">Delete Account</button>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
