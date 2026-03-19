import React, { useState } from 'react';
import SocietyXpressIcon from './SocietyPlusIcon';
import { 
  ArrowLeft, 
  Shirt, 
  Clock, 
  Calendar,
  Package,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User, ClothingType } from '../types/index';

interface SimpleIroningServiceProps {
  user: User;
  onBack: () => void;
}

const SimpleIroningService: React.FC<SimpleIroningServiceProps> = ({ user, onBack }) => {
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [showClothingOptions, setShowClothingOptions] = useState(false);
  const [serviceType, setServiceType] = useState<'normal' | 'express'>('normal');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState<'morning' | 'evening'>(user.pickup_slot);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setMinPickupDate();
    fetchClothingTypes();
  }, []);

  const fetchClothingTypes = async () => {
    const { data, error } = await supabase
      .from('clothing_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching clothing types:', error);
    } else {
      setClothingTypes(data || []);
    }
  };
  const setMinPickupDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 5); // Minimum 5 hours in advance
    const minDate = now.toISOString().split('T')[0];
    setPickupDate(minDate);
  };

  const updateItemCount = (itemId: string, count: number) => {
    if (count <= 0) {
      const newItems = { ...selectedItems };
      delete newItems[itemId];
      setSelectedItems(newItems);
    } else {
      setSelectedItems(prev => ({ ...prev, [itemId]: count }));
    }
  };

  const getRateForService = (clothingType: ClothingType) => {
    switch (serviceType) {
      case 'express':
        return clothingType.express_rate;
      default:
        return clothingType.normal_rate;
    }
  };

  const getTotalAmount = () => {
    return Object.entries(selectedItems).reduce((total, [itemId, count]) => {
      const clothingType = clothingTypes.find(ct => ct.id === itemId);
      if (!clothingType) return total;
      return total + (getRateForService(clothingType) * count);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(selectedItems).reduce((total, count) => total + count, 0);
  };
  const getEstimatedDelivery = () => {
    const pickup = new Date(pickupDate);
    let deliveryHours = 48; // Normal service
    
    if (serviceType === 'express') deliveryHours = 4;
    
    pickup.setHours(pickup.getHours() + deliveryHours);
    return pickup;
  };

const isExpressServiceValid = () => {
    if (serviceType !== 'express') return true;
    
    const now = new Date();
    const selectedPickup = new Date(pickupDate);
    
    // If pickup is today
    if (selectedPickup.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      const pickupHour = pickupSlot === 'morning' ? 8 : 16;
      
      // Check if there's enough time for 4-hour express service
      const hoursUntilPickup = pickupHour - currentHour;
      const hoursUntilEndOfDay = 19 - currentHour; // Last delivery at 7 PM
      
      return (hoursUntilPickup + 4) <= hoursUntilEndOfDay;
    }
    
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!isExpressServiceValid()) {
      setError('Express service not available for selected time. Please choose a different service type or pickup time.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const estimatedDelivery = getEstimatedDelivery();
      const totalAmount = getTotalItems() > 0 ? getTotalAmount() : 0;
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          pickup_date: pickupDate,
          pickup_slot: pickupSlot,
          service_type: serviceType,
          total_amount: totalAmount,
          estimated_delivery: estimatedDelivery.toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items if any were selected
      if (getTotalItems() > 0) {
        const orderItems = Object.entries(selectedItems).map(([clothingTypeId, quantity]) => {
          const clothingType = clothingTypes.find(ct => ct.id === clothingTypeId)!;
          const rate = getRateForService(clothingType);
          return {
            order_id: orderData.id,
            clothing_type_id: clothingTypeId,
            quantity,
            rate,
            subtotal: quantity * rate,
          };
        });

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
        setSelectedItems({});
        onBack();
      }, 3000);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Your ironing order has been confirmed. {getTotalItems() > 0 
              ? `Total: ${getTotalItems()} items for ₹${getTotalAmount()}`
              : 'Our pickup partner will contact you to finalize items and pricing.'
            }
          </p>
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
            {getTotalItems() > 0 && (
              <p className="text-gray-600">Items: {getTotalItems()} pieces</p>
            )}
            <p className="text-gray-600">Service: {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</p>
            <p className="text-gray-600">Pickup: {new Date(pickupDate).toLocaleDateString()}</p>
            <p className="text-gray-600">Estimated Delivery: {getEstimatedDelivery().toLocaleDateString()}</p>
            {getTotalItems() > 0 && (
              <p className="text-gray-600 font-semibold">Total: ₹{getTotalAmount()}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <SocietyXpressIcon size={32} className="rounded-xl" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">SocietyXpress</h1>
                <p className="text-xs text-gray-500">Ironing Service</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Header */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Shirt className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Professional Ironing Service</h1>
                  <p className="text-gray-600">Book now, optionally select items in advance</p>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ol className="text-blue-800 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    <span>Choose your service type and pickup time</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    <span>Optionally select items in advance or during pickup</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    <span>Our pickup partner will collect your clothes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                    <span>Get your clothes professionally ironed and delivered</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Optional Items Selection Accordion */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <button
                onClick={() => setShowClothingOptions(!showClothingOptions)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Select Items (Optional)</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Pre-select items or let our pickup partner help you choose
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getTotalItems() > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {getTotalItems()} items
                    </span>
                  )}
                  {showClothingOptions ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {showClothingOptions && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clothingTypes.map((clothingType) => (
                      <div
                        key={clothingType.id}
                        className="border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{clothingType.name}</h4>
                            <p className="text-sm font-medium text-blue-600">
                              ₹{getRateForService(clothingType)} per piece
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Quantity:</span>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateItemCount(clothingType.id, (selectedItems[clothingType.id] || 0) - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {selectedItems[clothingType.id] || 0}
                            </span>
                            <button
                              onClick={() => updateItemCount(clothingType.id, (selectedItems[clothingType.id] || 0) + 1)}
                              className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Service Type Selection */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Choose Service Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    type: 'normal',
                    name: 'Normal Service',
                    time: '48 Hours',
                    description: 'Standard turnaround time',
                  },
                  {
                    type: 'express',
                    name: 'Express Service',
                    time: '4 Hours',
                    description: 'Ultra-fast service',
                  },
                ].map((service) => (
                  <label
                    key={service.type}
                    className={`cursor-pointer p-6 border rounded-2xl transition-all ${
                      serviceType === service.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="serviceType"
                      value={service.type}
                      checked={serviceType === service.type}
                      onChange={(e) => setServiceType(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 mb-1">{service.name}</h4>
                      <p className="text-blue-600 font-medium mb-2">{service.time}</p>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <a
                        href="#pricing"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium text-blue-500 hover:text-blue-700 underline underline-offset-2"
                      >
                        View Pricing
                      </a>
                    </div>
                  </label>
                ))}
              </div>
              
              {serviceType === 'express' && !isExpressServiceValid() && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                  <div className="h-5 w-5 text-red-500 mt-0.5">⚠️</div>
                  <div>
                    <p className="text-red-800 font-medium">Express service not available</p>
                    <p className="text-red-600 text-sm">
                      Not enough time for 4-hour express delivery today. Please choose a different service type or pickup date.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pickup Schedule */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Pickup Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Slot
                  </label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value as 'morning' | 'evening')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="morning">Morning (8:00 AM - 11:00 AM)</option>
                    <option value="evening">Evening (4:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Summary</h3>
              
              {getTotalItems() > 0 && (
                <>
                  <div className="space-y-3 mb-6">
                    {Object.entries(selectedItems).map(([clothingTypeId, count]) => {
                      const clothingType = clothingTypes.find(ct => ct.id === clothingTypeId);
                      if (!clothingType) return null;
                      const rate = getRateForService(clothingType);
                      return (
                        <div key={clothingTypeId} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{clothingType.name}</span>
                            <p className="text-xs text-gray-500">{count} × ₹{rate}</p>
                          </div>
                          <span className="font-semibold text-gray-900">₹{count * rate}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-4 mb-6">
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span>Total Amount</span>
                      <span className="text-blue-600">₹{getTotalAmount()}</span>
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-4 mb-6">
                {getTotalItems() > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Total Items</span>
                    <span className="font-medium">{getTotalItems()} pieces</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700">Service Type</span>
                  <span className="font-medium capitalize">{serviceType}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700">Pricing</span>
                  <a
                    href="#pricing"
                    className="font-medium text-blue-500 hover:text-blue-700 underline underline-offset-2 text-sm"
                  >
                    View Pricing
                  </a>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700">Pickup Date</span>
                  <span className="font-medium">{new Date(pickupDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700">Pickup Slot</span>
                  <span className="font-medium capitalize">{pickupSlot}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Pickup: {new Date(pickupDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Estimated Delivery: {getEstimatedDelivery().toLocaleDateString()} 
                    ({serviceType === 'normal' ? '48h' : '4h'})
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !isExpressServiceValid()}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5" />
                    <span>
                      {getTotalItems() > 0 ? `Book Service - ₹${getTotalAmount()}` : 'Book Service'}
                    </span>
                  </>
                )}
              </button>
              
              {getTotalItems() === 0 && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Final pricing will be confirmed during pickup based on selected items
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleIroningService;