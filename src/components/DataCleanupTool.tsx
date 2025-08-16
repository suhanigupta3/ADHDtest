import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  deleteAllUserData, 
  deleteAllUserDataIndividually, 
  checkUserDataExists 
} from '../utils/deleteUserData';

const DataCleanupTool: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [useBatchMode, setUseBatchMode] = useState(true);

  const handleCheckData = async () => {
    if (!currentUser) {
      setMessage('❌ No user logged in');
      return;
    }

    setIsLoading(true);
    setMessage('🔍 Checking user data...');
    
    try {
      await checkUserDataExists(currentUser);
      setMessage('✅ Data check completed. Check console for details.');
    } catch (error) {
      setMessage(`❌ Error checking data: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!currentUser) {
      setMessage('❌ No user logged in');
      return;
    }

    setIsLoading(true);
    setMessage('🗑️ Deleting all user data...');
    
    try {
      if (useBatchMode) {
        await deleteAllUserData(currentUser);
      } else {
        await deleteAllUserDataIndividually(currentUser);
      }
      setMessage('🎉 All user data deleted successfully!');
      setShowConfirmation(false);
    } catch (error) {
      setMessage(`❌ Error deleting data: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Data Cleanup Tool</h2>
        <p className="text-red-600">Please log in to use this tool.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🧹 Data Cleanup Tool</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Current User:</strong> {currentUser.email}
        </p>
        <p className="text-sm text-gray-600">
          <strong>User ID:</strong> {currentUser.uid}
        </p>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useBatchMode}
            onChange={(e) => setUseBatchMode(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">
            Use batch mode (faster, but if it fails, try individual mode)
          </span>
        </label>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCheckData}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔍 Check What Data Exists
        </button>

        <button
          onClick={() => setShowConfirmation(true)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🗑️ Delete All User Data
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded text-sm ${
          message.includes('❌') ? 'bg-red-100 text-red-800' :
          message.includes('✅') ? 'bg-green-100 text-green-800' :
          message.includes('🔍') ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {message}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-lg font-bold text-red-800 mb-4">⚠️ Confirm Deletion</h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                This will <strong>permanently delete</strong> all data for user:
              </p>
              <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                {currentUser.email}
              </p>
            </div>

            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">
                <strong>This action will delete:</strong>
              </p>
              <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                <li>All game data (PatternMatch, BounceBack, FlutterFocus, BerryBlitz)</li>
                <li>Game rounds and scores</li>
                <li>User consents</li>
                <li>Game progress tracking</li>
                <li>Any other user-specific data</li>
              </ul>
            </div>

            <p className="text-sm text-red-600 mb-4">
              <strong>This action cannot be undone!</strong>
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteData}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCleanupTool;
