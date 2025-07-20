"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button } from "@nextui-org/react";
import { Package, ArrowLeft } from "lucide-react";
import { Navigation } from "@/shared/components/Navigation";

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-default-50 to-primary-50">
      <Navigation />
      <div className="flex items-center justify-center py-20">
        <Card className="w-96 shadow-2xl">
          <CardBody className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-danger-100 rounded-full flex items-center justify-center">
              <Package className="text-danger" size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-4">{t("404 Not Found")}</h1>
            <Button
              onPress={() => router.push("/")}
              color="primary"
              size="lg"
              startContent={<ArrowLeft size={18} />}
            >
              {t("Back to Home")}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
