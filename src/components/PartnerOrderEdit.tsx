import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Shirt, 
  Clock, 
  Calendar,
  Package,
  CheckCircle,
  Plus,
  Minus,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Partner, ClothingType } from '../types/index';

interface PartnerOrder {
  id: string;
  user_id: string;
  pickup_date: string;
  pickup_slot: 'morning' | 'evening';
  service_type: 'normal' | 'priority' | 'express';
  total_amount: number;
  estimated_delivery: string;
  status: string;
  assigned_ironing_partner_id: string | null;
  assigned_delivery_partner_id: string | null;
  ironing_started_at: string | null;
  ironing_completed_at: string | null;
  delivery_started_at: string | null;
  delivery_completed_at: string | null;
  created_at: string;
  users: {
    full_name: string | null;
    username: string | null;
    phone: string | null;
    societies: { name: string } | null;
    towers: { name: string } | null;
    flats: { number: string } | null;
  } | null;
  order_items: Array<{
    id: string;
    order_id: string;
    clothing_type_id: string;
    quantity: number;
    rate: number;
    subtotal: number;
    clothing_types: { name: string } | null;
  }>;
}

interface PartnerOrderEditProps {
  partner: Partner;
  order: PartnerOrder;
  onBack: () => void;
  onOrderUpdated: () => void;
}

