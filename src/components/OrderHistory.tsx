import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Calendar,
  Eye,
  Shirt,
  AlertCircle,
  RefreshCw,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User, Order, OrderItem, ClothingType } from '../types/index';

interface OrderHistoryProps {
  user: User;
  onBack: () => void;
}

interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    clothing_types: ClothingType;
  })[];
}

interface GroupedOrders {
  pending: OrderWithItems[];
  picked_up: OrderWithItems[];
  in_progress: OrderWithItems[];
  ready: OrderWithItems[];
  delivered: OrderWithItems[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ user, onBack }) => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders>({
    pending: [],
    picked_up: [],
    in_progress: [],
    ready: [],
    delivered: []
  });
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | null>(null);
  const [editFormData, setEditFormData] = useState({
    pickup_date: '',
    pickup_slot: 'morning' as 'morning' | 'evening',
    service_type: 'normal' as 'normal' | 'priority' | 'express',
    selectedItems: {} as { [key: string]: number }
  });
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    pending: false,
    picked_up: false,
    in_progress: false,
    ready: false,
    delivered: false // Collapsed by default since it's historical
  });

  useEffect(() => {
    fetchOrders();
    fetchClothingTypes();
  }, [user.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            clothing_types (
              id,
              name,
              normal_rate,
              priority_rate,
              express_rate
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const fetchedOrders = data || [];
      setOrders(fetchedOrders);
      
      // Group and sort orders
      const grouped = groupAndSortOrders(fetchedOrders);
      setGroupedOrders(grouped);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const groupAndSortOrders = (orders: OrderWithItems[]): GroupedOrders => {
    const grouped: GroupedOrders = {
      pending: [],
      picked_up: [],
      in_progress: [],
      ready: [],
      delivered: []
    };

    // Group orders by status
    orders.forEach(order => {
      if (grouped[order.status as keyof GroupedOrders]) {
        grouped[order.status as keyof GroupedOrders].push(order);
      }
    });

    // Sort each group
    // For non-delivered orders: ascending by creation date (oldest first - most urgent)
    const sortAscending = (a: OrderWithItems, b: OrderWithItems) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    
    // For delivered orders: descending by creation date (newest first - most recent)
    const sortDescending = (a: OrderWithItems, b: OrderWithItems) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

    grouped.pending.sort(sortAscending);
    grouped.picked_up.sort(sortAscending);
    grouped.in_progress.sort(sortAscending);
    grouped.ready.sort(sortAscending);
    grouped.delivered.sort(sortDescending);

    return grouped;
  };

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

  const canEditOrder = (order: OrderWithItems) => {
    return order.status === 'pending';
  };

  const handleEditOrder = (order: OrderWithItems) => {
    setEditingOrder(order);
    setSelectedOrder(null);
    
    // Populate form with current order data
    const selectedItems: { [key: string]: number } = {};
    order.order_items.forEach(item => {
      selectedItems[item.clothing_type_id] = item.quantity;
    });
    
    setEditFormData({
      pickup_date: order.pickup_date,
      pickup_slot: order.pickup_slot,
      service_type: order.service_type,
      selectedItems
    });
    setUpdateError('');
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditFormData({
      pickup_date: '',
      pickup_slot: 'morning',
      service_type: 'normal',
      selectedItems: {}
    });
    setUpdateError('');
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

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;
    
    if (getEditFormTotalItems() === 0) {
      setUpdateError('Please select at least one item');
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
        .eq('id', editingOrder.id);

      if (orderError) throw orderError;

      // Delete existing order items
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', editingOrder.id);

      if (deleteError) throw deleteError;

      // Create new order items
      const orderItems = Object.entries(editFormData.selectedItems).map(([clothingTypeId, quantity]) => {
        const clothingType = clothingTypes.find(ct => ct.id === clothingTypeId)!;
        const rate = getRateForService(clothingType, editFormData.service_type);
        return {
          order_id: editingOrder.id,
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

      // Refresh orders list
      await fetchOrders();
      setEditingOrder(null);
      setEditFormData({
        pickup_date: '',
        pickup_slot: 'morning',
        service_type: 'normal',
        selectedItems: {}
      });

    } catch (error: any) {
      setUpdateError(error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'picked_up':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <RefreshCw className="h-5 w-5 text-purple-500" />;
      case 'ready':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Pickup';
      case 'picked_up':
        return 'Picked Up';
      case 'in_progress':
        return 'In Progress';
      case 'ready':
        return 'Ready for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Orders waiting to be picked up';
      case 'picked_up':
        return 'Orders collected and ready for processing';
      case 'in_progress':
        return 'Orders currently being processed';
      case 'ready':
        return 'Orders ready for delivery';
      case 'delivered':
        return 'Completed orders';
      default:
        return '';
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

  const formatPickupDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalItems = (order: OrderWithItems) => {
    return order.order_items.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const renderOrderGroup = (
    groupName: keyof GroupedOrders,
    orders: OrderWithItems[],
    title: string
  ) => {
    const isExpanded = expandedGroups[groupName];
    const orderCount = orders.length;

    return (
      <div key={groupName} className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleGroup(groupName)}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            {getStatusIcon(groupName)}
            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">{getStatusDescription(groupName)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(groupName)}`}>
              {orderCount} {orderCount === 1 ? 'order' : 'orders'}
            </span>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="p-6">
            {orderCount === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No {title.toLowerCase()}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {canEditOrder(order) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditOrder(order);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Order"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        <Eye className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Items</p>
                        <p className="font-medium text-gray-900">{getTotalItems(order)} pieces</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Service</p>
                        <p className="font-medium text-gray-900 capitalize">{order.service_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Pickup Date</p>
                        <p className="font-medium text-gray-900">{formatPickupDate(order.pickup_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                        <p className="font-bold text-blue-600">
                          ₹{order.total_amount > 0 ? order.total_amount : 
                            order.order_items.reduce((sum, item) => sum + item.subtotal, 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Estimated delivery: {formatDate(order.estimated_delivery)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-blue-600 text-sm font-medium">
                        <span>View Details</span>
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Order editing view (keeping existing implementation)
  if (editingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Cancel Edit</span>
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src="/A_logo_for_SocietyXpress,_a_hyper-local_service_pl.png" 
                  alt="SocietyXpress" 
                  className="w-8 h-8 rounded-xl"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SocietyXpress</h1>
                  <p className="text-xs text-gray-500">Edit Order #{editingOrder.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Edit Form */}
            <div className="lg:col-span-2 space-y-6">
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
                          ? 'border-blue-500 bg-blue-50'
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
                        <p className="text-blue-600 font-medium">{service.time}</p>
                      </div>
                    </label>
                  ))}
                </div>
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Slot
                    </label>
                    <select
                      value={editFormData.pickup_slot}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, pickup_slot: e.target.value as 'morning' | 'evening' }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                      className="border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{clothingType.name}</h4>
                          <p className="text-sm font-medium text-blue-600">
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
                            <X className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {editFormData.selectedItems[clothingType.id] || 0}
                          </span>
                          <button
                            onClick={() => updateItemCount(clothingType.id, (editFormData.selectedItems[clothingType.id] || 0) + 1)}
                            className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                          >
                            <Package className="h-4 w-4" />
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
                        <span className="text-blue-600">₹{getTotalAmount()}</span>
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
                        disabled={updateLoading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
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
                        onClick={handleCancelEdit}
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
  }

  // Order details view (keeping existing implementation)
  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Orders</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Shirt className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SocietyXpress</h1>
                  <p className="text-xs text-gray-500">Order Details</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Order Header */}
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600">Order placed on {formatDate(selectedOrder.created_at)}</p>
              </div>
              <div className="flex items-center space-x-3">
                {canEditOrder(selectedOrder) && (
                  <button
                    onClick={() => handleEditOrder(selectedOrder)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Order</span>
                  </button>
                )}
                <div className={`px-4 py-2 rounded-full border flex items-center space-x-2 ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="font-medium">{getStatusText(selectedOrder.status)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Pickup Details</span>
                </div>
                <p className="text-gray-700">{formatPickupDate(selectedOrder.pickup_date)}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {selectedOrder.pickup_slot} slot
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Service Type</span>
                </div>
                <p className="text-gray-700 capitalize">{selectedOrder.service_type}</p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.service_type === 'normal' ? '48 hours' :
                   selectedOrder.service_type === 'priority' ? '24 hours' : '4 hours'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Estimated Delivery</span>
                </div>
                <p className="text-gray-700">{formatDate(selectedOrder.estimated_delivery)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Items in this Order</h2>
            <div className="space-y-4">
              {selectedOrder.order_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Shirt className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.clothing_types.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{item.subtotal}</p>
                    <p className="text-sm text-gray-600">₹{item.rate} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items</span>
                <span className="font-medium">{getTotalItems(selectedOrder)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Type</span>
                <span className="font-medium capitalize">{selectedOrder.service_type}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">
                    ₹{selectedOrder.total_amount > 0 ? selectedOrder.total_amount : 
                      selectedOrder.order_items.reduce((sum, item) => sum + item.subtotal, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
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
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shirt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SocietyXpress</h1>
                <p className="text-xs text-gray-500">Order History</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Track and manage your ironing service orders</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading your orders...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start by booking your first ironing service!
            </p>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Book Your First Order
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Render order groups */}
            {renderOrderGroup('pending', groupedOrders.pending, 'Pending Orders')}
            {renderOrderGroup('picked_up', groupedOrders.picked_up, 'Picked Up Orders')}
            {renderOrderGroup('in_progress', groupedOrders.in_progress, 'Orders In Progress')}
            {renderOrderGroup('ready', groupedOrders.ready, 'Ready for Delivery')}
            {renderOrderGroup('delivered', groupedOrders.delivered, 'Delivered Orders')}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderHistory;