import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import SocietyXpressIcon from './SocietyPlusIcon';

interface FAQProps {
  onBack?: () => void;
}

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: 'About SocietyXpress',
    items: [
      {
        question: 'What is SocietyXpress?',
        answer:
          <>SocietyXpress is a hyper-local service platform by <strong>Indikoz Technologies LLP</strong> that brings professional ironing and laundry services directly to your doorstep. We operate within residential societies and provide convenient doorstep pickup and delivery.</>,
      },
      {
        question: 'Which cities does SocietyXpress operate in?',
        answer:
          'SocietyXpress currently operates in Hyderabad, Telangana, India. We are expanding to more cities soon.',
      },
      {
        question: 'What services do you offer?',
        answer:
          'We currently offer professional ironing with doorstep pickup and delivery. We also have two upcoming services: E-Waste Collection (certified responsible disposal of electronic waste) and Old Clothes Exchange (a community-based clothing swap program), both launching in Q3 2026.',
      },
    ],
  },
  {
    title: 'Ordering & Booking',
    items: [
      {
        question: 'How do I place an order?',
        answer:
          'Sign up or log in to your account, select the ironing service, choose between Normal or Express service, pick a pickup date and time slot (Morning: 8–11 AM or Evening: 4–7 PM), optionally select your items and quantities, then confirm your order. Our partner will come to your door at the chosen time.',
      },
      {
        question: 'How far in advance do I need to book?',
        answer:
          'We require a minimum of 5 hours advance booking for all orders. For Express service, please ensure the order can be completed and delivered by 7 PM on the same day.',
      },
      {
        question: 'Can I book without selecting items in advance?',
        answer:
          'Yes! You can place an order without pre-selecting items. Our pickup partner will help you select items and confirm quantities during collection. Final pricing will be confirmed at that time.',
      },
      {
        question: 'What time slots are available for pickup?',
        answer:
          'We offer two pickup slots: Morning (8:00 AM – 11:00 AM) and Evening (4:00 PM – 7:00 PM). Choose the slot that is most convenient for you when placing your order.',
      },
    ],
  },
  {
    title: 'Service Types & Delivery',
    items: [
      {
        question: 'What is the difference between Normal and Express service?',
        answer:
          'Normal service delivers your clothes within approximately 48 hours of pickup and is offered at standard rates. Express service delivers within 4 hours of pickup on the same day (must be completed by 7 PM). Express service is priced higher due to the faster turnaround.',
      },
      {
        question: 'What happens if my Express order cannot be completed by 7 PM?',
        answer:
          'Our booking system validates time slots automatically to prevent invalid Express bookings. If you select a combination that cannot be completed by 7 PM, the system will prompt you to choose a different slot or switch to Normal service.',
      },
      {
        question: 'Do you offer doorstep pickup and delivery?',
        answer:
          'Yes, all our services include doorstep pickup and delivery at no additional charge. Your clothes are collected from your door and returned neatly pressed.',
      },
    ],
  },
  {
    title: 'Pricing',
    items: [
      {
        question: 'How much does ironing cost?',
        answer:
          'Pricing depends on the item type and service level. For example, shirts start at ₹10 (Normal) / ₹14 (Express), pants at ₹12 (Normal) / ₹17 (Express), blazers at ₹60 (Normal) / ₹90 (Express), and sarees at ₹25–₹50 (Normal) / ₹35–₹70 (Express). A full pricing list is available for download on our website.',
      },
      {
        question: 'Are there any hidden charges?',
        answer:
          'No. We believe in transparent pricing. The rates listed are per item and there are no hidden fees. Final pricing is confirmed during pickup if items were not pre-selected.',
      },
      {
        question: 'Is there a minimum order requirement?',
        answer:
          'No minimum order is required. You can book a service for as few items as you need.',
      },
      {
        question: 'Is steam ironing available?',
        answer:
          'Yes, steam ironing is available for certain items at slightly higher rates. Please refer to the full pricing list for steam ironing rates or contact our support team.',
      },
      {
        question: 'Where can I view the full pricing list?',
        answer:
          'The complete pricing list is available as a PDF on our website. You can download it from the pricing section or contact support@societyxpress.com for details.',
      },
    ],
  },
  {
    title: 'Account & Profile',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click "Get Started" on the homepage, enter your email and password to sign up, and then complete your profile by adding your phone number and society details.',
      },
      {
        question: 'What information is required to complete my profile?',
        answer:
          'To complete your profile you need to provide your phone number and society ID. This helps our partners locate you for pickup and delivery.',
      },
      {
        question: 'Can I edit my profile after setup?',
        answer:
          'Yes. You can update your profile at any time from the profile section in the navigation menu.',
      },
    ],
  },
  {
    title: 'Order Tracking & History',
    items: [
      {
        question: 'Can I track the status of my order?',
        answer:
          'Yes. You can view real-time order status updates from your dashboard and order history section. You will also receive notifications as your order progresses.',
      },
      {
        question: 'Where can I view my past orders?',
        answer:
          'Your complete order history is available in the "Order History" section of your dashboard after logging in.',
      },
    ],
  },
  {
    title: 'Mobile App',
    items: [
      {
        question: 'Is there a mobile app available?',
        answer:
          'Yes! The SocietyXpress Android app is available for download. It supports Android 6.0 and above (version 14.02.2026). You can download it directly from the link provided on our website.',
      },
      {
        question: 'What features does the mobile app offer?',
        answer:
          'The app lets you book services in a few taps, track your orders in real time, receive push notifications for order updates, and access your order history offline.',
      },
    ],
  },
  {
    title: 'Partner Program',
    items: [
      {
        question: 'How can I become a partner?',
        answer:
          'You can join as an Ironing Partner (providing professional ironing) or a Delivery Partner (handling pickup and delivery). Click "Become a Partner" on the homepage to sign up and complete your profile and identity verification.',
      },
      {
        question: 'What do partners need to get started?',
        answer:
          'Partners need to complete their profile including phone number, society ID, and identity verification. Once approved, you can start accepting orders through the partner dashboard.',
      },
      {
        question: 'How do I contact partner support?',
        answer:
          'For partner-related queries, reach out to us at partners@societyxpress.com. Our team is ready to help you.',
      },
    ],
  },
  {
    title: 'Support & Contact',
    items: [
      {
        question: 'How do I contact customer support?',
        answer:
          'You can reach our customer support team by emailing support@societyxpress.com or support@indikoz.com, or by calling +91 9889881918. We are based in Hyderabad, Telangana, India.',
      },
      {
        question: 'What is your refund policy?',
        answer:
          'We have a clear refund policy in place. Please refer to the Refund Policy page (accessible from the footer) for full details, or contact support@societyxpress.com with any refund-related queries.',
      },
    ],
  },
];

const FAQAccordionItem: React.FC<{ item: FAQItem; isOpen: boolean; onToggle: () => void }> = ({
  item,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{item.question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-5 bg-blue-50 border-t border-blue-100">
          <p className="text-gray-700 leading-relaxed pt-4">{item.answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ: React.FC<FAQProps> = ({ onBack }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
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
                <p className="text-xs text-gray-500">Frequently Asked Questions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Find answers to the most common questions about SocietyXpress services, pricing, ordering, and more.
          </p>
        </div>

        <div className="space-y-10">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 px-1">{section.title}</h2>
              <div className="space-y-3">
                {section.items.map((item, idx) => {
                  const key = `${section.title}-${idx}`;
                  return (
                    <FAQAccordionItem
                      key={key}
                      item={item}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggleItem(key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-white rounded-3xl border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-500 mb-6">
            Our support team is happy to help. Reach out and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@societyxpress.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Customer Support
            </a>
            <a
              href="mailto:partners@societyxpress.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Partner Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
