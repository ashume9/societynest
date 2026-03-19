import React from 'react';
import SocietyXpressIcon from './SocietyPlusIcon';
import { Building } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <SocietyXpressIcon size={64} />
        </div>
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading SocietyXpress...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;