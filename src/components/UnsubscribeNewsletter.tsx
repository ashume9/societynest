import React, { useState, useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UnsubscribeNewsletterProps {
  token?: string;
}

const UnsubscribeNewsletter: React.FC<UnsubscribeNewsletterProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (token) {
      handleUnsubscribe(token);
    } else {
      setLoading(false);
      setError('Invalid unsubscribe link. Please check your email for the correct link.');
    }
  }, [token]);

  const handleUnsubscribe = async (unsubscribeToken: string) => {
    try {
      setLoading(true);
      setError('');

      // Find subscription by token
      const { data: subscription, error: findError } = await supabase
        .from('newsletter_subscriptions')
        .select('id, email, subscribed')
        .eq('unsubscribe_token', unsubscribeToken)
        .maybeSingle();

      if (findError) throw findError;

      if (!subscription) {
        setError('Invalid unsubscribe link. The subscription may have already been removed.');
        return;
      }

      if (!subscription.subscribed) {
        setEmail(subscription.email);
        setError('This email address is already unsubscribed from our newsletter.');
        return;
      }

      // Update subscription status
      const { error: updateError } = await supabase
        .from('newsletter_subscriptions')
        .update({ 
          subscribed: false,
          unsubscribe_token: crypto.randomUUID() // Generate new token for security
        })
        .eq('unsubscribe_token', unsubscribeToken);

      if (updateError) throw updateError;

      setEmail(subscription.email);
      setSuccess(true);

    } catch (error: any) {
      console.error('Unsubscribe error:', error);
      setError('Failed to unsubscribe. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    if (!email) return;

    try {
      setLoading(true);
      setError('');

      const { error: updateError } = await supabase
        .from('newsletter_subscriptions')
        .update({ 
          subscribed: true,
          unsubscribe_token: crypto.randomUUID()
        })
        .eq('email', email);

      if (updateError) throw updateError;

      setSuccess(false);
      // Show success message for resubscribe
      setTimeout(() => {
        setSuccess(true);
      }, 100);

    } catch (error: any) {
      console.error('Resubscribe error:', error);
      setError('Failed to resubscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center">
          {loading ? (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader className="h-8 w-8 text-gray-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing...</h1>
              <p className="text-gray-600">Please wait while we process your request.</p>
            </>
          ) : success ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Successfully Unsubscribed</h1>
              <p className="text-gray-600 mb-6">
                {email} has been unsubscribed from SocietyXpress newsletter. 
                You will no longer receive updates from us.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Changed your mind? You can resubscribe anytime.
              </p>
              <button
                onClick={handleResubscribe}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Resubscribe
              </button>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Unsubscribe Failed</h1>
              <p className="text-red-600 mb-6">{error}</p>
              {email && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-600">
                    If you continue to have issues, please contact our support team 
                    and mention this email: <strong>{email}</strong>
                  </p>
                </div>
              )}
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                Go to Homepage
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="h-8 w-8 text-gray-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h1>
              <p className="text-gray-600 mb-6">
                This unsubscribe link is invalid or has expired. 
                Please check your email for the correct link.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Go to Homepage
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnsubscribeNewsletter;