import { Suspense } from "react";
import OTPVerificationContent from "./components/OTPVerificationContent";

export default function OTPVerification() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <OTPVerificationContent />
    </Suspense>
  );
}
