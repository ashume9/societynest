import React from 'react';
import SocietyXpressIcon from './SocietyPlusIcon';
import CustomerNotifications from './CustomerNotifications';
import { Shirt, LogOut, User as UserIcon, Edit3, ChevronDown } from 'lucide-react';
import { User } from '../types/index';

interface NavigationProps {
  user: User;
  onSignOut: () => void;
  onDashboardClick?: () => void;
  onManageProfile?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onSignOut, onDashboardClick, onManageProfile }) => {
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onDashboardClick}
          >
            <SocietyXpressIcon size={40} className="rounded-xl" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">SocietyXpress</h1>
              <p className="text-xs text-gray-500">Ironing Service</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 relative">
            <CustomerNotifications user={user} />
            
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.full_name || user.username}
                </p>
                <p className="text-xs text-gray-500">
                  {user.society_name && user.tower_name && user.flat_number 
                    ? `${user.tower_name}-${user.flat_number}`
                    : 'Society Member'
                  }
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </div>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    onManageProfile?.();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Manage Profile</span>
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => {
                    onSignOut();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default Navigation;