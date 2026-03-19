import React, { useState, useEffect } from 'react';
import SocietyXpressIcon from './SocietyPlusIcon';
import NewsletterSubscription from './NewsletterSubscription';
import { 
  Shirt, 
  Clock, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Sparkles,
  Shield,
  Truck,
  UserPlus,
  LogIn,
  ChevronUp,
  Menu,
  X,
  Home,
  Info,
  Award,
  DollarSign,
  Users,
  Download,
  Smartphone
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSwitchToPartner?: (mode?: 'signup' | 'signin') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSwitchToPartner }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setShowScrollTop(scrollTop > 300);

      // Update active section based on scroll position
      const sections = ['hero', 'problems', 'benefits', 'services', 'pricing', 'upcoming-services', 'partners'];
      const sectionElements = sections.map(id => document.getElementById(id));
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && scrollTop >= element.offsetTop - 100) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setShowFloatingNav(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigationItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'problems', label: 'Problems', icon: Info },
    { id: 'benefits', label: 'Benefits', icon: Award },
    { id: 'services', label: 'Services', icon: Shirt },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'upcoming-services', label: 'Coming Soon', icon: Sparkles },
    { id: 'download-app', label: 'Download App', icon: Download },
    { id: 'partners', label: 'Partners', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Fixed Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <SocietyXpressIcon size={40} className="rounded-2xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SocietyXpress
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                    activeSection === item.id ? 'text-indigo-600' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={onGetStarted}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <SocietyXpressIcon size={80} className="rounded-3xl" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SocietyXpress
              </span>
              <br />
              <span className="text-3xl md:text-4xl">Professional Ironing Service</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Get your clothes professionally pressed and delivered right to your doorstep.
              Quality ironing service designed specifically for society residents.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              A service by{' '}
              <strong>Indikoz Technologies LLP</strong>
            </p>
            <button
              onClick={onGetStarted}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Problems We Solve */}
      <section id="problems" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Problems We Solve
            </h2>
            <p className="text-xl text-gray-600">
              Say goodbye to ironing hassles and hello to convenience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Time to Iron</h3>
              <p className="text-gray-600">
                Busy schedules leave no time for ironing. We handle it while you focus on what matters.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shirt className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Poor Ironing Quality</h3>
              <p className="text-gray-600">
                Wrinkled clothes and burnt fabrics are a thing of the past with our expert service.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inconvenient Pickup</h3>
              <p className="text-gray-600">
                No more trips to the laundry. We pickup and deliver right to your apartment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose SocietyXpress Ironing?
            </h2>
            <p className="text-xl text-indigo-100">
              Experience the difference with our premium ironing service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Professional Quality</h3>
              <p className="text-indigo-100 text-sm">
                Expert pressing techniques for perfect results every time
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fast Turnaround</h3>
              <p className="text-indigo-100 text-sm">
                Express service available with 4-hour delivery option
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fabric Care</h3>
              <p className="text-indigo-100 text-sm">
                Specialized care for different fabric types and delicate items
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Doorstep Service</h3>
              <p className="text-indigo-100 text-sm">
                Convenient pickup and delivery at your preferred time slots
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Options */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Service Options
            </h2>
            <p className="text-xl text-gray-600">
              Choose the service that fits your schedule
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-3xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Normal Service</h3>
                <p className="text-gray-600">24-hour delivery</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Standard pressing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Quality guarantee</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Affordable rates</span>
                </li>
              </ul>
              <p className="text-center">
                <a href="/SocietyXpress_Pricing_List_PhonePe_Compliant.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 font-medium underline underline-offset-2">
                  View Pricing
                </a>
              </p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Express Service</h3>
                <p className="text-gray-600">4-hour delivery</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-gray-700">Express pressing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-gray-700">Same-day delivery</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-gray-700">Emergency service</span>
                </li>
              </ul>
              <p className="text-center">
                <a href="/SocietyXpress_Pricing_List_PhonePe_Compliant.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 font-medium underline underline-offset-2">
                  View Pricing
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing List</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transparent, affordable pricing for all your ironing needs. No hidden charges.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 min-w-[700px]">
              <div className="grid grid-cols-[48px_120px_1fr_80px_80px_80px_80px] bg-gray-800 text-white text-xs font-semibold">
                <div className="px-3 py-3 text-center">S.No</div>
                <div className="px-3 py-3">Category</div>
                <div className="px-3 py-3">Item</div>
                <div className="px-3 py-3 text-center col-span-2 border-l border-gray-600">
                  <div className="text-center mb-0.5 text-gray-300 text-[10px] uppercase tracking-wider">Normal Ironing</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-center">Normal</div>
                    <div className="text-center">Express</div>
                  </div>
                </div>
                <div className="px-3 py-3 text-center col-span-2 border-l border-gray-600">
                  <div className="text-center mb-0.5 text-gray-300 text-[10px] uppercase tracking-wider">Steam Ironing</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-center">Normal</div>
                    <div className="text-center">Express</div>
                  </div>
                </div>
              </div>

              {[
                { sno: 1, category: 'Wearables', item: 'Shirt/T-Shirt/Tops', ni_n: 10, ni_e: 14, si_n: 14, si_e: 18 },
                { sno: 2, category: 'Wearables', item: 'Jeans/Pants/Shorts', ni_n: 10, ni_e: 14, si_n: 14, si_e: 18 },
                { sno: 3, category: 'Wearables', item: 'Pyjama/Chudidar', ni_n: 10, ni_e: 14, si_n: 14, si_e: 18 },
                { sno: 4, category: 'Wearables', item: 'Jacket', ni_n: 10, ni_e: 14, si_n: 14, si_e: 18 },
                { sno: 5, category: 'Wearables', item: 'Blouse', ni_n: 10, ni_e: 14, si_n: 14, si_e: 18 },
                { sno: 6, category: 'Wearables', item: 'Dupatta', ni_n: 10, ni_e: 14, si_n: 14, si_e: 18 },
                { sno: 7, category: 'Wearables', item: 'Starch Shirt', ni_n: 22, ni_e: 30, si_n: 25, si_e: 40 },
                { sno: 8, category: 'Wearables', item: 'Long Kurtha', ni_n: 18, ni_e: 25, si_n: 25, si_e: 40 },
                { sno: 9, category: 'Wearables', item: 'Long Sherwani', ni_n: 25, ni_e: 35, si_n: 30, si_e: 45 },
                { sno: 10, category: 'Wearables', item: 'Dhoti / Lungi', ni_n: 18, ni_e: 25, si_n: 22, si_e: 35 },
                { sno: 11, category: 'Wearables', item: 'Blazer', ni_n: 60, ni_e: 90, si_n: 75, si_e: 110 },
                { sno: 12, category: 'Wearables', item: 'Saree', ni_n: 25, ni_e: 35, si_n: 30, si_e: 45 },
                { sno: 13, category: 'Wearables', item: 'Saree Pattu', ni_n: 40, ni_e: 55, si_n: 45, si_e: 70 },
                { sno: 14, category: 'Wearables', item: 'Saree Work', ni_n: 50, ni_e: 70, si_n: 60, si_e: 90 },
                { sno: 15, category: 'Accessories', item: 'Pillow Cover', ni_n: 10, ni_e: 14, si_n: 14, si_e: 18 },
                { sno: 16, category: 'Accessories', item: 'Bed Sheets (Single)', ni_n: 25, ni_e: 35, si_n: 30, si_e: 45 },
                { sno: 17, category: 'Accessories', item: 'Bed Sheets (Doubles)', ni_n: 40, ni_e: 55, si_n: 45, si_e: 70 },
                { sno: 18, category: 'Accessories', item: 'Curtains (Single)', ni_n: 40, ni_e: 55, si_n: 45, si_e: 70 },
                { sno: 19, category: 'Accessories', item: 'Curtains (Doubles)', ni_n: 65, ni_e: 90, si_n: 75, si_e: 110 },
              ].map((row, idx) => (
                <div
                  key={row.sno}
                  className={`grid grid-cols-[48px_120px_1fr_80px_80px_80px_80px] text-sm border-b border-gray-200 last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                >
                  <div className="px-3 py-3 text-center text-gray-500 font-medium">{row.sno}</div>
                  <div className="px-3 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.category === 'Wearables' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {row.category}
                    </span>
                  </div>
                  <div className="px-3 py-3 text-gray-800 font-medium">{row.item}</div>
                  <div className="px-3 py-3 text-center font-semibold text-gray-900 border-l border-gray-100">₹{row.ni_n}</div>
                  <div className="px-3 py-3 text-center font-semibold text-gray-900">₹{row.ni_e}</div>
                  <div className="px-3 py-3 text-center font-semibold text-gray-900 border-l border-gray-100">₹{row.si_n}</div>
                  <div className="px-3 py-3 text-center font-semibold text-gray-900">₹{row.si_e}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">All prices in INR. Effective 1 February 2026.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience Professional Ironing?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of satisfied society residents who trust us with their ironing needs.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>Start Your First Order</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Upcoming Services */}
      <section id="upcoming-services" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Coming Soon: Expanding Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're excited to introduce two new eco-friendly services that will make your life easier while contributing to a sustainable future.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* E-Waste Collection Service */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">E-Waste Collection</h3>
                <p className="text-gray-600 mb-6">
                  Responsible disposal of your electronic waste with convenient doorstep pickup
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Scheduled Pickup</h4>
                    <p className="text-gray-600 text-sm">Book your preferred time slot for hassle-free collection</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Certified Processing</h4>
                    <p className="text-gray-600 text-sm">Safe and environmentally responsible disposal methods</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Data Security</h4>
                    <p className="text-gray-600 text-sm">Complete data destruction for devices with storage</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 mb-6">
                <h4 className="font-semibold text-green-900 mb-3">Trusted Partners</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-800">EcoRecycle Solutions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-800">GreenTech Disposal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-800">SafeWaste India</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-800">TechCycle Pro</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <span className="inline-block bg-green-100 text-green-800 text-sm px-4 py-2 rounded-full font-medium">
                  🚀 Launching Q3 CY2026
                </span>
              </div>
            </div>

            {/* Old Clothes Exchange Service */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V4a1 1 0 011-1h6a1 1 0 011 1v3M9 7h6m0 0v6m0-6l-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Old Clothes Exchange</h3>
                <p className="text-gray-600 mb-6">
                  Transform your old clothes into something new through our sustainable exchange program
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Community Exchange</h4>
                    <p className="text-gray-600 text-sm">Connect with neighbors to swap clothes and accessories</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality Assessment</h4>
                    <p className="text-gray-600 text-sm">Professional evaluation to ensure fair exchanges</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Sustainable Fashion</h4>
                    <p className="text-gray-600 text-sm">Reduce waste while refreshing your wardrobe</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 mb-6">
                <h4 className="font-semibold text-purple-900 mb-3">Exchange Partners</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-800">Fashion Forward</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-800">Style Swap Hub</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-800">Wardrobe Refresh</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-800">Eco Fashion Co.</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <span className="inline-block bg-purple-100 text-purple-800 text-sm px-4 py-2 rounded-full font-medium">
                  🚀 Launching Q3 CY2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section id="download-app" className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Download Our Mobile App
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get the SocietyXpress mobile app for an even better experience. Book services, track orders, and manage your account on the go.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* App Features */}
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">SocietyXpress Mobile App</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Quick Booking</h4>
                        <p className="text-gray-600 text-sm">Book ironing services in just a few taps</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Real-time Tracking</h4>
                        <p className="text-gray-600 text-sm">Track your orders from pickup to delivery</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Push Notifications</h4>
                        <p className="text-gray-600 text-sm">Get instant updates about your orders</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Offline Access</h4>
                        <p className="text-gray-600 text-sm">View order history even without internet</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Section */}
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white mb-6">
                    <Smartphone className="h-16 w-16 mx-auto mb-4" />
                    <h4 className="text-xl font-bold mb-2">Android App Available</h4>
                    <p className="text-blue-100 mb-6">
                      Download the latest version of our Android app
                    </p>
                    
                    <a
                      href="https://1drv.ms/u/c/022e5e87849664e0/IQAUcvrtm9nCRrT8D57CzEVHAU_5JJav_qjX4-KojrXVUTc?e=VH9UCR"
                     target="_blank"
                     rel="noopener noreferrer"
                      download="SocietyXpress.apk"
                      className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download APK</span>
                    </a>
                    
                    <p className="text-blue-200 text-sm mt-4">
                      Version 14.02.2026 • Compatible with Android 6.0+
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Installation Instructions</h4>
                    <ol className="text-left text-sm text-gray-600 space-y-2">
                      <li className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                        <span>Download the APK file to your Android device</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                        <span>Enable "Install from unknown sources" in Settings</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                        <span>Open the downloaded file and follow installation prompts</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                        <span>Launch the app and sign in with your account</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Partners Section */}
      <section id="partners" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join Our Partner Network
            </h2>
            <p className="text-xl text-gray-600">
              Become a trusted partner and grow your business with SocietyXpress
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shirt className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ironing Partners</h3>
              <p className="text-gray-600 mb-6">
                Professional ironing specialists providing quality service to society residents
              </p>
              <button
                onClick={() => onSwitchToPartner?.('signup')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <UserPlus className="h-4 w-4" />
                <span>Join as Partner</span>
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Partners</h3>
              <p className="text-gray-600 mb-6">
                Reliable delivery professionals ensuring timely pickup and delivery services
              </p>
              <button
                onClick={() => onSwitchToPartner?.('signup')}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <UserPlus className="h-4 w-4" />
                <span>Join as Partner</span>
              </button>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Already a partner?</p>
            <button
              onClick={() => onSwitchToPartner?.('signin')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-2 mx-auto"
            >
              <LogIn className="h-4 w-4" />
              <span>Partner Login</span>
            </button>
          </div>
        </div>
      </section>

      {/* Floating Navigation */}
      {showFloatingNav && (
        <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-40 md:hidden">
          <div className="flex flex-col space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  activeSection === item.id
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setShowFloatingNav(!showFloatingNav)}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg z-50 md:hidden"
      >
        {showFloatingNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 bg-white text-gray-600 p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-40 md:bottom-4"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default LandingPage;