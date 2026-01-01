import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Cancel Icon */}
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-gray-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Checkout Cancelled
          </h1>
          <p className="text-gray-600 mb-8">
            No worries! Your card was not charged. You can continue using the
            free tier.
          </p>

          {/* Options */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-brand-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Link>

            <a
              href="mailto:support@aicontrolframework.dev"
              className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Questions? Contact Support
            </a>
          </div>

          {/* FAQ */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">
              Common Questions
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">
                  Can I try Pro features first?
                </p>
                <p className="text-gray-500">
                  Yes! Email us for a 14-day Pro trial.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Do you offer refunds?
                </p>
                <p className="text-gray-500">
                  Yes, we offer a 30-day money-back guarantee.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Need a custom quote for your team?
                </p>
                <p className="text-gray-500">
                  Contact us for enterprise pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
