import React, { useState } from 'react';
import SocietyXpressIcon from './SocietyPlusIcon';
import { Building, User, Lock, Eye, EyeOff, LogIn, UserPlus, Truck, Shirt, ArrowLeft } from 'lucide-react';
import { Partner } from '../types/index';
import { partnerAuth } from '../lib/partnerAuth';

interface PartnerAuthProps {
  onAuthSuccess: (partner: Partner) => void;
  onBackToCustomer: () => void;
  onBackToLanding?: () => void;
}

const PartnerAuth: React.FC<PartnerAuthProps> = ({ onAuthSuccess, onBackToCustomer, onBackToLanding }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [partnerType, setPartnerType] = useState<'ironing' | 'delivery' | 'both'>('ironing');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check URL params for mode
  React.useEffect(() => {
    // Check if there's a stored mode from the landing page
    const storedMode = localStorage.getItem('partner_auth_mode');
    if (storedMode) {
      setIsSignUp(false);
      localStorage.removeItem('partner_auth_mode'); // Clean up
    } else if (storedMode === 'signup') {
      setIsSignUp(true);
      localStorage.removeItem('partner_auth_mode'); // Clean up
    }
    // If no stored mode, keep the default state (signup = true)
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (username.includes('@')) {
        throw new Error('Please enter your username only, not your full email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      let result;
      if (isSignUp) {
        result = await partnerAuth.signUp(username, password, partnerType);
      } else {
        result = await partnerAuth.signIn(username, password);
      }

      if (result.error) {
        setError(result.error);
      } else {
        onAuthSuccess(result.partner);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        {/* Back to Landing Button */}
        {onBackToLanding && (
          <div className="mb-6">
            <button
              onClick={onBackToLanding}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <SocietyXpressIcon size={64} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Partner Portal
            </span>
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Join our partner network' : 'Welcome back, partner'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Partner Type
              </label>
              <div className="space-y-3">
                <label className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  partnerType === 'ironing' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="partnerType"
                    value="ironing"
                    checked={partnerType === 'ironing'}
                    onChange={(e) => setPartnerType(e.target.value as any)}
                    className="text-green-600"
                  />
                  <Shirt className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Ironing Partner</p>
                    <p className="text-sm text-gray-600">Focus on professional ironing services</p>
                  </div>
                </label>
                
                <label className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  partnerType === 'delivery' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="partnerType"
                    value="delivery"
                    checked={partnerType === 'delivery'}
                    onChange={(e) => setPartnerType(e.target.value as any)}
                    className="text-blue-600"
                  />
                  <Truck className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Delivery Partner</p>
                    <p className="text-sm text-gray-600">Handle pickup and delivery services</p>
                  </div>
                </label>
                
                <label className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  partnerType === 'both' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="partnerType"
                    value="both"
                    checked={partnerType === 'both'}
                    onChange={(e) => setPartnerType(e.target.value as any)}
                    className="text-purple-600"
                  />
                  <div className="flex space-x-1">
                    <Shirt className="h-4 w-4 text-purple-600" />
                    <Truck className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Both Services</p>
                    <p className="text-sm text-gray-600">Provide both ironing and delivery</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <>
                {isSignUp ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                <span>{isSignUp ? 'Create Partner Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            {isSignUp ? 'Already have a partner account?' : "Don't have a partner account?"}
          </p>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            {isSignUp ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            <span>{isSignUp ? 'Sign In Instead' : 'Create Account'}</span>
          </button>
        </div>

        {/* Terms and Privacy Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By creating a partner account, you agree to our Terms & Conditions and Privacy Policy
          </p>
        </div>

        <div className="mt-6 text-center">
          <div className="flex flex-col space-y-2">
            <button
              onClick={onBackToCustomer}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              ← Back to Customer Portal
            </button>
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                ← Back to Home Page
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerAuth;