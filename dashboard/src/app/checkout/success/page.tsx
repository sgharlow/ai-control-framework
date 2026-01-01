'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface SessionDetails {
  customerEmail: string;
  teamName: string;
  plan: string;
  status: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/checkout?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to retrieve session');
        }

        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const copySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-gray-600">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700"
          >
            Return to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AI Control Framework Pro!
          </h1>
          <p className="text-gray-600 mb-8">
            Your subscription is now active. Here's what happens next:
          </p>

          {/* Session Details */}
          {session && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">
                Subscription Details
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Plan</dt>
                  <dd className="font-medium text-gray-900 capitalize">
                    {session.plan}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Team</dt>
                  <dd className="font-medium text-gray-900">
                    {session.teamName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">
                    {session.customerEmail}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status</dt>
                  <dd className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-medium text-green-600 capitalize">
                      {session.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Next Steps */}
          <div className="text-left mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-semibold">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    Check your email
                  </p>
                  <p className="text-sm text-gray-500">
                    We've sent your license key and getting started guide.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    Invite your team
                  </p>
                  <p className="text-sm text-gray-500">
                    Add team members to start tracking DRS together.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    Configure your alerts
                  </p>
                  <p className="text-sm text-gray-500">
                    Set up DRS alerts to catch issues early.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Reference ID */}
          {sessionId && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <p className="text-sm text-gray-500 mb-2">
                Reference ID (save for your records):
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-xs bg-gray-100 px-3 py-2 rounded-lg font-mono">
                  {sessionId.slice(0, 20)}...
                </code>
                <button
                  onClick={copySessionId}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Copy full ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-600 transition"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