const PartnerOrderEdit: React.FC<PartnerOrderEditProps> = ({ partner, order, onBack, onOrderUpdated }) => {
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([]);
  const [editFormData, setEditFormData] = useState({
    pickup_date: order.pickup_date,
    pickup_slot: order.pickup_slot,
    service_type: order.service_type,
    selectedItems: {} as { [key: string]: number }
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    fetchClothingTypes();
    
    // Populate form with current order data
    const selectedItems: { [key: string]: number } = {};
    order.order_items.forEach(item => {
      selectedItems[item.clothing_type_id] = item.quantity;
    });
    
    setEditFormData(prev => ({
      ...prev,
      selectedItems
    }));
  }, [order]);

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

  const updateItemCount = (itemId: string, count: number) => {
    if (count <= 0) {
      const newItems = { ...editFormData.selectedItems };
      delete newItems[itemId];
      setEditFormData(prev => ({ ...prev, selectedItems: newItems }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        selectedItems: { ...prev.selectedItems, [itemId]: count }
      }));
    }
  };

  const getRateForService = (clothingType: ClothingType, serviceType: string) => {
    switch (serviceType) {
      case 'express':
        return clothingType.express_rate;
      case 'priority':
        return clothingType.priority_rate;
      default:
        return clothingType.normal_rate;
    }
  };

  const getTotalAmount = () => {
    return Object.entries(editFormData.selectedItems).reduce((total, [itemId, count]) => {
      const clothingType = clothingTypes.find(ct => ct.id === itemId);
      if (!clothingType) return total;
      return total + (getRateForService(clothingType, editFormData.service_type) * count);
    }, 0);
  };

  const getEditFormTotalItems = () => {
    return Object.values(editFormData.selectedItems).reduce((total, count) => total + count, 0);
  };

  const getEstimatedDelivery = () => {
    const pickup = new Date(editFormData.pickup_date);
    let deliveryHours = 48; // Normal service
    
    if (editFormData.service_type === 'priority') deliveryHours = 24;
    if (editFormData.service_type === 'express') deliveryHours = 4;
    
    pickup.setHours(pickup.getHours() + deliveryHours);
    return pickup;
  };

  const isExpressServiceValid = () => {
    if (editFormData.service_type !== 'express') return true;
    
    const now = new Date();
    const selectedPickup = new Date(editFormData.pickup_date);
    
    // If pickup is today
    if (selectedPickup.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      const pickupHour = editFormData.pickup_slot === 'morning' ? 8 : 16;
      
      // Check if there's enough time for 4-hour express service
      const hoursUntilPickup = pickupHour - currentHour;
      const hoursUntilEndOfDay = 19 - currentHour; // Last delivery at 7 PM
      
      return (hoursUntilPickup + 4) <= hoursUntilEndOfDay;
    }
    
    return true;
  };

  const handleUpdateOrder = async () => {
    if (getEditFormTotalItems() === 0) {
      setUpdateError('Please select at least one item');
      return;
    }

    if (!isExpressServiceValid()) {
      setUpdateError('Express service not available for selected time. Please choose a different service type or pickup time.');
      return;
    }

    setUpdateLoading(true);
    setUpdateError('');

    try {
      const estimatedDelivery = getEstimatedDelivery();
      
      // Update order
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          pickup_date: editFormData.pickup_date,
          pickup_slot: editFormData.pickup_slot,
          service_type: editFormData.service_type,
          total_amount: getTotalAmount(),
          estimated_delivery: estimatedDelivery.toISOString(),
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Delete existing order items
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', order.id);

      if (deleteError) throw deleteError;

      // Create new order items
      const orderItems = Object.entries(editFormData.selectedItems).map(([clothingTypeId, quantity]) => {
        const clothingType = clothingTypes.find(ct => ct.id === clothingTypeId)!;
        const rate = getRateForService(clothingType, editFormData.service_type);
        return {
          order_id: order.id,
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

      // Call the callback to refresh the parent component
      onOrderUpdated();
    } catch (error: any) {
      setUpdateError(error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Cancel Edit</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <Shirt className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SocietyXpress</h1>
                <p className="text-xs text-gray-500">Edit Order #{order.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-semibold text-gray-900">
                    {order.users?.full_name || order.users?.username || 'Customer'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{order.users?.phone || 'No phone'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-900">
                    {order.users?.societies?.name} • {order.users?.towers?.name} • Flat {order.users?.flats?.number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{order.status.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Service Type Selection */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { type: 'normal', name: 'Normal Service', time: '48 Hours' },
                  { type: 'priority', name: 'Priority Service', time: '24 Hours' },
                  { type: 'express', name: 'Express Service', time: '4 Hours' },
                ].map((service) => (
                  <label
                    key={service.type}
                    className={`cursor-pointer p-4 border rounded-2xl transition-all ${
                      editFormData.service_type === service.type
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service_type"
                      value={service.type}
                      checked={editFormData.service_type === service.type}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, service_type: e.target.value as any }))}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <p className="text-green-600 font-medium">{service.time}</p>
                    </div>
                  </label>
                ))}
              </div>
              
              {editFormData.service_type === 'express' && !isExpressServiceValid() && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
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
                    value={editFormData.pickup_date}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, pickup_date: e.target.value }))}
                    min={new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Slot
                  </label>
                  <select
                    value={editFormData.pickup_slot}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, pickup_slot: e.target.value as 'morning' | 'evening' }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="morning">Morning (8:00 AM - 11:00 AM)</option>
                    <option value="evening">Evening (4:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Items Selection */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Update Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clothingTypes.map((clothingType) => (
                  <div
                    key={clothingType.id}
                    className="border border-gray-200 rounded-2xl p-6 hover:border-green-200 hover:bg-green-50/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{clothingType.name}</h4>
                        <p className="text-sm font-medium text-green-600">
                          ₹{getRateForService(clothingType, editFormData.service_type)} per piece
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Quantity:</span>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateItemCount(clothingType.id, (editFormData.selectedItems[clothingType.id] || 0) - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {editFormData.selectedItems[clothingType.id] || 0}
                        </span>
                        <button
                          onClick={() => updateItemCount(clothingType.id, (editFormData.selectedItems[clothingType.id] || 0) + 1)}
                          className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Updated Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Updated Order Summary</h3>
              
              {getEditFormTotalItems() === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No items selected</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {Object.entries(editFormData.selectedItems).map(([clothingTypeId, count]) => {
                      const clothingType = clothingTypes.find(ct => ct.id === clothingTypeId);
                      if (!clothingType) return null;
                      const rate = getRateForService(clothingType, editFormData.service_type);
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Total Items</span>
                      <span className="font-medium">{getEditFormTotalItems()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Service Type</span>
                      <span className="font-medium capitalize">{editFormData.service_type}</span>
                    </div>
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span>Total Amount</span>
                      <span className="text-green-600">₹{getTotalAmount()}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Pickup: {new Date(editFormData.pickup_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        Delivery: {getEstimatedDelivery().toLocaleDateString()} 
                        ({editFormData.service_type === 'normal' ? '48h' : editFormData.service_type === 'priority' ? '24h' : '4h'})
                      </span>
                    </div>
                  </div>

                  {updateError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                      <p className="text-red-600 text-sm">{updateError}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={handleUpdateOrder}
                      disabled={updateLoading || !isExpressServiceValid()}
                      className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {updateLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating Order...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Update Order - ₹{getTotalAmount()}</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={onBack}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel Changes
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PartnerOrderEdit;