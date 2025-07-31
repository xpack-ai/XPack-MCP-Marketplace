"use client";

import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { Plus } from "lucide-react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";

function FaqClient() {
  const { faqItems } = usePlatformConfig();
  const { t } = useTranslation();
  // Custom indicator component with plus sign that fades out when expanded
  const CustomIndicator = ({ isOpen }: { isOpen?: boolean }) => (
    <Plus
      className={`text-black transition-all duration-300 ${
        isOpen ? "rotate-0 opacity-0" : "rotate-0 opacity-100"
      }`}
      size={16}
    />
  );
  if (faqItems.length === 0) return null;

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6" id="faqs">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center">
          {t("FAQs")}
        </h2>
        {/**content */}
        <div className="relative bg-white rounded-lg">
          <Accordion variant="light">
            {faqItems.map((faq, index) => (
              <AccordionItem
                key={index}
                aria-label={faq.question}
                title={
                  <span className="text-base sm:text-lg font-medium">
                    {faq.question}
                  </span>
                }
                className="pt-2 px-2"
                indicator={({ isOpen }) => <CustomIndicator isOpen={isOpen} />}
              >
                <div className="text-sm sm:text-base text-foreground-600 leading-relaxed space-y-2">
                  {faq.answer}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return <FaqClient />;
}
