import React, { useState } from 'react';
import { 
  Shirt, 
  ArrowRight,
  Clock,
  CheckCircle,
  Phone,
  MapPin,
  Users,
  Edit3,
  Package,
  History,
  User as UserIcon,
  Mail
} from 'lucide-react';
import { User } from '../types/index';

interface DashboardProps {
  user: User;
  onUserUpdate?: (user: User) => void;
  onViewChange?: (view: 'dashboard' | 'ironing' | 'profile' | 'orders') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUserUpdate, onViewChange }) => {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user.username}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your express solution for society services. Professional ironing, laundry, and more delivered to your doorstep.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Ironing Service Card */}
          <div
            onClick={() => onViewChange?.('ironing')}
            className="group cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex items-center justify-between mb-4">
              <Shirt className="h-10 w-10" />
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Available Now</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Quick Ironing Service</h2>
            <p className="text-blue-100 mb-4 text-sm">Book now, select items during pickup</p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Starting from</p>
                <p className="text-lg font-bold">₹15 <span className="text-sm font-normal">per piece</span></p>
              </div>
              <div className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm font-medium">Book Now</span>
              </div>
            </div>
          </div>

          {/* Order History Card */}
          <div
            onClick={() => onViewChange?.('orders')}
            className="group cursor-pointer bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex items-center justify-between mb-4">
              <History className="h-10 w-10" />
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                <span className="text-sm font-medium">View All</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Order History</h2>
            <p className="text-purple-100 mb-4 text-sm">Track your past and current orders</p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">All orders</p>
                <p className="text-lg font-bold">View & Track</p>
              </div>
              <div className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm font-medium">View Orders</span>
              </div>
            </div>
          </div>

        </div>

        {/* Upcoming Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* E-Waste Collection Service - Coming Soon */}
          <div className="relative group bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white opacity-75 cursor-not-allowed overflow-hidden">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2">
                <span className="text-green-700 font-bold text-sm">Coming Q2 2025</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                <span className="text-sm font-medium">Coming Soon</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">E-Waste Collection</h2>
            <p className="text-green-100 mb-4 text-sm">Responsible disposal with certified partners</p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Eco-friendly</p>
                <p className="text-lg font-bold">Scheduled Pickup</p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">Q2 2025</span>
              </div>
            </div>
          </div>

          {/* Old Clothes Exchange Service - Coming Soon */}
          <div className="relative group bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white opacity-75 cursor-not-allowed overflow-hidden">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2">
                <span className="text-orange-700 font-bold text-sm">Coming Q3 2025</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
                <span className="text-sm font-medium">Coming Soon</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Clothes Exchange</h2>
            <p className="text-orange-100 mb-4 text-sm">Turn old clothes into Amazon coupons</p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm mb-1">Earn rewards</p>
                <p className="text-lg font-bold">₹50-500 <span className="text-sm font-normal">per kg</span></p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">Q3 2025</span>
              </div>
            </div>
          </div>
        </div>


        {/* Service Features */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Our Services?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600">Professional service with 100% satisfaction guarantee</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast & Reliable</h3>
              <p className="text-gray-600">Quick turnaround times with reliable pickup & delivery</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Doorstep Service</h3>
              <p className="text-gray-600">Convenient pickup and delivery right to your apartment</p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;