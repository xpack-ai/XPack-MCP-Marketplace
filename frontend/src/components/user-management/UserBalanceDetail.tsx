"use client";

import React from "react";
import { Button} from "@nextui-org/react";
import { ChevronLeftIcon } from "lucide-react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { withComponentInjection } from "@/shared/hooks/useComponentInjection";
import AccountBalanceTable from "../dashboard/AccountBalanceTable";

interface UserBalanceDetailProps {
  userId: string;
  userEmail: string;
  onCancel: () => void;
}

const BaseUserBalanceDetail: React.FC<UserBalanceDetailProps> = ({
  userId,
  userEmail,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full py-8 h-full flex flex-col">
      {/* page title */}
      <div className="flex items-center justify-between mb-6 px-8">
        <div className="flex items-center gap-3">
          <Button isIconOnly onPress={onCancel} variant="flat" size="sm">
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {t("Account Balance")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
         <span>{t("Email")}: </span>{userEmail || '-'}
        </div>
      </div>
      <div className="px-8">
        <AccountBalanceTable userId={userId} />
      </div>
    </div>
  );
};
export const UserBalanceDetail = withComponentInjection(
  "components/user-management/UserBalanceDetail",
  BaseUserBalanceDetail
);
