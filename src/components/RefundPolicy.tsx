import React from 'react';
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import SocietyXpressIcon from './SocietyPlusIcon';

interface RefundPolicyProps {
  onBack?: () => void;
}

const RefundPolicy: React.FC<RefundPolicyProps> = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                <p className="text-xs text-gray-500">Refund Policy</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
            <p className="text-gray-600">Last updated: September 14, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">

            <section className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
                <p className="text-gray-700 leading-relaxed">
                  SocietyXpress is a service by <span className="font-bold">Indikoz Technologies LLP</span>, a company registered in India.
                  All services offered under the SocietyXpress brand are operated and managed by <strong>Indikoz Technologies LLP</strong>.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <p className="text-blue-800 leading-relaxed font-medium">
                  At SocietyXpress, we are committed to your satisfaction. This Refund Policy outlines the circumstances under
                  which refunds are granted and the process for requesting them.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                1. Eligible Refund Scenarios
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h3 className="font-semibold text-green-800 mb-2">Service Not Delivered</h3>
                  <p className="text-green-700 text-sm">
                    A full refund will be issued if your order was accepted and payment collected but the service was not delivered
                    due to reasons attributable to SocietyXpress (partner no-show, system failure, etc.).
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h3 className="font-semibold text-green-800 mb-2">Damaged or Lost Items</h3>
                  <p className="text-green-700 text-sm">
                    If items are damaged or lost while in our custody, a refund equivalent to the service charges paid will be
                    processed. Claims must be raised within 24 hours of delivery.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h3 className="font-semibold text-green-800 mb-2">Service Quality Issues</h3>
                  <p className="text-green-700 text-sm">
                    If the ironing quality does not meet reasonable standards (stains, burns, or improper pressing), a partial or
                    full refund of the ironing charges may be issued after review.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h3 className="font-semibold text-green-800 mb-2">Order Cancellation Before Pickup</h3>
                  <p className="text-green-700 text-sm">
                    If you cancel your order before the partner picks up your items, a full refund will be processed for any
                    advance payments made.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <XCircle className="h-6 w-6 text-red-600 mr-2" />
                2. Non-Refundable Scenarios
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h3 className="font-semibold text-red-800 mb-2">Customer-Side Cancellation After Pickup</h3>
                  <p className="text-red-700 text-sm">
                    Cancellations requested after the partner has already picked up your items are not eligible for a refund,
                    as the service has commenced.
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h3 className="font-semibold text-red-800 mb-2">Pre-existing Damage</h3>
                  <p className="text-red-700 text-sm">
                    SocietyXpress is not liable for damage that existed on items prior to pickup. We recommend inspecting and
                    notifying us of any pre-existing damage at the time of pickup.
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h3 className="font-semibold text-red-800 mb-2">Fabric-Related Limitations</h3>
                  <p className="text-red-700 text-sm">
                    Refunds will not be issued for outcomes arising from the inherent nature of delicate, specialty, or non-ironable
                    fabrics (sequined, beaded, or heavily embellished items).
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h3 className="font-semibold text-red-800 mb-2">Late Claims</h3>
                  <p className="text-red-700 text-sm">
                    Refund requests submitted more than 48 hours after delivery will not be eligible for consideration.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="h-6 w-6 text-blue-600 mr-2" />
                3. Refund Process & Timeline
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Submit a Refund Request</h3>
                    <p className="text-sm text-gray-600 mt-1">Contact us via email at support@societyxpress.com or support@indikoz.com, or call +91 9889881918 within 48 hours of delivery. Provide your order ID, issue description, and supporting photos if applicable.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Review & Investigation</h3>
                    <p className="text-sm text-gray-600 mt-1">Our team will review your claim within 2 business days. We may contact you for additional information or arrange a re-inspection of the items.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Decision Notification</h3>
                    <p className="text-sm text-gray-600 mt-1">You will be notified of the refund decision via email or SMS within 3 business days of submitting your claim.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Refund Processing</h3>
                    <p className="text-sm text-gray-600 mt-1">Approved refunds are processed within 5-7 business days. The amount will be credited back to the original payment method used at the time of purchase.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Refund Methods</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Method</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Refund Method</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">UPI / Digital Wallet</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Reversed to original account</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">3-5 business days</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Debit / Credit Card</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Reversed to original card</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">5-7 business days</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Cash on Delivery</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Bank transfer or UPI</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">5-7 business days</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Net Banking</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Reversed to bank account</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">5-7 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
                5. Partial Refunds
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed mb-3">
                  In certain circumstances, SocietyXpress may issue a partial refund rather than a full refund. These include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Only a portion of the items were damaged or lost</li>
                  <li>Service quality issues affecting only select items in the order</li>
                  <li>Partial cancellation of a multi-item order</li>
                  <li>Situations where the customer contributed to the issue</li>
                </ul>
                <p className="text-gray-700 mt-3 text-sm">
                  The refund amount in such cases will be determined at the sole discretion of SocietyXpress after reviewing the claim.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Dispute Resolution</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  If you are not satisfied with our refund decision, you may escalate the matter by:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Sending a detailed escalation email to <strong>grievances@societyxpress.com</strong></li>
                  <li>Providing all previous correspondence and documentation related to your claim</li>
                  <li>Our Grievance Officer will review and respond within 7 business days</li>
                </ol>
                <p className="text-sm text-gray-500 mt-2">
                  All disputes are subject to the jurisdiction of courts in Hyderabad, Telangana, India.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                SocietyXpress reserves the right to update this Refund Policy at any time. Changes will be communicated via
                email or in-app notification. Continued use of the service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="h-6 w-6 text-blue-600 mr-2" />
                8. Contact Us
              </h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  For refund requests or inquiries, please reach out to us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> support@societyxpress.com</p>
                  <p><strong>Email:</strong> support@indikoz.com</p>
                  <p><strong>Phone:</strong> +91 9889881918</p>
                  <p><strong>Grievances:</strong> grievances@societyxpress.com</p>
                  <p><strong>Address:</strong> Hyderabad, Telangana, India</p>
                  <p className="text-sm text-gray-500 mt-2">Support hours: Monday to Saturday, 9:00 AM - 6:00 PM IST</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;
