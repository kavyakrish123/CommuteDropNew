"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Terms & Policies</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Platform Positioning */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Platform Model
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Pikkrr</strong> is a <strong>peer-to-peer marketplace</strong> that
                connects senders with commuters. We are <strong>NOT a logistics company</strong>.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Users interact directly with each other</li>
                <li>We facilitate connections but do not handle deliveries</li>
                <li>We are not responsible for disputes between users</li>
                <li>We do not handle payments - all transactions are between users</li>
              </ul>
            </div>
          </section>

          {/* Usage Rules */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Usage Rules
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Prohibited Items</h3>
                <p className="mb-2">The following items are <strong>NOT allowed</strong>:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cigarettes and tobacco products</li>
                  <li>Alcohol and alcoholic beverages</li>
                  <li>Food and perishable items</li>
                  <li>Illegal items or substances</li>
                  <li>Hazardous materials</li>
                  <li>Items requiring special licenses</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Singapore Compliance</h3>
                <p>
                  All deliveries must comply with Singapore laws and regulations. Users are
                  responsible for ensuring their items are legal to transport.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Task Expiry</h3>
                <p>
                  Tasks automatically expire if not accepted within <strong>60 minutes</strong> of
                  creation.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Rider Limitations</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maximum <strong>3 active pickups</strong> at a time</li>
                  <li>Must verify pickup OTP before accepting new tasks</li>
                  <li>Must complete current delivery before accepting more</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                For privacy reasons, pickup and dropoff locations show <strong>postal codes
                only</strong> with optional additional details provided by the sender.
              </p>
              <p>
                Full addresses are only shared between matched users after task acceptance.
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Disclaimers</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Pikkrr is not responsible for:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Item loss, damage, or delays</li>
                <li>Disputes between senders and riders</li>
                <li>Payment issues between users</li>
                <li>Illegal items transported by users</li>
                <li>Compliance with local regulations</li>
              </ul>
              <p className="mt-4">
                By using this platform, you agree to use it at your own risk and acknowledge that
                Pikkrr acts only as a connection platform.
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Link
              href="/auth"
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg text-center font-semibold hover:bg-indigo-700"
            >
              I Understand, Continue to Sign Up
            </Link>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

