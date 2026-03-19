import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Mail } from 'lucide-react';
import SocietyXpressIcon from './SocietyPlusIcon';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <SocietyXpressIcon size={32} className="rounded-xl" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">SocietyXpress</h1>
                <p className="text-xs text-gray-500">Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: September 14, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  SocietyXpress is a service by <span className="font-bold">Indikoz Technologies LLP</span>, a company registered in India.
                  All services offered under the SocietyXpress brand are operated and managed by <strong>Indikoz Technologies LLP</strong>.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 text-blue-600 mr-2" />
                1. Information We Collect
              </h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Personal Information:</strong> Name, email address, phone number, residential address (society, tower, flat number).</p>
                <p><strong>Account Information:</strong> Username, password (encrypted), service preferences, family size details.</p>
                <p><strong>Service Data:</strong> Order history, service preferences, pickup/delivery schedules, payment information.</p>
                <p><strong>Partner Information:</strong> For service partners - identity documents, working schedules, earnings data.</p>
                <p><strong>Usage Data:</strong> App usage patterns, device information, IP addresses, browser type.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Database className="h-6 w-6 text-blue-600 mr-2" />
                2. How We Use Your Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Service Delivery:</strong> To provide, maintain, and improve our ironing and delivery services.</p>
                <p><strong>Communication:</strong> To send service updates, order confirmations, and important notifications.</p>
                <p><strong>Customer Support:</strong> To respond to your inquiries and provide technical support.</p>
                <p><strong>Service Optimization:</strong> To analyze usage patterns and improve service quality.</p>
                <p><strong>Partner Management:</strong> To manage partner relationships, assignments, and payments.</p>
                <p><strong>Legal Compliance:</strong> To comply with applicable laws and regulations.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                3. Information Sharing
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
                <p className="text-blue-800 font-medium">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                  except as described in this policy.
                </p>
              </div>
              <div className="space-y-4 text-gray-700">
                <p><strong>Service Partners:</strong> Limited information shared with pickup/delivery partners to fulfill orders (name, address, phone).</p>
                <p><strong>Legal Requirements:</strong> When required by law, court order, or government regulations.</p>
                <p><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of business assets.</p>
                <p><strong>Service Providers:</strong> With trusted third-party service providers who assist in operations (payment processing, analytics).</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 text-blue-600 mr-2" />
                4. Data Security
              </h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Encryption:</strong> All sensitive data is encrypted in transit and at rest using industry-standard protocols.</p>
                <p><strong>Access Controls:</strong> Strict access controls ensure only authorized personnel can access personal data.</p>
                <p><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments.</p>
                <p><strong>Secure Infrastructure:</strong> Our systems are hosted on secure, compliant cloud infrastructure.</p>
                <p><strong>Password Security:</strong> User passwords are hashed using secure algorithms and never stored in plain text.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Account Data:</strong> Retained for the duration of your account plus 2 years for legal compliance.</p>
                <p><strong>Order History:</strong> Maintained for 3 years for service improvement and dispute resolution.</p>
                <p><strong>Partner Data:</strong> Retained for the duration of partnership plus 5 years for legal and tax purposes.</p>
                <p><strong>Analytics Data:</strong> Anonymized usage data may be retained indefinitely for service improvement.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Access:</strong> You have the right to access your personal data we hold.</p>
                <p><strong>Correction:</strong> You can request correction of inaccurate or incomplete data.</p>
                <p><strong>Deletion:</strong> You can request deletion of your personal data, subject to legal requirements.</p>
                <p><strong>Portability:</strong> You can request a copy of your data in a structured, machine-readable format.</p>
                <p><strong>Opt-out:</strong> You can opt-out of marketing communications at any time.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Essential Cookies:</strong> Required for basic functionality like user authentication and session management.</p>
                <p><strong>Analytics Cookies:</strong> Help us understand how users interact with our service to improve user experience.</p>
                <p><strong>Preference Cookies:</strong> Remember your settings and preferences for a personalized experience.</p>
                <p>You can control cookie settings through your browser, but disabling certain cookies may affect functionality.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Payment Processors:</strong> We use secure third-party payment processors for transaction handling.</p>
                <p><strong>Analytics Services:</strong> We may use analytics services to understand user behavior and improve our service.</p>
                <p><strong>Communication Services:</strong> Third-party services may be used for SMS and email communications.</p>
                <p>These services have their own privacy policies, and we encourage you to review them.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <p className="text-red-800 leading-relaxed">
                  Our service is not intended for children under 18 years of age. We do not knowingly collect personal information 
                  from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, 
                  please contact us immediately.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate 
                safeguards are in place to protect your personal information in accordance with this privacy policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new 
                privacy policy on this page and updating the "Last updated" date. You are advised to review this privacy policy 
                periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="h-6 w-6 text-blue-600 mr-2" />
                12. Contact Us
              </h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@societyxpress.com</p>
                  <p><strong>Email:</strong> support@indikoz.com</p>
                  <p><strong>Phone:</strong> +91 9889881918</p>
                  <p><strong>Address:</strong> Hyderabad, Telangana, India</p>
                  <p><strong>Data Protection Officer:</strong> dpo@societyxpress.com</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;