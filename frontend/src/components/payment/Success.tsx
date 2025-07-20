"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";

interface PaymentSuccessProps { }

// Client-side wrapper for interactive functionality
function PaymentSuccessClient({ }: PaymentSuccessProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center justify-center px-6 py-24 bg-white max-w-7xl mx-auto ">
      <div className="flex flex-col items-center justify-center border-4 border-green-500 rounded-lg p-20 w-full">
        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-center">
          {t("Payment Successful!")}
        </h1>
        <p className="text-xl text-center text-gray-600 mb-4">
          {t(
            "Congratulations, your payment has been processed successfully. Thank you for your love!"
          )}
        </p>
      </div>
    </section>
  );
}

// Export the client component
export function PaymentSuccess(props: PaymentSuccessProps) {
  return <PaymentSuccessClient {...props} />;
}
