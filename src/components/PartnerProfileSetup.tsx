import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Building, 
  Phone, 
  Mail,
  Upload,
  Save,
  ArrowRight,
  FileText,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Partner, Society, Tower } from '../types/index';

interface PartnerProfileSetupProps {
  partner: Partner;
  onComplete: (partner: Partner) => void;
}

const PartnerProfileSetup: React.FC<PartnerProfileSetupProps> = ({ partner, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [societies, setSocieties] = useState<Society[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [loadingTowers, setLoadingTowers] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: partner.full_name || '',
    email: partner.email || '',
    phone: partner.phone || '',
    society_id: partner.society_id || '',
    tower_id: partner.tower_id || '',
    identity_type: partner.identity_type || 'aadhar' as 'aadhar' | 'pan' | 'passport' | 'election_card',
    identity_number: partner.identity_number || '',
    working_days: partner.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    holiday_day: partner.holiday_day || 'sunday',
  });

  const [identityDocument, setIdentityDocument] = useState<File | null>(null);

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
  }, []);

  useEffect(() => {
    if (formData.society_id) {
      fetchTowers(formData.society_id);
    } else {
      setTowers([]);
      setFormData(prev => ({ ...prev, tower_id: '' }));
    }
  }, [formData.society_id]);

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

      // Upload document if provided
      let documentUrl = partner.identity_document_url;
      if (identityDocument) {
        documentUrl = await uploadDocument();
        if (!documentUrl) {
          throw new Error('Failed to upload identity document');
        }
      }

      // Check for duplicate identity numbers in the same society
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

      const { data, error } = await supabase
        .from('partners')
        .update({
          full_name: formData.full_name,
          email: formData.email || null,
          phone: formData.phone,
          society_id: formData.society_id,
          tower_id: formData.tower_id || null,
          identity_type: formData.identity_type,
          identity_number: formData.identity_number,
          identity_document_url: documentUrl,
          working_days: formData.working_days,
          holiday_day: formData.holiday_day,
          status: 'approved', // Auto-approved for now
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

      onComplete(updatedPartner);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Partner Profile</h1>
          <p className="text-gray-600">
            Provide your details to start working as a {partner.partner_type} partner
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              Upload Identity Document *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
                id="document-upload"
                required={!partner.identity_document_url}
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-1">
                  {identityDocument ? identityDocument.name : 'Click to upload identity document'}
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: JPEG, PNG, PDF (Max 5MB)
                </p>
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
          
          <button
            type="submit"
            disabled={loading || uploadingDocument}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading || uploadingDocument ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{uploadingDocument ? 'Uploading Document...' : 'Saving Profile...'}</span>
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
      </div>
    </div>
  );
};

export default PartnerProfileSetup;