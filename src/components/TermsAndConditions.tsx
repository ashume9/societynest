import React from 'react';
import { ArrowLeft, FileText, Calendar, Shield, Users, AlertTriangle } from 'lucide-react';
import SocietyXpressIcon from './SocietyPlusIcon';

interface TermsAndConditionsProps {
  onBack?: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onBack }) => {
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
                <p className="text-xs text-gray-500">Terms & Conditions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
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
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using SocietyXpress services, you accept and agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                2. Service Description
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SocietyXpress provides hyper-local services including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Professional ironing and laundry services</li>
                <li>Doorstep pickup and delivery</li>
                <li>E-waste collection (coming soon)</li>
                <li>Old clothes exchange program (coming soon)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Account Information:</strong> Users must provide accurate and complete information during registration.</p>
                <p><strong>Service Usage:</strong> Services must be used only for legitimate purposes and in accordance with these terms.</p>
                <p><strong>Payment:</strong> Users are responsible for timely payment of all charges incurred.</p>
                <p><strong>Property Care:</strong> Users must ensure items given for service are clean and free from hazardous materials.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Service Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Pickup and Delivery:</strong> We provide doorstep pickup and delivery services within specified time slots.</p>
                <p><strong>Service Types:</strong> Normal (48 hours), Priority (24 hours), and Express (4 hours) services are available.</p>
                <p><strong>Quality Assurance:</strong> We strive to provide high-quality service but cannot guarantee perfection for all fabric types.</p>
                <p><strong>Lost or Damaged Items:</strong> While we take utmost care, SocietyXpress liability for lost or damaged items is limited to the service charge paid.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Partner Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Partner Registration:</strong> Partners must complete profile setup and provide valid identity documents.</p>
                <p><strong>Service Standards:</strong> Partners must maintain professional service standards and follow company guidelines.</p>
                <p><strong>Earnings:</strong> Partners earn 75% of ironing charges and 2.5% of order value for pickup/delivery services.</p>
                <p><strong>Working Schedule:</strong> Partners must work 6 days per week with one designated holiday.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Pricing:</strong> Service charges are clearly displayed and may vary based on service type and item category.</p>
                <p><strong>Payment Methods:</strong> We accept cash on delivery and digital payment methods.</p>
                <p><strong>Refunds:</strong> Refunds are processed according to our refund policy for valid claims.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
                7. Limitation of Liability
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed">
                  SocietyXpress shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from 
                  your use of the service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
                to understand our practices regarding the collection and use of your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                SocietyXpress reserves the right to modify these terms at any time. Users will be notified of significant changes 
                via email or through the application. Continued use of the service after modifications constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                Either party may terminate the service relationship at any time. SocietyXpress reserves the right to suspend or 
                terminate accounts that violate these terms or engage in fraudulent activities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under 
                these terms shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed">
                  For questions about these Terms and Conditions, please contact us at:
                </p>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p><strong>Email:</strong> support@societyxpress.com</p>
                  <p><strong>Email:</strong> support@indikoz.com</p>
                  <p><strong>Phone:</strong> +91 9889881918</p>
                  <p><strong>Address:</strong> Hyderabad, Telangana, India</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsAndConditions;