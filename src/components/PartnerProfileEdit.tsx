import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Building, 
  Phone, 
  Mail,
  Upload,
  Save,
  ArrowLeft,
  FileText,
  Calendar,
  CheckCircle,
  Shirt,
  Truck,
  AlertTriangle,
  Users,
  Eye,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Partner, Society, Tower, PartnerOrder } from '../types/index';

interface PartnerProfileEditProps {
  partner: Partner;
  onSave: (partner: Partner) => void;
  onCancel: () => void;
}

const PartnerProfileEdit: React.FC<PartnerProfileEditProps> = ({ partner, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [societies, setSocieties] = useState<Society[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [activeOrders, setActiveOrders] = useState<PartnerOrder[]>([]);
  const [availablePartners, setAvailablePartners] = useState<Partner[]>([]);
  const [showOrderTransfer, setShowOrderTransfer] = useState(false);
  const [selectedTransferPartner, setSelectedTransferPartner] = useState<string>('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [showReadOnlyOrders, setShowReadOnlyOrders] = useState(false);
  const [readOnlyOrders, setReadOnlyOrders] = useState<PartnerOrder[]>([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [loadingTowers, setLoadingTowers] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: partner.full_name || '',
    email: partner.email || '',
    phone: partner.phone || '',
    partner_type: partner.partner_type,
    society_id: partner.society_id || '',
    tower_id: partner.tower_id || '',
    identity_type: partner.identity_type || 'aadhar' as 'aadhar' | 'pan' | 'passport' | 'election_card',
    identity_number: partner.identity_number || '',
    working_days: partner.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    holiday_day: partner.holiday_day || 'sunday',
  });

  const [identityDocument, setIdentityDocument] = useState<File | null>(null);

  const partnerTypes = [
    { value: 'ironing', label: 'Ironing Partner', icon: Shirt, description: 'Focus on professional ironing services' },
    { value: 'delivery', label: 'Delivery Partner', icon: Truck, description: 'Handle pickup and delivery services' },
    { value: 'both', label: 'Both Services', icon: Users, description: 'Provide both ironing and delivery' },
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const identityTypes = [
    { value: 'aadhar', label: 'Aadhar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'election_card', label: 'Election Card' },
  ];

  useEffect(() => {
    fetchSocieties();
    checkActiveOrders();
    fetchReadOnlyOrders();
  }, []);

  useEffect(() => {
    if (formData.society_id) {
      fetchTowers(formData.society_id);
    } else {
      setTowers([]);
      setFormData(prev => ({ ...prev, tower_id: '' }));
    }
  }, [formData.society_id]);

  useEffect(() => {
    // Check if partner type change requires order transfer
    if (formData.partner_type !== partner.partner_type) {
      checkActiveOrders();
    }
  }, [formData.partner_type]);

  const checkActiveOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            clothing_types (*)
          ),
          users (
            full_name,
            phone,
            towers (name),
            flats (number)
          )
        `);

      // Check for active ironing orders
      const { data: ironingOrders } = await query
        .eq('assigned_ironing_partner_id', partner.id)
        .in('status', ['in_progress', 'ready']);

      // Check for active delivery orders
      const { data: deliveryOrders } = await query
        .eq('assigned_delivery_partner_id', partner.id)
        .in('status', ['ready']);

      const allActiveOrders = [...(ironingOrders || []), ...(deliveryOrders || [])];
      setActiveOrders(allActiveOrders);

      // If changing partner type and has active orders, fetch available partners for transfer
      if (formData.partner_type !== partner.partner_type && allActiveOrders.length > 0) {
        fetchAvailablePartners();
      }
    } catch (error) {
      console.error('Error checking active orders:', error);
    }
  };

  const fetchAvailablePartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('society_id', partner.society_id)
        .eq('status', 'approved')
        .neq('id', partner.id);

      if (error) throw error;

      // Filter partners based on the service type being transferred
      const filteredPartners = (data || []).filter(p => {
        if (partner.partner_type === 'ironing' && formData.partner_type === 'delivery') {
          return p.partner_type === 'ironing' || p.partner_type === 'both';
        }
        if (partner.partner_type === 'delivery' && formData.partner_type === 'ironing') {
          return p.partner_type === 'delivery' || p.partner_type === 'both';
        }
        if (partner.partner_type === 'both') {
          return p.partner_type === formData.partner_type || p.partner_type === 'both';
        }
        return false;
      });

      setAvailablePartners(filteredPartners);
    } catch (error) {
      console.error('Error fetching available partners:', error);
    }
  };

  const fetchReadOnlyOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            clothing_types (*)
          ),
          users (
            full_name,
            phone,
            towers (name),
            flats (number)
          )
        `);

      // Get all orders where this partner was involved
      const { data: allOrders } = await query
        .or(`assigned_ironing_partner_id.eq.${partner.id},assigned_delivery_partner_id.eq.${partner.id}`)
        .order('created_at', { ascending: false });

      setReadOnlyOrders(allOrders || []);
    } catch (error) {
      console.error('Error fetching read-only orders:', error);
    }
  };

  const handleTransferOrders = async () => {
    if (!selectedTransferPartner) {
      setError('Please select a partner to transfer orders to');
      return;
    }

    setTransferLoading(true);
    try {
      // Transfer orders based on the service type being changed
      for (const order of activeOrders) {
        const updates: any = {};
        
        if (partner.partner_type === 'ironing' && formData.partner_type === 'delivery') {
          // Transferring from ironing to delivery - transfer ironing orders
          if (order.assigned_ironing_partner_id === partner.id) {
            updates.assigned_ironing_partner_id = selectedTransferPartner;
          }
        } else if (partner.partner_type === 'delivery' && formData.partner_type === 'ironing') {
          // Transferring from delivery to ironing - transfer delivery orders
          if (order.assigned_delivery_partner_id === partner.id) {
            updates.assigned_delivery_partner_id = selectedTransferPartner;
          }
        } else if (partner.partner_type === 'both') {
          // Transferring from both to specific type
          if (formData.partner_type === 'ironing' && order.assigned_delivery_partner_id === partner.id) {
            updates.assigned_delivery_partner_id = selectedTransferPartner;
          } else if (formData.partner_type === 'delivery' && order.assigned_ironing_partner_id === partner.id) {
            updates.assigned_ironing_partner_id = selectedTransferPartner;
          }
        }

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', order.id);

          if (error) throw error;
        }
      }

      setShowOrderTransfer(false);
      setActiveOrders([]);
      setSelectedTransferPartner('');
    } catch (error: any) {
      setError(`Failed to transfer orders: ${error.message}`);
    } finally {
      setTransferLoading(false);
    }
  };

  const fetchSocieties = async () => {
    try {
      setLoadingSocieties(true);
      setError('');
      
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .order('name');
      
      if (error) {
        setError(`Failed to load societies: ${error.message}`);
        return;
      }
      
      setSocieties(data || []);
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingSocieties(false);
    }
  };

  const fetchTowers = async (societyId: string) => {
    try {
      setLoadingTowers(true);
      setError('');
      
      const { data, error } = await supabase
        .from('towers')
        .select('*')
        .eq('society_id', societyId)
        .order('name');
      
      if (error) {
        setError(`Failed to load towers: ${error.message}`);
        return;
      }
      
      setTowers(data || []);
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingTowers(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePartnerTypeChange = (newType: 'ironing' | 'delivery' | 'both') => {
    setFormData(prev => ({ ...prev, partner_type: newType }));
    setError('');
    
    // Check if this change requires order transfer
    if (newType !== partner.partner_type && activeOrders.length > 0) {
      setShowOrderTransfer(true);
    }
  };

  const handleWorkingDaysChange = (day: string) => {
    setFormData(prev => {
      const newWorkingDays = prev.working_days.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...prev.working_days, day];
      
      // Ensure exactly 6 working days
      if (newWorkingDays.length > 6) {
        return prev; // Don't allow more than 6 days
      }
      
      // Update holiday day if needed
      const allDays = daysOfWeek.map(d => d.value);
      const newHolidayDay = allDays.find(d => !newWorkingDays.includes(d)) || 'sunday';
      
      return {
        ...prev,
        working_days: newWorkingDays,
        holiday_day: newHolidayDay
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG) or PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setIdentityDocument(file);
      setError('');
    }
  };

  const uploadDocument = async (): Promise<string | null> => {
    if (!identityDocument) return null;

    setUploadingDocument(true);
    try {
      const fileExt = identityDocument.name.split('.').pop();
      const fileName = `${partner.id}_${formData.identity_type}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('partner-documents')
        .upload(fileName, identityDocument);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('partner-documents')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      setError(`Failed to upload document: ${error.message}`);
      return null;
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate working days
      if (formData.working_days.length !== 6) {
        throw new Error('Please select exactly 6 working days');
      }

      // Check if partner type change requires order transfer
      if (formData.partner_type !== partner.partner_type && activeOrders.length > 0 && !selectedTransferPartner) {
        setShowOrderTransfer(true);
        setLoading(false);
        return;
      }

      // Upload document if provided
      let documentUrl = partner.identity_document_url;
      if (identityDocument) {
        documentUrl = await uploadDocument();
        if (!documentUrl) {
          throw new Error('Failed to upload identity document');
        }
      }

      // Check for duplicate identity numbers in the same society (excluding current partner)
      const { data: existingPartner, error: checkError } = await supabase
        .from('partners')
        .select('id')
        .eq('identity_number', formData.identity_number)
        .eq('society_id', formData.society_id)
        .neq('id', partner.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingPartner) {
        throw new Error('A partner with this identity number is already registered in this society');
      }

      // Transfer orders if needed
      if (formData.partner_type !== partner.partner_type && activeOrders.length > 0 && selectedTransferPartner) {
        await handleTransferOrders();
      }

      const { data, error } = await supabase
        .from('partners')
        .update({
          full_name: formData.full_name,
          email: formData.email || null,
          phone: formData.phone,
          partner_type: formData.partner_type,
          society_id: formData.society_id,
          tower_id: formData.tower_id || null,
          identity_type: formData.identity_type,
          identity_number: formData.identity_number,
          identity_document_url: documentUrl,
          working_days: formData.working_days,
          holiday_day: formData.holiday_day,
        })
        .eq('id', partner.id)
        .select(`
          *,
          societies(name),
          towers(name)
        `)
        .single();

      if (error) throw error;

      const updatedPartner: Partner = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        partner_type: data.partner_type,
        society_id: data.society_id,
        tower_id: data.tower_id,
        identity_type: data.identity_type,
        identity_number: data.identity_number,
        identity_document_url: data.identity_document_url,
        working_days: data.working_days,
        holiday_day: data.holiday_day,
        status: data.status,
        created_at: data.created_at,
        society_name: data.societies?.name,
        tower_name: data.towers?.name,
      };

      // Update localStorage with new partner data
      const currentSession = localStorage.getItem('partner_session_token');
      if (currentSession) {
        localStorage.setItem('current_partner', JSON.stringify(updatedPartner));
      }

      onSave(updatedPartner);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderRole = (order: PartnerOrder) => {
    const roles = [];
    if (order.assigned_ironing_partner_id === partner.id) roles.push('Ironing');
    if (order.assigned_delivery_partner_id === partner.id) roles.push('Delivery');
    return roles.join(' & ');
  };

  // Order Transfer Modal
  if (showOrderTransfer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfer Active Orders</h1>
            <p className="text-gray-600">
              You have {activeOrders.length} active orders that need to be transferred to another partner
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Orders to Transfer</h3>
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.users?.towers?.name || 'Unknown Tower'}-{order.users?.flats?.number || 'Unknown Flat'} • {getOrderRole(order)}
                        </p>
                      </div>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Partner to Transfer Orders To *
              </label>
              <select
                value={selectedTransferPartner}
                onChange={(e) => setSelectedTransferPartner(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
              >
                <option value="">Select a partner...</option>
                {availablePartners.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.username} ({p.partner_type})
                  </option>
                ))}
              </select>
              {availablePartners.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  No available partners found for transfer. Please contact admin.
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowOrderTransfer(false);
                  setFormData(prev => ({ ...prev, partner_type: partner.partner_type }));
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleTransferOrders}
                disabled={transferLoading || !selectedTransferPartner}
                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {transferLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Transferring...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5" />
                    <span>Transfer Orders</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Read-only Orders Modal
  if (showReadOnlyOrders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setShowReadOnlyOrders(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Profile</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shirt className="h-5 w-5 text-green-600" />
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
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Order History</h2>
            {readOnlyOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders found</p>
            ) : (
              <div className="space-y-4">
                {readOnlyOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.users?.towers?.name || 'Unknown Tower'}-{order.users?.flats?.number || 'Unknown Flat'} • {getOrderRole(order)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          {order.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Service Type</p>
                        <p className="capitalize">{order.service_type}</p>
                      </div>
                      <div>
                        <p className="font-medium">Items</p>
                        <p>{order.order_items.reduce((sum, item) => sum + item.quantity, 0)} pieces</p>
                      </div>
                      <div>
                        <p className="font-medium">Total Amount</p>
                        <p>₹{order.total_amount}</p>
                      </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <Shirt className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SocietyXpress</h1>
                <p className="text-xs text-gray-500">Edit Profile</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Partner Profile</h1>
            <p className="text-gray-600">
              Update your partner information and preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Partner Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Partner Type *
              </label>
              <div className="space-y-3">
                {partnerTypes.map((type) => {
                  const Icon = type.icon;
                  const isCurrentType = type.value === partner.partner_type;
                  const isSelected = type.value === formData.partner_type;
                  const isReadOnly = isCurrentType && activeOrders.length > 0 && type.value !== 'both';
                  
                  return (
                    <label
                      key={type.value}
                      className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : isReadOnly
                          ? 'border-gray-200 bg-gray-50 opacity-60'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="partner_type"
                        value={type.value}
                        checked={isSelected}
                        onChange={() => !isReadOnly && handlePartnerTypeChange(type.value as any)}
                        disabled={isReadOnly}
                        className="text-green-600"
                      />
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-green-600' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-600">{type.description}</p>
                        {isReadOnly && (
                          <p className="text-xs text-yellow-600 mt-1">
                            Cannot change - you have active orders
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              
              {/* Order History Button */}
              <div className="mt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowReadOnlyOrders(true)}
                  className="text-sm text-green-600 hover:text-green-700 flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Order History</span>
                </button>
                
                {activeOrders.length > 0 && (
                  <p className="text-sm text-yellow-600">
                    {activeOrders.length} active orders
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your full name"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                  disabled={loadingSocieties}
                >
                  <option value="">
                    {loadingSocieties ? 'Loading societies...' : 'Select your society'}
                  </option>
                  {societies.map(society => (
                    <option key={society.id} value={society.id}>{society.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tower
                </label>
                <select
                  name="tower_id"
                  value={formData.tower_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  disabled={loadingTowers || !formData.society_id}
                >
                  <option value="">
                    {loadingTowers ? 'Loading towers...' : 
                     !formData.society_id ? 'Select society first' : 'Select tower (optional)'}
                  </option>
                  {towers.map(tower => (
                    <option key={tower.id} value={tower.id}>{tower.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identity Type *
                </label>
                <select
                  name="identity_type"
                  value={formData.identity_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                >
                  {identityTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identity Number *
                </label>
                <input
                  type="text"
                  name="identity_number"
                  value={formData.identity_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter identity number"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Identity Document
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                  id="document-upload"
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-1">
                    {identityDocument ? identityDocument.name : 'Click to upload new identity document'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: JPEG, PNG, PDF (Max 5MB)
                  </p>
                  {partner.identity_document_url && !identityDocument && (
                    <p className="text-sm text-green-600 mt-2">
                      Current document uploaded ✓
                    </p>
                  )}
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Working Schedule (Select 6 working days) *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {daysOfWeek.map(day => (
                  <label
                    key={day.value}
                    className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
                      formData.working_days.includes(day.value)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : day.value === formData.holiday_day
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.working_days.includes(day.value)}
                      onChange={() => handleWorkingDaysChange(day.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <p className="font-medium text-sm">{day.label}</p>
                      {day.value === formData.holiday_day && (
                        <p className="text-xs text-red-600">Holiday</p>
                      )}
                      {formData.working_days.includes(day.value) && (
                        <CheckCircle className="h-4 w-4 mx-auto mt-1" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {formData.working_days.length}/6 working days | Holiday: {formData.holiday_day}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Cancel</span>
              </button>
              
              <button
                type="submit"
                disabled={loading || uploadingDocument}
                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading || uploadingDocument ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{uploadingDocument ? 'Uploading Document...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnerProfileEdit;