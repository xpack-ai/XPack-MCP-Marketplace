import React from "react";
import { Navigation } from "@/shared/components/Navigation";
import { Footer } from "@/shared/components/Footer";
import { PaymentSuccess } from "@/components/payment/Success";

export default async function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <PaymentSuccess />
      </main>
      <Footer />
    </div>
  );
}
