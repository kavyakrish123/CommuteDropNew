"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { MobileMenu } from "@/components/ui/MobileMenu";

const SUPPORT_EMAIL = "admin@myfluja.com";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "How do I create a delivery request?",
    answer: "Go to the 'My Requests' tab and tap 'Create Request'. Fill in the pickup and drop-off locations, item description, and optionally add a tip. Review and submit your request.",
  },
  {
    question: "How do I help with a delivery?",
    answer: "Go to the 'Available' tab to see requests near you. Tap on a request to view details, then tap 'Help Deliver' to request. The sender will review your profile and approve.",
  },
  {
    question: "What happens if I need to cancel a request after pickup?",
    answer: "If you need to cancel a request after the item has been picked up, please contact our support team immediately. We'll help resolve the situation and ensure both parties are informed.",
  },
  {
    question: "How do I verify pickup and drop-off?",
    answer: "The sender provides an OTP for pickup. When you arrive, enter the OTP to verify pickup. Similarly, use the drop-off OTP provided by the receiver to complete delivery.",
  },
  {
    question: "How are tips handled?",
    answer: "Tips are optional and shown as appreciation for helping. Payment is confirmed through PayNow QR codes. Both parties can confirm payment before delivery completion.",
  },
  {
    question: "What if I have a dispute or issue?",
    answer: "If you encounter any problems, disputes, or need to report an account issue, please contact our support team. We're here to help resolve any concerns.",
  },
  {
    question: "How do I report a problem with my account?",
    answer: "If you experience any account-related issues, suspicious activity, or need assistance, please reach out to our support team via email.",
  },
  {
    question: "Can I have multiple active deliveries?",
    answer: "Yes, you can have up to 3 active deliveries at a time. Make sure to complete your current pickup before accepting new requests.",
  },
  {
    question: "How do nearby notifications work?",
    answer: "When you enable location services and view the 'Available' tab, we'll notify you about new requests within 10km of your location. You won't receive notifications about requests you created.",
  },
  {
    question: "What if I can't find an answer to my question?",
    answer: "If you can't find what you're looking for, please contact our support team. We're available to help with any questions or concerns you may have.",
  },
];

export default function SupportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleEmailClick = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Support Request - Pikkrr`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFFFEE]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Support & Help</h1>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Contact Support Section */}
        <div className="bg-white rounded-soft-lg shadow-card-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#00C57E] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 10h14M5 10l-2 8h18l-2-8" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h2>
              <p className="text-sm text-gray-600 mb-4">
                Contact our support team for assistance with:
              </p>
              <ul className="text-sm text-gray-600 mb-4 space-y-1 list-disc list-inside">
                <li>Account issues or reports</li>
                <li>Canceling requests after pickup</li>
                <li>Disputes or problems</li>
                <li>General questions or concerns</li>
              </ul>
              <button
                onClick={handleEmailClick}
                className="w-full sm:w-auto px-6 py-3 bg-[#00C57E] text-white rounded-soft-lg font-semibold hover:bg-[#00A869] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 10h14M5 10l-2 8h18l-2-8" />
                </svg>
                Email Support: {SUPPORT_EMAIL}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-soft-lg shadow-card-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-600">
              Find answers to common questions below. Can't find what you're looking for? Contact support above.
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {FAQ_DATA.map((faq, index) => (
              <div key={index} className="transition-colors">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openIndex === index ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Support Option */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#00C57E] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">Still need help?</p>
                <p className="text-sm text-gray-600 mb-3">
                  If you couldn't find the answer you're looking for, our support team is ready to assist you.
                </p>
                <button
                  onClick={handleEmailClick}
                  className="text-sm text-[#00C57E] font-semibold hover:text-[#00A869] transition-colors flex items-center gap-1"
                >
                  Contact Support: {SUPPORT_EMAIL}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

