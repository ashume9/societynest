import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Building, 
  Phone, 
  Clock, 
  Users, 
  Save,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User, Society, Tower, Flat } from '../types/index';

interface ProfileSetupProps {
  user: User;
  onComplete: (user: User) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [societies, setSocieties] = useState<Society[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [loadingTowers, setLoadingTowers] = useState(false);
  const [loadingFlats, setLoadingFlats] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    username: user.username,
    phone: user.phone || '',
    society_id: user.society_id || '',
    tower_id: user.tower_id || '',
    flat_id: user.flat_id || '',
    adults: user.adults || 2,
    kids: user.kids || 0,
    pickup_slot: user.pickup_slot || 'morning' as 'morning' | 'evening',
    delivery_slot: user.delivery_slot || 'evening' as 'morning' | 'evening',
  });

  // Fetch societies on component mount
  useEffect(() => {
    fetchSocieties();
  }, []);

  // Fetch towers when society changes
  useEffect(() => {
    if (formData.society_id) {
      fetchTowers(formData.society_id);
    } else {
      setTowers([]);
      setFlats([]);
      setFormData(prev => ({ ...prev, tower_id: '', flat_id: '' }));
    }
  }, [formData.society_id]);

  // Fetch flats when tower changes
  useEffect(() => {
    if (formData.tower_id) {
      fetchFlats(formData.tower_id);
    } else {
      setFlats([]);
      setFormData(prev => ({ ...prev, flat_id: '' }));
    }
  }, [formData.tower_id]);

  const fetchSocieties = async () => {
    try {
      setLoadingSocieties(true);
      setError('');
      
      console.log('Fetching societies...');
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching societies:', error.message, error.details);
        setError(`Failed to load societies: ${error.message}`);
        return;
      }
      
      console.log('Successfully fetched societies:', data?.length || 0, 'items');
      setSocieties(data || []);
      
      if (!data || data.length === 0) {
        setError('No societies found in the database. Please contact support.');
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingSocieties(false);
    }
  };

  const fetchTowers = async (societyId: string) => {
    try {
      setLoadingTowers(true);
      setError('');
      
      console.log('Fetching towers for society:', societyId);
      const { data, error } = await supabase
        .from('towers')
        .select('*')
        .eq('society_id', societyId)
        .order('name');
      
      if (error) {
        console.error('Error fetching towers:', error);
        setError(`Failed to load towers: ${error.message}`);
        return;
      }
      
      console.log('Successfully fetched towers:', data?.length || 0, 'items');
      setTowers(data || []);
    } catch (error) {
      console.error('Error fetching towers:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingTowers(false);
    }
  };

  const fetchFlats = async (towerId: string) => {
    try {
      setLoadingFlats(true);
      setError('');
      
      console.log('Fetching flats for tower:', towerId);
      const { data, error } = await supabase
        .from('flats')
        .select('*')
        .eq('tower_id', towerId)
        .order('number');
      
      if (error) {
        console.error('Error fetching flats:', error);
        setError(`Failed to load flats: ${error.message}`);
        return;
      }
      
      console.log('Successfully fetched flats:', data?.length || 0, 'items');
      setFlats(data || []);
    } catch (error) {
      console.error('Error fetching flats:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingFlats(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'adults' || name === 'kids' ? parseInt(value) || 0 : value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name || null,
          email: formData.email || null,
          username: formData.username,
          phone: formData.phone,
          society_id: formData.society_id || null,
          tower_id: formData.tower_id || null,
          flat_id: formData.flat_id || null,
          adults: formData.adults,
          kids: formData.kids,
          pickup_slot: formData.pickup_slot,
          delivery_slot: formData.delivery_slot,
        })
        .eq('id', user.id)
        .select(`
          *,
          societies(name),
          towers(name),
          flats(number)
        `)
        .single();

      if (error) throw error;

      const updatedUser: User = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        username: data.username,
        phone: data.phone,
        society_id: data.society_id,
        tower_id: data.tower_id,
        flat_id: data.flat_id,
        adults: data.adults,
        kids: data.kids,
        pickup_slot: data.pickup_slot as 'morning' | 'evening',
        delivery_slot: data.delivery_slot as 'morning' | 'evening',
        society_name: data.societies?.name,
        tower_name: data.towers?.name,
        flat_number: data.flats?.number,
      };

      onComplete(updatedUser);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            Help us provide better service by completing your profile information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Society *
              </label>
              <select
                name="society_id"
                value={formData.society_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
                disabled={loadingSocieties}
              >
                <option value="">
                  {loadingSocieties ? 'Loading societies...' : societies.length === 0 ? 'No societies available' : 'Select your society'}
                </option>
                {societies.map(society => (
                  <option key={society.id} value={society.id}>{society.name}</option>
                ))}
              </select>
              {societies.length === 0 && !loadingSocieties && (
                <p className="text-sm text-gray-500 mt-1">
                  No societies available. Please refresh the page or contact support.
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tower *
              </label>
              <select
                name="tower_id"
                value={formData.tower_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
                disabled={loadingTowers || !formData.society_id}
              >
                <option value="">
                  {loadingTowers ? 'Loading towers...' : 
                   !formData.society_id ? 'Select society first' :
                   towers.length === 0 ? 'No towers available' : 'Select tower'}
                </option>
                {towers.map(tower => (
                  <option key={tower.id} value={tower.id}>{tower.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flat Number *
              </label>
              <select
                name="flat_id"
                value={formData.flat_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
                disabled={loadingFlats || !formData.tower_id}
              >
                <option value="">
                  {loadingFlats ? 'Loading flats...' : 
                   !formData.tower_id ? 'Select tower first' :
                   flats.length === 0 ? 'No flats available' : 'Select flat'}
                </option>
                {flats.map(flat => (
                  <option key={flat.id} value={flat.id}>{flat.number}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family Size
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Adults</label>
                  <input
                    type="number"
                    name="adults"
                    value={formData.adults}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kids</label>
                  <input
                    type="number"
                    name="kids"
                    value={formData.kids}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Service Preferences
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Pickup Time Preference</label>
                <div className="space-y-2">
                  <label className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    formData.pickup_slot === 'morning' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="pickup_slot"
                      value="morning"
                      checked={formData.pickup_slot === 'morning'}
                      onChange={handleInputChange}
                      className="text-indigo-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Morning</p>
                      <p className="text-xs text-gray-600">8:00 AM - 11:00 AM</p>
                    </div>
                  </label>
                  <label className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    formData.pickup_slot === 'evening' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="pickup_slot"
                      value="evening"
                      checked={formData.pickup_slot === 'evening'}
                      onChange={handleInputChange}
                      className="text-indigo-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Evening</p>
                      <p className="text-xs text-gray-600">4:00 PM - 7:00 PM</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-2">Delivery Time Preference</label>
                <div className="space-y-2">
                  <label className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    formData.delivery_slot === 'morning' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="delivery_slot"
                      value="morning"
                      checked={formData.delivery_slot === 'morning'}
                      onChange={handleInputChange}
                      className="text-indigo-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Morning</p>
                      <p className="text-xs text-gray-600">8:00 AM - 11:00 AM</p>
                    </div>
                  </label>
                  <label className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    formData.delivery_slot === 'evening' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="delivery_slot"
                      value="evening"
                      checked={formData.delivery_slot === 'evening'}
                      onChange={handleInputChange}
                      className="text-indigo-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Evening</p>
                      <p className="text-xs text-gray-600">4:00 PM - 7:00 PM</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  fetchSocieties();
                }}
                className="text-red-600 text-sm underline mt-1"
              >
                Try again
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Complete Setup</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
        
        {/* Debug info - remove in production */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-xs text-gray-600">
          <p><strong>Debug Info:</strong></p>
          <p>• Societies loaded: {societies.length} {loadingSocieties ? '(loading...)' : ''}</p>
          <p>• Towers loaded: {towers.length} {loadingTowers ? '(loading...)' : ''}</p>
          <p>• Flats loaded: {flats.length} {loadingFlats ? '(loading...)' : ''}</p>
          <p>• Selected society: {formData.society_id || 'none'}</p>
          <p>• Selected tower: {formData.tower_id || 'none'}</p>
          <p>• Selected flat: {formData.flat_id || 'none'}</p>
          {error && <p className="text-red-600">• Error: {error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;