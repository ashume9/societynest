import React from 'react';
import SocietyXpressIcon from './SocietyPlusIcon';
import { Mail, Phone, MapPin, FileText, Shield, RotateCcw } from 'lucide-react';

interface FooterProps {
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onRefundClick?: () => void;
  onFAQClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onTermsClick, onPrivacyClick, onRefundClick, onFAQClick }) => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <SocietyXpressIcon size={48} className="rounded-2xl" />
              <div>
                <h3 className="text-2xl font-bold">SocietyXpress</h3>
                <p className="text-gray-400">Professional Ironing Service</p>
              </div>
            </div>
            <p className="text-gray-300 mb-3 max-w-md">
              Your trusted partner for professional ironing and laundry services.
              Quality care for your clothes with convenient doorstep pickup and delivery.
            </p>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
              SocietyXpress is a service provided by{' '}
              <strong className="text-gray-400">Indikoz Technologies LLP</strong>
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <div className="flex flex-col space-y-1">
                  <a href="mailto:support@indikoz.com" className="text-gray-300 hover:text-blue-400 transition-colors">support@indikoz.com</a>
                  <a href="mailto:support@societyxpress.com" className="text-gray-300 hover:text-blue-400 transition-colors">support@societyxpress.com</a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">+91 9889881918</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">Hyderabad, Telangana, India</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Professional Ironing</li>
              <li>Doorstep Pickup</li>
              <li>Express Delivery</li>
              <li>Fabric Care</li>
              <li className="text-gray-500">E-Waste Collection (Coming Soon)</li>
              <li className="text-gray-500">Clothes Exchange (Coming Soon)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button
                  onClick={onTermsClick}
                  className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onPrivacyClick}
                  className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onRefundClick}
                  className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Refund Policy</span>
                </button>
              </li>
              <li><a href="mailto:support@societyxpress.com" className="hover:text-white transition-colors">Customer Support</a></li>
              <li><a href="mailto:partners@societyxpress.com" className="hover:text-white transition-colors">Partner Support</a></li>
              <li>
                <button onClick={onFAQClick} className="hover:text-blue-400 transition-colors">FAQ</button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SocietyXpress. All rights reserved. A product of{' '}
              <strong>Indikoz Technologies LLP</strong>
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <button
                onClick={onTermsClick}
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
              >
                Terms & Conditions
              </button>
              <button
                onClick={onPrivacyClick}
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={onRefundClick}
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
              >
                Refund Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
