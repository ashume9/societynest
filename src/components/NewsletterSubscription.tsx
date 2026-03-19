import React, { useState } from 'react';
import { Mail, CheckCircle, X, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NewsletterSubscriptionProps {
  onClose?: () => void;
  inline?: boolean;
}

const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({ onClose, inline = false }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('newsletter_subscriptions')
        .select('id, subscribed')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        if (existing.subscribed) {
          setError('This email is already subscribed to our newsletter.');
          return;
        } else {
          // Reactivate subscription
          const { error: updateError } = await supabase
            .from('newsletter_subscriptions')
            .update({ 
              subscribed: true, 
              name: name,
              unsubscribe_token: crypto.randomUUID()
            })
            .eq('email', email);

          if (updateError) throw updateError;
        }
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from('newsletter_subscriptions')
          .insert({
            email,
            name,
            subscribed: true
          });

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setEmail('');
      setName('');
      
      // Auto close after success if it's a modal
      if (onClose && !inline) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }

    } catch (error: any) {
      if (error.code === '23505') {
        setError('This email is already subscribed to our newsletter.');
      } else {
        setError('Failed to subscribe. Please try again.');
      }
      console.error('Newsletter subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success && inline) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">Successfully Subscribed!</h3>
        <p className="text-green-700">
          Thank you for subscribing! You'll be the first to know about our new services and exclusive offers.
        </p>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Enter your full name"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Enter your email address"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Subscribing...</span>
          </>
        ) : (
          <>
            <Mail className="h-5 w-5" />
            <span>Subscribe for Updates</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By subscribing, you agree to receive updates about new services and offers. 
        You can unsubscribe at any time.
      </p>
    </form>
  );

  if (inline) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
          <p className="text-gray-600 text-sm">
            Get notified about new services, exclusive offers, and early access to features.
          </p>
        </div>
        {formContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay in the Loop</h2>
          <p className="text-gray-600">
            Be the first to know about our exciting new services and exclusive offers!
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Successfully Subscribed!</h3>
            <p className="text-gray-600">
              Thank you for subscribing! You'll receive updates about our new services and offers.
            </p>
          </div>
        ) : (
          formContent
        )}
      </div>
    </div>
  );
};

export default NewsletterSubscription;