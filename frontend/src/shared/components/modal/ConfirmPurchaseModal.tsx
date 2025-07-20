import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import { useState, useRef, useEffect } from "react";
import { CheckIcon, XCircleIcon, ClockIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { useTranslation } from "react-i18next";
import { fetchAPI } from "@/shared/rpc/common-function";
interface ConfirmPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentId: string;
}

export const ConfirmPurchaseModal = ({
  isOpen,
  onClose,
  onConfirm,
  paymentId,
}: ConfirmPurchaseModalProps) => {
  const { t } = useTranslation();

  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const checkIntervalRef = useRef<NodeJS.Timeout>();
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const { mutate } = useSWRConfig();

  const checkPaymentStatus = () => {
    return new Promise(async (resolve) => {
      try {
        const response = await fetchAPI(
          `/api/payment/order_status?payment_id=${paymentId}`,
          {
            method: "GET",
          }
        );

        if (response.success && response.data.status === 1) {
          setPaymentStatus("completed");
          clearInterval(intervalRef.current);
          clearInterval(checkIntervalRef.current);
          mutate("/api/user/info"); // manually trigger user info refresh
          resolve(true);
        }
        resolve(false);
      } catch (error) {
        console.error("Failed to check payment status:", error);
        resolve(false);
      }
    });
  };

  const handleManualConfirm = async () => {
    setIsLoading(true);
    const isCompleted = await checkPaymentStatus();
    if (!isCompleted) {
      toast.error(
        t(
          "Payment not completed yet. Please complete the payment before proceeding."
        )
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      // start countdown
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            clearInterval(checkIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Check payment status every 15 seconds
      checkIntervalRef.current = setInterval(checkPaymentStatus, 15000);

      return () => {
        clearInterval(intervalRef.current);
        clearInterval(checkIntervalRef.current);
      };
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Add status icon components
  const StatusIcon = () => {
    if (paymentStatus === "completed") {
      return <CheckIcon className="w-16 h-16 text-green-500" />;
    } else if (countdown <= 0) {
      return <XCircleIcon className="w-16 h-16 text-red-500" />;
    }
    return (
      <div className="animate-spin">
        <ClockIcon className="w-16 h-16 text-yellow-500" />
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isDismissable={false}>
      <ModalContent>
        <ModalBody className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t("Confirm Purchase")}
          </h3>
          <div className="flex flex-col items-center mb-6">
            <StatusIcon />
            {paymentStatus === "completed" ? (
              <div className="mb-6 mt-4 text-center">
                <p className="text-green-500 text-sm  mb-2">
                  {t("Payment completed")}
                </p>
              </div>
            ) : countdown > 0 ? (
              <div className="text-sm text-default-500 text-center mt-4">
                {t("Waiting for payment, remaining time: ") +
                  formatTime(countdown)}
              </div>
            ) : (
              <div className="mb-6 mt-4 text-center">
                <p className="text-red-500 text-sm  mb-2">
                  {t("Payment timeout")}
                </p>
                <p className="text-xs text-default-500">
                  {t("Please restart the payment process")}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            {paymentStatus === "pending" ? (
              <>
                <Button variant="bordered" onPress={onClose}>
                  {countdown > 0 ? t("Cancel") : t("Close")}
                </Button>
                {countdown > 0 && (
                  <Button
                    color="primary"
                    onPress={handleManualConfirm}
                    isLoading={isLoading}
                  >
                    {t("Yes, I've Paid")}
                  </Button>
                )}
              </>
            ) : (
              <Button
                onPress={onConfirm}
              >
                {t("Start Now!!")}
              </Button>
            )}
          </div>
          {paymentStatus === "pending" && countdown > 0 && (
            <p className="text-[10px] text-default-500 mb-4 whitespace-pre-line">
              {t(
                "After the transaction is completed, the status will be automatically refreshed. If there is no response for a long time, you can manually click the [Yes, I've Paid] button to refresh the status."
              )}
            </p>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
