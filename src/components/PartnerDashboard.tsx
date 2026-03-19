
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PartnerOrderEdit from './PartnerOrderEdit';
import PartnerProfileEdit from './PartnerProfileEdit';
import LoadingSpinner from './LoadingSpinner';
import SocietyXpressIcon from './SocietyPlusIcon';
import { 
  Package, 
  Truck, 
  User, 
  Clock, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight,
  Shirt,
  DollarSign,
  TrendingUp,
  Award,
  Edit3,
  ArrowLeft,
  Calendar,
  LogOut
} from 'lucide-react';

interface Partner {
  id: string;
  username: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  partner_type: 'ironing' | 'delivery' | 'both';
  society_id: string | null;
  tower_id: string | null;
  status: string;
}

interface Order {
  id: string;
  user_id: string;
  pickup_date: string;
  pickup_slot: string;
  service_type: string;
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
    quantity: number;
    clothing_types: { name: string } | null;
  }>;
}

interface PartnerDashboardProps {
  partner: Partner;
  onSignOut: () => void;
}

export default function PartnerDashboard({ partner, onSignOut }: PartnerDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pickup' | 'ironing' | 'delivery'>('pickup');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pendingPickup: true,
    myPickupAssignments: true,
    myCompletedPickups: false,
    pendingIroningOrders: true,
    myIroningAssignments: true,
    completedIroningOrders: false,
    pendingDelivery: true,
    myDeliveryAssignments: true,
    completedDeliveryAssignments: false,
  });

  const calculateEarning = (orderAmount: number, serviceType: 'pickup' | 'ironing' | 'delivery') => {
    if (serviceType === 'ironing') {
      return Math.round(orderAmount * 0.75);
    } else {
      return Math.round(orderAmount * 0.025);
    }
  };

  // Calculate analytics
  const analytics = {
    totalEarned: orders
      .filter(order => 
        (order.assigned_ironing_partner_id === partner.id && order.status === 'delivered') ||
        (order.assigned_delivery_partner_id === partner.id && order.status === 'delivered')
      )
      .reduce((total, order) => {
        let earning = 0;
        if (order.assigned_ironing_partner_id === partner.id) {
          earning += calculateEarning(order.total_amount, 'ironing');
        }
        if (order.assigned_delivery_partner_id === partner.id) {
          earning += calculateEarning(order.total_amount, 'delivery');
        }
        return total + earning;
      }, 0),
    
    pendingEarnings: orders
      .filter(order => 
        (order.assigned_ironing_partner_id === partner.id && order.status !== 'delivered') ||
        (order.assigned_delivery_partner_id === partner.id && order.status !== 'delivered')
      )
      .reduce((total, order) => {
        let earning = 0;
        if (order.assigned_ironing_partner_id === partner.id) {
          earning += calculateEarning(order.total_amount, 'ironing');
        }
        if (order.assigned_delivery_partner_id === partner.id) {
          earning += calculateEarning(order.total_amount, 'delivery');
        }
        return total + earning;
      }, 0),
    
    thisMonth: orders
      .filter(order => {
        const orderDate = new Date(order.created_at);
        const currentDate = new Date();
        return orderDate.getMonth() === currentDate.getMonth() && 
               orderDate.getFullYear() === currentDate.getFullYear() &&
               ((order.assigned_ironing_partner_id === partner.id && order.status === 'delivered') ||
                (order.assigned_delivery_partner_id === partner.id && order.status === 'delivered'));
      })
      .reduce((total, order) => {
        let earning = 0;
        if (order.assigned_ironing_partner_id === partner.id) {
          earning += calculateEarning(order.total_amount, 'ironing');
        }
        if (order.assigned_delivery_partner_id === partner.id) {
          earning += calculateEarning(order.total_amount, 'delivery');
        }
        return total + earning;
      }, 0),
    
    completedOrders: orders
      .filter(order => 
        (order.assigned_ironing_partner_id === partner.id || order.assigned_delivery_partner_id === partner.id) &&
        order.status === 'delivered'
      ).length
  };
  
  useEffect(() => {
    fetchOrders();
  }, []);

  // Set default active tab based on partner type
  useEffect(() => {
    const availableTabs = [];
    if (partner.partner_type === 'delivery' || partner.partner_type === 'both') {
      availableTabs.push({ key: 'pickup', label: 'Pickup', icon: Package });
    }
    if (partner.partner_type === 'ironing' || partner.partner_type === 'both') {
      availableTabs.push({ key: 'ironing', label: 'Ironing Services', icon: Shirt });
    }
    if (partner.partner_type === 'delivery' || partner.partner_type === 'both') {
      availableTabs.push({ key: 'delivery', label: 'Delivery', icon: Truck });
    }

    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.key === activeTab)) {
      setActiveTab(availableTabs[0].key as 'pickup' | 'ironing' | 'delivery');
    }
  }, [partner.partner_type, activeTab]);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (
            full_name,
            username,
            phone,
            societies (name),
            towers (name),
            flats (number)
          ),
          order_items (
            id,
            quantity,
            clothing_types (name)
          )
        `)
        .eq('users.society_id', partner.society_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched orders:', data?.length || 0, 'orders');
      
      // Log all orders with their assignment status
      console.log('All orders with assignments:');
      data?.forEach(order => {
        console.log(`Order ${order.id.slice(-8)}: status=${order.status}, delivery_partner=${order.assigned_delivery_partner_id}, ironing_partner=${order.assigned_ironing_partner_id}`);
      });
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, updateType: 'pickup' | 'ironing' | 'delivery') => {
    try {
      let updateData: any = { status: newStatus };

      if (updateType === 'pickup') {
        if (newStatus === 'picked_up') {
          // Keep the existing assignment, just update status
        }
      } else if (updateType === 'ironing') {
        if (newStatus === 'in_progress') {
          updateData.assigned_ironing_partner_id = partner.id;
          updateData.ironing_started_at = new Date().toISOString();
        } else if (newStatus === 'ready') {
          updateData.ironing_completed_at = new Date().toISOString();
        }
      } else if (updateType === 'delivery') {
        if (newStatus === 'delivered') {
          updateData.delivery_started_at = new Date().toISOString();
          updateData.delivery_completed_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const assignToMe = async (orderId: string, assignmentType: 'pickup' | 'ironing' | 'delivery') => {
    try {
      console.log('assignToMe called with:', { orderId, assignmentType, partnerId: partner.id });
      
      // First, let's check the current order state
      const { data: currentOrders, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId);

      if (fetchError) {
        console.error('Error fetching current order:', fetchError);
        throw fetchError;
      }

      if (!currentOrders || currentOrders.length === 0) {
        throw new Error('Order not found');
      }

      const currentOrder = currentOrders[0];
      console.log('Current order before update:', currentOrder);

      let updateData: any = {};

      if (assignmentType === 'pickup') {
        updateData.assigned_delivery_partner_id = partner.id;
      } else if (assignmentType === 'ironing') {
        updateData.assigned_ironing_partner_id = partner.id;
        updateData.status = 'in_progress';
        updateData.ironing_started_at = new Date().toISOString();
      } else if (assignmentType === 'delivery') {
        updateData.assigned_delivery_partner_id = partner.id;
      }

      console.log('Updating order with data:', updateData);

      const { data: updatedOrders, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Updated orders:', updatedOrders);
      console.log(`Successfully assigned order ${orderId} to partner ${partner.id} for ${assignmentType}`);
      
      // Log before refresh
      console.log('About to refresh orders...');
      // Force refresh the orders to reflect changes immediately
      await fetchOrders();
      console.log('Orders refreshed successfully');
      console.log('=== ASSIGN TO ME DEBUG END ===');
      
    } catch (error) {
      console.error('Error assigning order:', error);
      console.log('=== ASSIGN TO ME DEBUG END (ERROR) ===');
      console.error('Assignment failed:', error.message || 'Unknown error');
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
  };

  const handleOrderUpdated = () => {
    fetchOrders();
    setEditingOrder(null);
  };

  const handleProfileUpdated = (updatedPartner: Partner) => {
    // Update the partner data in localStorage
    const currentSession = localStorage.getItem('partner_session_token');
    if (currentSession) {
      localStorage.setItem('current_partner', JSON.stringify(updatedPartner));
    }
    setEditingProfile(false);
    // Force a page refresh to update the partner data throughout the app
    window.location.reload();
  };
  
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const formatOrderItems = (orderItems: Order['order_items']) => {
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    return `${totalItems} pieces`;
  };

  const getServiceTypeDisplay = (serviceType: string) => {
    return serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
  };

  const getCustomerInfo = (order: Order) => {
    const user = order.users;
    if (!user) return 'Unknown Customer';
    
    const name = user.full_name || user.username || 'Customer';
    const location = [
      user.societies?.name,
      user.towers?.name,
      user.flats?.number
    ].filter(Boolean).join(' • ');
    
    return location ? `${name} • ${location}` : name;
  };

  const renderOrderCard = (order: Order, showAssignButton: boolean = false, serviceType: 'pickup' | 'ironing' | 'delivery', actionButton?: (order: Order) => { label: string; action: () => void }) => {
    const earning = calculateEarning(order.total_amount, serviceType);
    
    // Show edit button for orders in "My Pickup Assignments" section
    const showEditButton = serviceType === 'pickup' && 
                          order.assigned_delivery_partner_id === partner.id && 
                          order.status === 'pending';
    
    return (
      <div key={order.id} data-order-id={order.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewingOrder(order)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h3>
              <p className="text-sm text-gray-600">{getCustomerInfo(order)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            {showEditButton && (
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
              order.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
              order.status === 'ready' ? 'bg-green-100 text-green-800' :
              order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Items</p>
            <p className="font-medium text-gray-900">{formatOrderItems(order.order_items)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Service</p>
            <p className="font-medium text-gray-900">{getServiceTypeDisplay(order.service_type)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Order Value</p>
            <p className="font-medium text-gray-900">₹{order.total_amount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Your Earning</p>
            <p className="font-medium text-green-600">₹{earning}</p>
            <p className="text-xs text-gray-400">Potential Earning</p>
          </div>
        </div>

        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{getServiceTypeDisplay(order.service_type)}: Pickup: {new Date(order.pickup_date).toLocaleDateString()}</span>
          </div>
          <div className="flex space-x-2">
            {showAssignButton && (
              <button
                onClick={() => assignToMe(order.id, serviceType)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Assign to Me
              </button>
            )}
            {actionButton && (
              <button
                onClick={actionButton(order).action}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {actionButton(order).label}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string,
    description: string,
    sectionOrders: Order[],
    sectionKey: string,
    icon: React.ComponentType<any>,
    iconColor: string,
    showAssignButton: boolean = false,
    serviceType: 'pickup' | 'ironing' | 'delivery' = 'pickup',
    actionButton?: (order: Order) => { label: string; action: () => void }
  ) => {
    const isExpanded = expandedSections[sectionKey];
    const IconComponent = icon;

    return (
      <div className="bg-gray-50 rounded-lg mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <IconComponent className={`w-5 h-5 ${iconColor}`} />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              {sectionOrders.length} order{sectionOrders.length !== 1 ? 's' : ''}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4">
            {sectionOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders in this section</p>
            ) : (
              <div className="space-y-3">
                {sectionOrders.map(order => renderOrderCard(order, showAssignButton, serviceType, actionButton))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Group orders based on current tab and partner assignments
  const groupedOrders = {
    // Pickup tab orders
    pendingPickup: orders.filter(order => {
      const result = order.status === 'pending' && 
        (!order.assigned_delivery_partner_id || order.assigned_delivery_partner_id === null);
      if (result) {
        console.log(`✓ Order ${order.id.slice(-8)} in PENDING PICKUP queue - Status: ${order.status}, Delivery Partner: ${order.assigned_delivery_partner_id}`);
      }
      return result;
    }),
    myPickupAssignments: orders.filter(order => {
      const result = order.assigned_delivery_partner_id === partner.id && 
        order.status === 'pending';
      if (result) {
        console.log(`✓ Order ${order.id.slice(-8)} in MY PICKUP ASSIGNMENTS - Status: ${order.status}, Delivery Partner: ${order.assigned_delivery_partner_id}, My ID: ${partner.id}`);
      }
      return result;
    }),
    myCompletedPickups: orders.filter(order => 
      order.assigned_delivery_partner_id === partner.id && 
      order.status === 'picked_up'
    ),

    // Ironing tab orders
    pendingIroningOrders: orders.filter(order => 
      order.status === 'picked_up' && 
      (!order.assigned_ironing_partner_id || order.assigned_ironing_partner_id === null)
    ),
    myIroningAssignments: orders.filter(order => 
      order.assigned_ironing_partner_id === partner.id && 
      (order.status === 'picked_up' || order.status === 'in_progress')
    ),
    completedIroningOrders: orders.filter(order => 
      order.assigned_ironing_partner_id === partner.id && 
      order.status === 'ready'
    ),

    // Delivery tab orders
    pendingDelivery: orders.filter(order => 
      order.status === 'ready' && 
      (!order.assigned_delivery_partner_id || order.assigned_delivery_partner_id === null)
    ),
    myDeliveryAssignments: orders.filter(order => 
      order.assigned_delivery_partner_id === partner.id && 
      order.status === 'ready'
    ),
    completedDeliveryAssignments: orders.filter(order => 
      order.assigned_delivery_partner_id === partner.id && 
      order.status === 'delivered'
    ),
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Debug: Log the grouped orders
  console.log('Grouped orders:', {
    pendingPickup: groupedOrders.pendingPickup.length,
    myPickupAssignments: groupedOrders.myPickupAssignments.length,
    myCompletedPickups: groupedOrders.myCompletedPickups.length
  });
  
  console.log('Current partner ID:', partner.id);
  console.log('Partner type:', partner.partner_type);

  // Show edit order view if editing
  if (editingOrder) {
    return (
      <PartnerOrderEdit
        partner={partner}
        order={editingOrder}
        onBack={() => setEditingOrder(null)}
        onOrderUpdated={handleOrderUpdated}
      />
    );
  }

  // Show profile edit view if editing profile
  if (editingProfile) {
    return (
      <PartnerProfileEdit
        partner={partner}
        onSave={handleProfileUpdated}
        onCancel={() => setEditingProfile(false)}
      />
    );
  }
  
  // Show order details view if viewing
  if (viewingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setViewingOrder(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Order Details</h1>
                  <p className="text-xs text-gray-500">#{viewingOrder.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Customer Info Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Customer</p>
                    <p className="font-semibold text-blue-900">
                      {viewingOrder.users?.full_name || viewingOrder.users?.username || 'Customer'}
                    </p>
                    <p className="text-sm text-blue-700">{viewingOrder.users?.phone || 'No phone'}</p>
                    <p className="text-sm text-blue-700">
                      {viewingOrder.users?.towers?.name || 'Unknown Tower'}-{viewingOrder.users?.flats?.number || 'Unknown Flat'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Order Info</p>
                    <p className="font-semibold text-purple-900 capitalize">{viewingOrder.service_type} Service</p>
                    <p className="text-sm text-purple-700">{formatOrderItems(viewingOrder.order_items)}</p>
                    <p className="text-sm text-purple-700">₹{viewingOrder.total_amount} total</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Your Earnings</p>
                    <p className="font-semibold text-green-900">₹{calculateEarning(viewingOrder.total_amount, 'ironing')}</p>
                    <p className="text-sm text-green-700">Potential Earning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Order Placed</p>
                  <p className="text-sm text-gray-600">
                    {new Date(viewingOrder.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {viewingOrder.status !== 'pending' && (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pickup Completed</p>
                    <p className="text-sm text-gray-600">Items collected for processing</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items in Order */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Items in this Order</h2>
            {viewingOrder.order_items.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No items specified</p>
                <p className="text-sm text-gray-400">Items will be selected during pickup</p>
              </div>
            ) : (
              <div className="space-y-4">
                {viewingOrder.order_items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Shirt className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.clothing_types?.name || 'Unknown Item'}
                        </h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{Math.round(item.quantity * viewingOrder.total_amount / viewingOrder.order_items.reduce((sum, i) => sum + i.quantity, 1))}</p>
                      <p className="text-sm text-gray-600">₹{Math.round(viewingOrder.total_amount / viewingOrder.order_items.reduce((sum, i) => sum + i.quantity, 1))} each</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  const availableTabs = [];
  if (partner.partner_type === 'delivery' || partner.partner_type === 'both') {
    availableTabs.push({ key: 'pickup', label: 'Pickup', icon: Package });
  }
  if (partner.partner_type === 'ironing' || partner.partner_type === 'both') {
    availableTabs.push({ key: 'ironing', label: 'Ironing Services', icon: Shirt });
  }
  if (partner.partner_type === 'delivery' || partner.partner_type === 'both') {
    availableTabs.push({ key: 'delivery', label: 'Delivery', icon: Truck });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <SocietyXpressIcon size={40} className="rounded-xl" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Partner Dashboard</h1>
                <p className="text-xs text-gray-500">{partner.society_name || 'Embassy Boulevard'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 relative">
              <div>
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {partner.full_name || partner.username}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {partner.partner_type === 'both' ? 'Both Partner' : `${partner.partner_type} Partner`}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </div>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setEditingProfile(true);
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
        </div>
      </header>

      {/* Welcome Message */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {partner.full_name || partner.username}!
            </h1>
            <p className="text-lg text-gray-600">
              Your partner dashboard for managing {
                partner.partner_type === 'both' 
                  ? 'both services' 
                  : partner.partner_type === 'ironing'
                  ? 'ironing services'
                  : 'pickup/delivery services'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Earned */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Earned</p>
                  <p className="text-2xl font-bold text-green-700">₹{analytics.totalEarned}</p>
                </div>
              </div>
            </div>

            {/* Pending Earnings */}
            <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pending Earnings</p>
                  <p className="text-2xl font-bold text-yellow-700">₹{analytics.pendingEarnings}</p>
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">This Month</p>
                  <p className="text-2xl font-bold text-blue-700">₹{analytics.thisMonth}</p>
                </div>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Completed Orders</p>
                  <p className="text-2xl font-bold text-purple-700">{analytics.completedOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {availableTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'pickup' | 'ironing' | 'delivery')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pickup' && (
          <div className="space-y-6">
            {renderSection(
              'Global Queue - Pending Pickup',
              'Orders waiting for pickup assignment',
              groupedOrders.pendingPickup,
              'pendingPickup',
              Package,
              'text-orange-500',
              true,
              'pickup'
            )}

            {renderSection(
              'My Pickup Assignments',
              'Orders assigned to me for pickup',
              groupedOrders.myPickupAssignments,
              'myPickupAssignments',
              User,
              'text-blue-500',
              false,
              'pickup',
              (order) => ({
                label: 'Mark as Picked Up',
                action: () => handleStatusUpdate(order.id, 'picked_up', 'pickup'),
              })
            )}

            {renderSection(
              'My Completed Pickups',
              'Orders I have successfully picked up',
              groupedOrders.myCompletedPickups,
              'myCompletedPickups',
              CheckCircle,
              'text-green-500',
              false,
              'pickup'
            )}
          </div>
        )}

        {activeTab === 'ironing' && (
          <div className="space-y-6">
            {renderSection(
              'Pending Ironing Orders',
              'Orders waiting to be assigned for ironing',
              groupedOrders.pendingIroningOrders,
              'pendingIroningOrders',
              Shirt,
              'text-purple-500',
              true,
              'ironing'
            )}

            {renderSection(
              'My Ironing Assignments',
              'Orders assigned to me for ironing',
              groupedOrders.myIroningAssignments,
              'myIroningAssignments',
              User,
              'text-blue-500',
              false,
              'ironing',
              (order) => ({
                label: order.status === 'picked_up' ? 'Start Ironing' : 'Mark as Ready',
                action: () => handleStatusUpdate(
                  order.id, 
                  order.status === 'picked_up' ? 'in_progress' : 'ready', 
                  'ironing'
                ),
              })
            )}

            {renderSection(
              'Completed Ironing Orders',
              'Orders I have completed ironing',
              groupedOrders.completedIroningOrders,
              'completedIroningOrders',
              CheckCircle,
              'text-green-500',
              false,
              'ironing'
            )}
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-6">
            {renderSection(
              'Global Queue - Pending Delivery',
              'Orders ready for delivery assignment',
              groupedOrders.pendingDelivery,
              'pendingDelivery',
              Truck,
              'text-blue-500',
              true,
              'delivery'
            )}

            {renderSection(
              'My Delivery Assignments',
              'Orders assigned to me for delivery',
              groupedOrders.myDeliveryAssignments,
              'myDeliveryAssignments',
              User,
              'text-blue-500',
              false,
              'delivery',
              (order) => ({
                label: 'Mark as Delivered',
                action: () => handleStatusUpdate(order.id, 'delivered', 'delivery'),
              })
            )}

            {renderSection(
              'Completed Delivery Assignments',
              'Orders I have successfully delivered',
              groupedOrders.completedDeliveryAssignments,
              'completedDeliveryAssignments',
              CheckCircle,
              'text-green-500',
              false,
              'delivery'
            )}
          </div>
        )}
      </div>
    </div>
  );
}