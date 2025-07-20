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
import { fetchAPI } from "@/shared/rpc/common-function";
import toast from "react-hot-toast";
import { ConfirmPurchaseModal } from "./ConfirmPurchaseModal";

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [paymentId, setPaymentId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);


  const handlePurchase = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(t("Please enter a valid amount"));
      return;
    }

    if (numAmount < 1) {
      setError(t("Minimum recharge amount is $1"));
      return;
    }
    const response = await fetchAPI("/api/payment/create_payment_link", {
      method: "POST",
      body: {
        amount: numAmount,
        success_url: window.location.origin + "/pay_success",
      } as unknown as BodyInit,
    });
    if (!response.success) {
      toast.error(
        t(`Purchase Error:{{error_msg}}`, {
          error_msg: response.error_message,
        }),
        {
          duration: 3000,
          className: "max-w-fit",
        }
      );
      return;
    }
    const purchaseWindow = window.open(
      response.data.pay_url,
      "PurchaseWindow",
      "width=600,height=600"
    );
    setPaymentId(response.data.payment_id);
    if (!purchaseWindow) {
      alert("The purchase window was blocked by the browser.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmPurchase = async (confirmed: boolean = false) => {
    if (confirmed) {
      //auto refresh user info
      onClose();
    }
    setIsConfirmOpen(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // only allow input numbers and decimal points
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmount(value);
      setError("");
    }
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("Recharge Account")}
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label={t("Amount")}
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                  type="text"
                  variant="bordered"
                  isInvalid={!!error}
                  errorMessage={error}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePurchase();
                    }
                  }}
                />
                <p className="text-xs text-default-500">
                  {t("Funds will be added to your account balance")}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleClose}>
                  {t("Cancel")}
                </Button>
                <Button color="primary" onPress={handlePurchase}>
                  {t("Confirm")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>


      {/**Confirm Purchase Modal */}
      <ConfirmPurchaseModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmPurchase}
        paymentId={paymentId}
      />
    </>
  );
};