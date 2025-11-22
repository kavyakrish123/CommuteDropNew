import Link from "next/link";
import { PlatformDisclaimer } from "@/components/ui/PlatformDisclaimer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">CommuteDrop</h1>
          <p className="text-xl text-gray-700">
            Deliver on the way. Send or carry items along your commute.
          </p>
        </div>
        <PlatformDisclaimer />
        <Link
          href="/auth"
          className="inline-block bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] transition-all duration-150 shadow-md"
        >
          Get started →
        </Link>
      </div>
    </div>
  );
}

