"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Button,
} from "@nextui-org/react";
import { Package } from "lucide-react";
import { Navigation } from "@/shared/components/Navigation";

export const ProductNotFound: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-default-50 to-primary-50">
      <Navigation />
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-sm mx-4 sm:mx-0 sm:w-96 shadow-2xl">
          <CardBody className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-danger-100 rounded-full flex items-center justify-center">
              <Package className="text-danger" size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              {t("Product Not Found")}
            </h1>
            <p className="text-default-600 mb-6">
              {t(
                "The product you're looking for doesn't exist or has been removed."
              )}
            </p>
            <Button
              onPress={() => router.push("/")}
              color="primary"
              size="lg"
            >
              {t("Back to Store")}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};