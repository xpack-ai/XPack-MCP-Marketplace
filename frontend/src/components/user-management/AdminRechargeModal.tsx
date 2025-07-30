import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { User } from "@/types/user";

interface AdminRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRecharge: (id: string, amount: number) => Promise<boolean>;
}

export const AdminRechargeModal: React.FC<AdminRechargeModalProps> = ({
  isOpen,
  onClose,
  user,
  onRecharge,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许输入数字和小数点
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmount(value);
      setError("");
    }
  };

  const handleRecharge = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(t("Please enter a valid amount"));
      return;
    }

    if (numAmount < 1) {
      setError(t("Minimum recharge amount is $1"));
      return;
    }

    if (!user) {
      setError(t("User not selected"));
      return;
    }

    setLoading(true);
    try {
      const success = await onRecharge(user.id, numAmount);

      if (success) {
        handleClose();
      }
    } catch (error) {
      setError(t("Network error, please try again"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("Recharge User")}
            </ModalHeader>
            <ModalBody>
              {user && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {t("User")}: {user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("Current Balance")}: ${user.balance.toFixed(2)}
                  </p>
                </div>
              )}
              <Input
                autoFocus
                label={t("Recharge Amount")}
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
                isInvalid={!!error}
                errorMessage={error}
                type="number"
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                {t("Cancel")}
              </Button>
              <Button
                color="primary"
                onPress={handleRecharge}
                isLoading={loading}
                isDisabled={!amount || !!error}
              >
                {t("Confirm")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
